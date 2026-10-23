// Pure entitlement resolution: subscriptions -> effective plan -> capabilities, per qualification.
// No I/O here, so it is safe to unit test and to reuse with any user store.
import type { Capability } from "./capabilities";
import { ANONYMOUS_CAPABILITIES, PLAN_CAPABILITIES, type PlanId } from "./plans";

/** Pro is sold per qualification: a CS subscription never unlocks CA or CMA. */
export const QUALIFICATIONS = ["cs", "ca", "cma"] as const;
export type Qualification = (typeof QUALIFICATIONS)[number];
export const isQualification = (v: unknown): v is Qualification => typeof v === "string" && (QUALIFICATIONS as readonly string[]).includes(v);

/** See subscriptionStatusEnum in lib/db/schema.ts for the meaning of each status. */
export type SubscriptionStatus = "PENDING" | "ACTIVE" | "PAST_DUE" | "HALTED" | "CANCELLED" | "EXPIRED" | "REFUNDED";
export type SubscriptionSource = "ADMIN_GRANT" | "RAZORPAY" | "STRIPE" | "COUPON";

export interface Subscription {
  id: string;
  userId: string;
  qualification: Qualification;
  plan: PlanId;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  startedAt: string; // ISO
  expiresAt: string | null; // null = no expiry (admin grant)
  providerReference: string | null;
  providerPlanId?: string | null;
  providerStatus?: string | null;
  cancelAtPeriodEnd?: boolean;
  note?: string | null;
}

export type Role = "USER" | "ADMIN";

export interface Entitlements {
  plan: PlanId;
  capabilities: ReadonlySet<Capability>;
  activeSubscription: Subscription | null;
}

const PLAN_RANK: Record<PlanId, number> = { FREE: 0, PRO: 1 };

/**
 * Access policy (disclosed on the pricing page):
 * - ACTIVE: access until expiresAt (null = no expiry, used only by admin grants).
 * - PAST_DUE (renewal retrying) and CANCELLED: access only until the already-paid period ends (expiresAt).
 *   A cancelled admin grant has expiresAt = null and therefore no access.
 * - PENDING, HALTED, EXPIRED, REFUNDED: no access.
 */
export function isSubscriptionLive(s: Subscription, now: Date): boolean {
  if (s.startedAt && new Date(s.startedAt) > now) return false;
  const paidThroughFuture = s.expiresAt !== null && new Date(s.expiresAt) > now;
  switch (s.status) {
    case "ACTIVE":
      return s.expiresAt === null || paidThroughFuture;
    case "PAST_DUE":
    case "CANCELLED":
      return paidThroughFuture;
    default:
      return false;
  }
}

export function resolveEntitlements(subscriptions: Subscription[] | null, qualification: Qualification, now?: Date): Entitlements {
  if (subscriptions === null) {
    return { plan: "FREE", capabilities: new Set(ANONYMOUS_CAPABILITIES), activeSubscription: null };
  }
  const relevant = subscriptions.filter((s) => s.qualification === qualification);
  // Read the clock only when there is something time-dependent to evaluate.
  const at = relevant.length ? (now ?? new Date()) : null;
  const live = at ? relevant.filter((s) => isSubscriptionLive(s, at)) : [];
  const best = live.sort((a, b) => PLAN_RANK[b.plan] - PLAN_RANK[a.plan])[0] ?? null;
  const plan: PlanId = best?.plan ?? "FREE";
  return { plan, capabilities: new Set(PLAN_CAPABILITIES[plan]), activeSubscription: best };
}
