// Applies Razorpay's authoritative subscription state to our database.
// Every webhook and every checkout confirmation re-fetches the subscription from the Razorpay API and applies
// that, so out-of-order, duplicated or delayed notifications cannot move a subscription into a wrong state.
import "server-only";
import type { Subscription, SubscriptionStatus } from "@/lib/entitlements/resolve";
import type { ProviderSubscriptionState, UserStore } from "@/lib/store/types";
import type { RazorpayApi, RazorpaySubscription } from "./razorpay";

const STATUS: Record<RazorpaySubscription["status"], SubscriptionStatus> = {
  created: "PENDING", // checkout opened, nothing authorised
  authenticated: "PENDING", // mandate set up, first charge not yet captured
  active: "ACTIVE",
  pending: "PAST_DUE", // renewal charge failing, Razorpay retrying
  halted: "HALTED",
  paused: "HALTED",
  cancelled: "CANCELLED",
  completed: "EXPIRED",
  expired: "EXPIRED",
};

const isoFromUnix = (s: number | null | undefined) => (s ? new Date(s * 1000).toISOString() : null);

/** Access end for a provider state. Paid access never extends past what Razorpay reports as paid (current_end). */
function accessEnd(e: RazorpaySubscription): string | null {
  switch (e.status) {
    case "active":
    case "pending":
      return isoFromUnix(e.current_end);
    case "cancelled":
      // Cancelled at cycle end keeps access to current_end; an immediate cancel ends at ended_at.
      return isoFromUnix(e.ended_at && e.current_end ? Math.min(e.ended_at, e.current_end) : (e.current_end ?? e.ended_at));
    default:
      return isoFromUnix(e.ended_at ?? e.current_end);
  }
}

export function toProviderState(e: RazorpaySubscription, owner: Subscription): ProviderSubscriptionState {
  // A refund is final for access: later provider states never re-open a refunded subscription.
  const status: SubscriptionStatus = owner.status === "REFUNDED" ? "REFUNDED" : STATUS[e.status];
  return {
    source: "RAZORPAY",
    providerReference: e.id,
    userId: owner.userId,
    qualification: owner.qualification,
    providerPlanId: e.plan_id,
    providerStatus: e.status,
    status,
    startedAt: isoFromUnix(e.start_at ?? e.current_start),
    expiresAt: accessEnd(e),
    cancelAtPeriodEnd: Boolean(owner.cancelAtPeriodEnd) || e.status === "cancelled",
  };
}

export class OwnershipMismatchError extends Error {}

/**
 * Re-reads a Razorpay subscription and applies it. Only subscriptions we created at checkout (a row already exists,
 * owned by the user who started checkout) are ever applied — a provider id alone can never attach Pro to an account.
 */
export async function syncRazorpaySubscription(store: UserStore, api: RazorpayApi, subscriptionId: string): Promise<{ outcome: string; subscription?: Subscription }> {
  const existing = await store.findSubscriptionByProviderReference("RAZORPAY", subscriptionId);
  if (!existing) return { outcome: "ignored:unknown-subscription" };
  const entity = await api.fetchSubscription(subscriptionId);
  const notes = entity.notes && !Array.isArray(entity.notes) ? entity.notes : {};
  if ((notes.user_id && notes.user_id !== existing.userId) || (notes.qualification && notes.qualification !== existing.qualification)) {
    throw new OwnershipMismatchError(`Razorpay subscription ${subscriptionId} notes do not match its owner row`);
  }
  if (entity.plan_id && existing.providerPlanId && entity.plan_id !== existing.providerPlanId) {
    throw new OwnershipMismatchError(`Razorpay subscription ${subscriptionId} changed plan unexpectedly`);
  }
  const subscription = await store.upsertProviderSubscription(toProviderState(entity, existing));
  return { outcome: `applied:${entity.status}`, subscription };
}
