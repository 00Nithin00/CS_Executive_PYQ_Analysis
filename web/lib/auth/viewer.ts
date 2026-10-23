// Data Access Layer for "who is looking". Every protected page, data function and server action
// resolves the viewer here, on the server. The client only ever receives the narrow PublicViewer.
import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Capability } from "@/lib/entitlements/capabilities";
import type { PlanId } from "@/lib/entitlements/plans";
import { resolveEntitlements, type Qualification, type Role, type Subscription } from "@/lib/entitlements/resolve";
import { store } from "@/lib/store";
import { readSession } from "./session";

export type ViewerState = "anonymous" | "free" | "pro";

export interface Viewer {
  /** The qualification these entitlements apply to. Pro is per qualification. */
  qualification: Qualification;
  /** True when the account database could not be reached; the viewer is then treated as anonymous. */
  degraded: boolean;
  state: ViewerState;
  isAdmin: boolean;
  user: { id: string; name: string; email: string; role: Role } | null;
  plan: PlanId;
  capabilities: ReadonlySet<Capability>;
  subscription: Subscription | null;
  /** Every subscription the user holds, across qualifications (account/billing pages). */
  subscriptions: Subscription[];
}

/** Serializable subset safe to send to Client Components. */
export interface PublicViewer {
  state: ViewerState;
  isAdmin: boolean;
  name: string | null;
  email: string | null;
  plan: PlanId;
  capabilities: Capability[];
}

export class ServiceUnavailableError extends Error {
  constructor(cause: unknown) {
    super("The account service is temporarily unavailable.", { cause });
  }
}

const anonymous = (qualification: Qualification, degraded: boolean): Viewer => {
  const e = resolveEntitlements(null, qualification);
  return { qualification, degraded, state: "anonymous", isAdmin: false, user: null, plan: e.plan, capabilities: e.capabilities, subscription: null, subscriptions: [] };
};

/**
 * Resolves who is looking and what they may see in one qualification (default: CS, the existing pages).
 * Database failures never grant access: the viewer degrades to anonymous (free official content only).
 */
export const getViewer = cache(async (qualification: Qualification = "cs"): Promise<Viewer> => {
  const session = await readSession();
  if (!session) return anonymous(qualification, false);
  try {
    const found = await store.findUserById(session.userId);
    // Tokens issued before the user's last logout are no longer valid.
    const user = found && !(found.sessionsRevokedAt && session.issuedAt < found.sessionsRevokedAt) ? found : null;
    if (!user) return anonymous(qualification, false);
    const subscriptions = await store.listSubscriptions(user.id);
    const e = resolveEntitlements(subscriptions, qualification);
    return {
      qualification,
      degraded: false,
      state: e.plan === "PRO" ? "pro" : "free",
      isAdmin: user.role === "ADMIN",
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      plan: e.plan,
      capabilities: e.capabilities,
      subscription: e.activeSubscription,
      subscriptions,
    };
  } catch (err) {
    console.error("[viewer] account store unavailable", err);
    return anonymous(qualification, true);
  }
});

export const can = (viewer: Viewer, capability: Capability) => viewer.capabilities.has(capability);

export function toPublicViewer(v: Viewer): PublicViewer {
  return {
    state: v.state,
    isAdmin: v.isAdmin,
    name: v.user?.name ?? null,
    email: v.user?.email ?? null,
    plan: v.plan,
    capabilities: [...v.capabilities],
  };
}

/** Page guard: signed-in users only. */
export async function requireUser(next = "/dashboard", qualification: Qualification = "cs"): Promise<Viewer & { user: NonNullable<Viewer["user"]> }> {
  const v = await getViewer(qualification);
  // Don't send a signed-in user to the login page just because the database is down.
  if (v.degraded) throw new ServiceUnavailableError(null);
  if (!v.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return v as Viewer & { user: NonNullable<Viewer["user"]> };
}

export async function requireAdmin() {
  const v = await requireUser("/dashboard/admin");
  if (!v.isAdmin) redirect("/dashboard");
  return v;
}

export class EntitlementError extends Error {
  constructor(public capability: Capability) {
    super(`Missing capability: ${capability}`);
  }
}

/** Data-layer guard: throws if the viewer lacks the capability. Never trust the client. */
export function assertCapability(viewer: Viewer, capability: Capability) {
  if (!viewer.capabilities.has(capability)) throw new EntitlementError(capability);
}
