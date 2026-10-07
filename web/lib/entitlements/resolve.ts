// Pure entitlement resolution: subscriptions -> effective plan -> capabilities.
// No I/O here, so it is safe to unit test and to reuse with any user store.
import type { Capability } from "./capabilities";
import { ANONYMOUS_CAPABILITIES, PLAN_CAPABILITIES, type PlanId } from "./plans";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";
export type SubscriptionSource = "ADMIN_GRANT" | "RAZORPAY" | "STRIPE" | "COUPON";

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  startedAt: string; // ISO
  expiresAt: string | null; // null = no expiry (e.g. admin grant)
  providerReference: string | null;
  note?: string;
}

export type Role = "USER" | "ADMIN";

export interface Entitlements {
  plan: PlanId;
  capabilities: ReadonlySet<Capability>;
  activeSubscription: Subscription | null;
}

const PLAN_RANK: Record<PlanId, number> = { FREE: 0, PRO: 1 };

export function isSubscriptionLive(s: Subscription, now: Date): boolean {
  if (s.status !== "ACTIVE") return false;
  if (s.startedAt && new Date(s.startedAt) > now) return false;
  return s.expiresAt === null || new Date(s.expiresAt) > now;
}

export function resolveEntitlements(subscriptions: Subscription[] | null, now?: Date): Entitlements {
  if (subscriptions === null) {
    return { plan: "FREE", capabilities: new Set(ANONYMOUS_CAPABILITIES), activeSubscription: null };
  }
  // Read the clock only when there is something time-dependent to evaluate.
  const at = now ?? new Date();
  const live = subscriptions.filter((s) => isSubscriptionLive(s, at));
  const best = live.sort((a, b) => PLAN_RANK[b.plan] - PLAN_RANK[a.plan])[0] ?? null;
  const plan: PlanId = best?.plan ?? "FREE";
  return { plan, capabilities: new Set(PLAN_CAPABILITIES[plan]), activeSubscription: best };
}
