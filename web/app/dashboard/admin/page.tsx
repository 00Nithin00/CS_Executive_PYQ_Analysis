import { Suspense } from "react";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { Badge, ProBadge } from "@/components/ui/primitives";
import { AdminUserActions } from "@/components/dashboard/admin-user-actions";
import { requireAdmin } from "@/lib/auth/viewer";
import { resolveEntitlements } from "@/lib/entitlements/resolve";
import { store } from "@/lib/store";

export const metadata = { title: "Admin" };

export default function Page() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const users = await store.listUsers();
  const rows = await Promise.all(users.map(async (u) => ({ u, e: resolveEntitlements(await store.listSubscriptions(u.id), "cs") })));
  return (
    <>
      <DashHeading title="Admin" lead="Grant or revoke Pro with an explicit ADMIN_GRANT subscription (no expiry). Every grant is recorded with who issued it." />
      <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
        {rows.map(({ u, e }) => (
          <li key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                {u.name} {u.role === "ADMIN" && <Badge tone="outline">Admin</Badge>}
              </p>
              <p className="truncate text-sm text-ink-3">{u.email}</p>
            </div>
            <div className="flex items-start gap-3">
              {e.plan === "PRO" ? <ProBadge /> : <Badge>Free</Badge>}
              <AdminUserActions userId={u.id} isPro={e.plan === "PRO"} email={u.email} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
