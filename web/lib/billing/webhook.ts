// Razorpay webhook processing, independent of the HTTP framework so it can be tested directly.
import "server-only";
import { createHash } from "node:crypto";
import type { UserStore } from "@/lib/store/types";
import { verifyWebhookSignature, type RazorpayApi } from "./razorpay";
import { OwnershipMismatchError, syncRazorpaySubscription } from "./sync";

export interface WebhookRequest {
  rawBody: string;
  signature: string | null;
  eventId: string | null;
}

export interface WebhookDeps {
  store: UserStore;
  api: RazorpayApi;
  webhookSecret: string;
}

export interface WebhookResult {
  status: number;
  outcome: string;
}

interface PaymentEntity {
  id: string;
  amount: number;
  currency: string;
  status: string;
  amount_refunded?: number;
  subscription_id?: string | null;
}

interface RazorpayEvent {
  event: string;
  payload: {
    subscription?: { entity: { id: string } };
    payment?: { entity: PaymentEntity };
    refund?: { entity: { id: string; payment_id: string; amount: number } };
  };
}

const MAX_BODY = 256 * 1024;

export async function handleRazorpayWebhook(req: WebhookRequest, deps: WebhookDeps): Promise<WebhookResult> {
  if (req.rawBody.length > MAX_BODY) return { status: 413, outcome: "rejected:too-large" };
  // 1. Authenticity before anything is parsed or stored.
  if (!verifyWebhookSignature(req.rawBody, req.signature, deps.webhookSecret)) return { status: 400, outcome: "rejected:bad-signature" };

  let event: RazorpayEvent;
  try {
    event = JSON.parse(req.rawBody);
  } catch {
    return { status: 400, outcome: "rejected:bad-json" };
  }
  if (typeof event?.event !== "string") return { status: 400, outcome: "rejected:bad-event" };

  // 2. Idempotency. Razorpay sends a unique X-Razorpay-Event-Id; fall back to a body hash if it is ever absent.
  const eventId = req.eventId?.slice(0, 120) || `sha256:${createHash("sha256").update(req.rawBody).digest("hex")}`;
  const fresh = await deps.store.recordWebhookEvent("RAZORPAY", eventId, event.event, event);
  if (!fresh) {
    const prior = await deps.store.getWebhookEvent("RAZORPAY", eventId);
    // Only skip deliveries that were fully processed; a crashed attempt is retried (all handlers are idempotent).
    if (prior?.outcome && !prior.outcome.startsWith("error:")) return { status: 200, outcome: "duplicate" };
  }

  // 3. Apply.
  try {
    const outcome = await apply(event, deps);
    await deps.store.markWebhookEvent("RAZORPAY", eventId, outcome);
    return { status: 200, outcome };
  } catch (e) {
    const outcome = `error:${e instanceof Error ? e.message : String(e)}`;
    await deps.store.markWebhookEvent("RAZORPAY", eventId, outcome).catch(() => {});
    // Ownership mismatches are data-integrity alarms, not transient: acknowledge so they aren't retried forever.
    if (e instanceof OwnershipMismatchError) {
      console.error("[billing] ownership mismatch", e.message);
      return { status: 200, outcome };
    }
    console.error("[billing] webhook processing failed", e);
    return { status: 500, outcome }; // Razorpay retries
  }
}

async function apply(event: RazorpayEvent, { store, api }: WebhookDeps): Promise<string> {
  const p = event.payload ?? {};
  if (event.event.startsWith("subscription.")) {
    const id = p.subscription?.entity?.id;
    if (!id) return "ignored:no-subscription";
    const payment = p.payment?.entity;
    const result = await syncRazorpaySubscription(store, api, id);
    if (payment && result.subscription) {
      await store.upsertPayment({
        provider: "RAZORPAY",
        providerPaymentId: payment.id,
        providerSubscriptionReference: id,
        amountPaise: payment.amount,
        currency: payment.currency,
        status: payment.status,
        amountRefundedPaise: payment.amount_refunded ?? 0,
      });
    }
    return result.outcome;
  }

  if (event.event === "payment.failed") {
    // A failed charge never grants anything. Subscription state follows from Razorpay's own subscription events.
    const payment = p.payment?.entity;
    if (payment?.subscription_id && (await store.findSubscriptionByProviderReference("RAZORPAY", payment.subscription_id))) {
      await store.upsertPayment({
        provider: "RAZORPAY",
        providerPaymentId: payment.id,
        providerSubscriptionReference: payment.subscription_id,
        amountPaise: payment.amount,
        currency: payment.currency,
        status: "failed",
        amountRefundedPaise: 0,
      });
      return "applied:payment-failed";
    }
    return "ignored:payment-failed-unknown";
  }

  if (event.event === "refund.processed" || event.event === "refund.created") {
    const refund = p.refund?.entity;
    const payment = p.payment?.entity;
    if (!refund) return "ignored:no-refund";
    const subRef = (await store.findPaymentSubscriptionReference("RAZORPAY", refund.payment_id)) ?? payment?.subscription_id ?? null;
    if (!subRef) return "ignored:refund-unknown-payment";
    const sub = await store.findSubscriptionByProviderReference("RAZORPAY", subRef);
    if (!sub) return "ignored:refund-unknown-subscription";
    const amount = payment?.amount ?? null;
    const refunded = payment?.amount_refunded ?? refund.amount;
    await store.upsertPayment({
      provider: "RAZORPAY",
      providerPaymentId: refund.payment_id,
      providerSubscriptionReference: subRef,
      amountPaise: amount ?? refund.amount,
      currency: payment?.currency ?? "INR",
      status: amount !== null && refunded < amount ? "partially_refunded" : "refunded",
      amountRefundedPaise: refunded,
    });
    if (amount !== null && refunded < amount) return "applied:partial-refund-no-access-change";
    // Full refund (disclosed policy): access ends now and the subscription is cancelled so it cannot renew.
    if (sub.status !== "REFUNDED") {
      await store.updateSubscription(sub.id, { status: "REFUNDED", expiresAt: new Date().toISOString() });
      if (sub.providerStatus && !["cancelled", "completed", "expired"].includes(sub.providerStatus)) {
        await api.cancelSubscription(subRef, false);
      }
    }
    return "applied:refunded";
  }

  return `ignored:${event.event}`;
}
