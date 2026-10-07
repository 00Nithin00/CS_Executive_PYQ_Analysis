import { Suspense } from "react";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { ButtonLink } from "@/components/ui/button";
import { Badge, ProBadge } from "@/components/ui/primitives";
import { logoutAction } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/viewer";

export const metadata = { title: "Account" };

const SOURCE: Record<string, string> = { ADMIN_GRANT: "Granted by an administrator", RAZORPAY: "Razorpay", STRIPE: "Stripe", COUPON: "Coupon" };

export default function Page() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const v = await requireUser("/dashboard/account");
  const s = v.subscription;
  return (
    <>
      <DashHeading title="Account" />
      <dl className="divide-y divide-line rounded-lg border border-line bg-surface">
        {[
          ["Name", v.user.name],
          ["Email", v.user.email],
          ["Role", v.isAdmin ? "Administrator" : "Member"],
        ].map(([k, val]) => (
          <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
            <dt className="text-sm text-ink-3">{k}</dt>
            <dd className="text-sm text-ink">{val}</dd>
          </div>
        ))}
        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr]">
          <dt className="text-sm text-ink-3">Plan</dt>
          <dd className="flex flex-wrap items-center gap-2 text-sm">
            {v.state === "pro" ? <ProBadge /> : <Badge>Free</Badge>}
            {s && (
              <span className="text-ink-3">
                {SOURCE[s.source] ?? s.source} · {s.expiresAt ? `expires ${new Date(s.expiresAt).toLocaleDateString("en-IN")}` : "no expiry"}
              </span>
            )}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        {v.state !== "pro" && <ButtonLink href="/pricing" variant="pro">See Pro</ButtonLink>}
        <form action={logoutAction}>
          <button className="h-11 rounded-full border border-line bg-surface px-5 text-sm font-medium hover:bg-surface-2">Log out</button>
        </form>
      </div>
    </>
  );
}
