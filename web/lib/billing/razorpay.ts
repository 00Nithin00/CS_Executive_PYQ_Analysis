// Minimal Razorpay REST client (Subscriptions) and signature verification. No SDK dependency.
// API reference: https://razorpay.com/docs/api/payments/subscriptions/
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export interface RazorpaySubscription {
  id: string;
  plan_id: string;
  status: "created" | "authenticated" | "active" | "pending" | "halted" | "cancelled" | "completed" | "expired" | "paused";
  current_start: number | null; // unix seconds
  current_end: number | null;
  ended_at: number | null;
  start_at: number | null;
  charge_at: number | null;
  notes: Record<string, string> | [] | null;
  short_url?: string;
}

export interface RazorpayApi {
  createSubscription(input: { planId: string; totalCount: number; notes: Record<string, string> }): Promise<RazorpaySubscription>;
  fetchSubscription(id: string): Promise<RazorpaySubscription>;
  cancelSubscription(id: string, atCycleEnd: boolean): Promise<RazorpaySubscription>;
}

export class RazorpayError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

const ID_RE = /^[A-Za-z0-9_]{6,64}$/;

export function razorpayApi(keyId: string, keySecret: string, fetchImpl: typeof fetch = fetch): RazorpayApi {
  const auth = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
  async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const res = await fetchImpl(`https://api.razorpay.com/v1${path}`, {
      method,
      headers: { authorization: auth, "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as { error?: { code?: string; description?: string } } & T;
    if (!res.ok) throw new RazorpayError(res.status, json.error?.code, json.error?.description ?? `Razorpay ${method} ${path} failed (${res.status})`);
    return json;
  }
  const checkId = (id: string) => {
    if (!ID_RE.test(id)) throw new RazorpayError(400, "BAD_ID", "Invalid Razorpay id");
    return id;
  };
  return {
    createSubscription: ({ planId, totalCount, notes }) =>
      call("POST", "/subscriptions", { plan_id: checkId(planId), total_count: totalCount, quantity: 1, customer_notify: 1, notes }),
    fetchSubscription: (id) => call("GET", `/subscriptions/${checkId(id)}`),
    cancelSubscription: (id, atCycleEnd) => call("POST", `/subscriptions/${checkId(id)}/cancel`, { cancel_at_cycle_end: atCycleEnd ? 1 : 0 }),
  };
}

function safeEqualHex(expectedHex: string, given: string): boolean {
  if (!/^[0-9a-f]+$/i.test(given)) return false;
  const a = Buffer.from(expectedHex, "hex");
  const b = Buffer.from(given, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Webhook: HMAC-SHA256 of the exact raw request body with the webhook secret (header X-Razorpay-Signature). */
export function verifyWebhookSignature(rawBody: string, signature: string | null, webhookSecret: string): boolean {
  if (!signature || !webhookSecret) return false;
  return safeEqualHex(createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("hex"), signature);
}

/** Checkout handler: HMAC-SHA256 of `${payment_id}|${subscription_id}` with the key secret. */
export function verifyCheckoutSignature(paymentId: string, subscriptionId: string, signature: string, keySecret: string): boolean {
  if (!paymentId || !subscriptionId || !signature) return false;
  return safeEqualHex(createHmac("sha256", keySecret).update(`${paymentId}|${subscriptionId}`, "utf8").digest("hex"), signature);
}
