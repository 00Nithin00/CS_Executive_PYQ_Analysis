"use server";

// Checkout server actions. The browser only ever *requests* things here: access is granted solely from
// Razorpay's own state, fetched server-side after a signature check (and independently by webhooks).
import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth/viewer";
import { isQualification, type Qualification } from "@/lib/entitlements/resolve";
import { store } from "@/lib/store";
import { planMatchesProPrice, PRO_PRICE_LABEL, PRO_PRODUCT } from "@/lib/config/pro-price";
import { checkoutBlock, PRO_PRICE, readBillingConfig } from "./config";
import { razorpayApi, verifyCheckoutSignature } from "./razorpay";
import { syncRazorpaySubscription } from "./sync";

export type CheckoutStart =
  | { ok: true; keyId: string; subscriptionId: string; prefill: { name: string; email: string }; description: string; amountPaise: number }
  | { ok: false; error: "SIGNED_OUT" | "UNAVAILABLE" | "ALREADY_PRO" | "INVALID" | "RATE_LIMITED" | "PROVIDER_ERROR" };

export type CheckoutConfirm =
  | { ok: true; state: "ACTIVE" | "PROCESSING" }
  | { ok: false; error: "SIGNED_OUT" | "INVALID" | "UNAVAILABLE" | "PROVIDER_ERROR" };

/** Max billing cycles Razorpay requires for an open-ended monthly plan (10 years). Cancel any time. */
const TOTAL_COUNT = 120;

async function signedIn(q: Qualification) {
  const viewer = await getViewer(q);
  if (viewer.degraded) return { error: "UNAVAILABLE" as const };
  if (!viewer.user) return { error: "SIGNED_OUT" as const };
  return { viewer, user: viewer.user };
}

export async function startCheckoutAction(qualification: string): Promise<CheckoutStart> {
  if (!isQualification(qualification)) return { ok: false, error: "INVALID" };
  const cfg = readBillingConfig();
  if (checkoutBlock(cfg, qualification) || !cfg) return { ok: false, error: "UNAVAILABLE" };
  const s = await signedIn(qualification);
  if ("error" in s) return { ok: false, error: s.error! };
  if (s.viewer.plan === "PRO") return { ok: false, error: "ALREADY_PRO" };
  if (!(await store.hitRateLimit(`checkout:${s.user.id}`, 10, 60 * 60)).allowed) return { ok: false, error: "RATE_LIMITED" };

  const planId = cfg.planIds[qualification]!;
  try {
    // The plan configured in the environment must bill exactly the published price, or nothing is sold.
    const plan = await razorpayApi(cfg.keyId, cfg.keySecret).fetchPlan(planId);
    if (!planMatchesProPrice(plan)) {
      console.error("[billing] configured plan does not match the published Pro price; checkout refused", { planId });
      return { ok: false, error: "UNAVAILABLE" };
    }
    const sub = await razorpayApi(cfg.keyId, cfg.keySecret).createSubscription({
      planId,
      totalCount: TOTAL_COUNT,
      notes: { user_id: s.user.id, qualification },
    });
    // Ownership is fixed here, server-side, before the browser ever sees the subscription id.
    await store.upsertProviderSubscription({
      source: "RAZORPAY",
      providerReference: sub.id,
      userId: s.user.id,
      qualification,
      providerPlanId: planId,
      providerStatus: sub.status,
      status: "PENDING",
      startedAt: null,
      expiresAt: null,
      cancelAtPeriodEnd: false,
    });
    return {
      ok: true,
      keyId: cfg.keyId,
      subscriptionId: sub.id,
      prefill: { name: s.user.name, email: s.user.email },
      description: `${PRO_PRODUCT.name} · ${PRO_PRICE_LABEL}`,
      amountPaise: PRO_PRICE.amountPaise,
    };
  } catch (e) {
    console.error("[billing] create subscription failed", e);
    return { ok: false, error: "PROVIDER_ERROR" };
  }
}

export async function confirmCheckoutAction(input: { qualification: string; paymentId: string; subscriptionId: string; signature: string }): Promise<CheckoutConfirm> {
  const { qualification, paymentId, subscriptionId, signature } = input ?? {};
  if (!isQualification(qualification) || [paymentId, subscriptionId, signature].some((v) => typeof v !== "string" || v.length > 200)) {
    return { ok: false, error: "INVALID" };
  }
  const cfg = readBillingConfig();
  if (!cfg) return { ok: false, error: "UNAVAILABLE" };
  const s = await signedIn(qualification);
  if ("error" in s) return { ok: false, error: s.error! };

  const row = await store.findSubscriptionByProviderReference("RAZORPAY", subscriptionId);
  // The subscription must be one this user started, for this qualification.
  if (!row || row.userId !== s.user.id || row.qualification !== qualification) return { ok: false, error: "INVALID" };
  if (!verifyCheckoutSignature(paymentId, subscriptionId, signature, cfg.keySecret)) return { ok: false, error: "INVALID" };

  try {
    const { subscription } = await syncRazorpaySubscription(store, razorpayApi(cfg.keyId, cfg.keySecret), subscriptionId);
    revalidatePath("/dashboard", "layout");
    return { ok: true, state: subscription?.status === "ACTIVE" ? "ACTIVE" : "PROCESSING" };
  } catch (e) {
    console.error("[billing] confirm sync failed", e);
    // The webhook will still apply the state; tell the user it's processing rather than failing.
    return { ok: true, state: "PROCESSING" };
  }
}

export async function cancelSubscriptionAction(qualification: string): Promise<{ ok: boolean; error?: string }> {
  if (!isQualification(qualification)) return { ok: false, error: "INVALID" };
  const cfg = readBillingConfig();
  if (!cfg) return { ok: false, error: "UNAVAILABLE" };
  const s = await signedIn(qualification);
  if ("error" in s) return { ok: false, error: s.error };
  const sub = s.viewer.subscription;
  if (!sub || sub.source !== "RAZORPAY" || !sub.providerReference || sub.userId !== s.user.id) return { ok: false, error: "NO_SUBSCRIPTION" };
  if (sub.cancelAtPeriodEnd) return { ok: true };
  try {
    const api = razorpayApi(cfg.keyId, cfg.keySecret);
    await api.cancelSubscription(sub.providerReference, true);
    await store.updateSubscription(sub.id, { cancelAtPeriodEnd: true });
    await syncRazorpaySubscription(store, api, sub.providerReference);
    revalidatePath("/dashboard", "layout");
    return { ok: true };
  } catch (e) {
    console.error("[billing] cancel failed", e);
    return { ok: false, error: "PROVIDER_ERROR" };
  }
}
