// Data Access Layer for "who is looking". Every protected page, data function and server action
// resolves the viewer here, on the server. The client only ever receives the narrow PublicViewer.
import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Capability } from "@/lib/entitlements/capabilities";
import type { PlanId } from "@/lib/entitlements/plans";
import { resolveEntitlements, type Role, type Subscription } from "@/lib/entitlements/resolve";
import { store } from "@/lib/store";
import { readSession } from "./session";

export type ViewerState = "anonymous" | "free" | "pro";

export interface Viewer {
  state: ViewerState;
  isAdmin: boolean;
  user: { id: string; name: string; email: string; role: Role } | null;
  plan: PlanId;
  capabilities: ReadonlySet<Capability>;
  subscription: Subscription | null;
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

export const getViewer = cache(async (): Promise<Viewer> => {
  const session = await readSession();
  const found = session ? await store.findUserById(session.userId) : null;
  // Tokens issued before the user's last logout are no longer valid.
  const user = found && session && !(found.sessionsRevokedAt && session.issuedAt < found.sessionsRevokedAt) ? found : null;
  if (!user) {
    const e = resolveEntitlements(null);
    return { state: "anonymous", isAdmin: false, user: null, plan: e.plan, capabilities: e.capabilities, subscription: null };
  }
  const e = resolveEntitlements(await store.listSubscriptions(user.id));
  return {
    state: e.plan === "PRO" ? "pro" : "free",
    isAdmin: user.role === "ADMIN",
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    plan: e.plan,
    capabilities: e.capabilities,
    subscription: e.activeSubscription,
  };
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
export async function requireUser(next = "/dashboard"): Promise<Viewer & { user: NonNullable<Viewer["user"]> }> {
  const v = await getViewer();
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
