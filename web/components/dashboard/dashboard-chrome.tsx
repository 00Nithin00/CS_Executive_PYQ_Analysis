import { CircleUser } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { getViewer } from "@/lib/auth/viewer";
import { logoutAction } from "@/lib/auth/actions";
import { ProductLogo } from "@/components/brand/product-logo";
import { Badge, ProBadge } from "@/components/ui/primitives";
import { DashboardSidebarNav } from "./dashboard-nav";

async function SidebarViewer() {
  const v = await getViewer();
  return (
    <>
      <DashboardSidebarNav showAdmin={v.isAdmin} />
      {v.user && (
        <div className="mt-auto rounded-md border border-line bg-canvas p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-medium">{v.user.name}</p>
            {v.state === "pro" ? <ProBadge /> : <Badge>Free</Badge>}
          </div>
          <p className="truncate text-xs text-ink-3">{v.user.email}</p>
          <form action={logoutAction} className="mt-3">
            <button className="text-xs font-medium text-ink-3 hover:text-ink">Log out</button>
          </form>
        </div>
      )}
    </>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-8 border-r border-line bg-surface px-4 py-5 lg:flex">
      <div className="px-2">
        <ProductLogo />
      </div>
      <Suspense fallback={<DashboardSidebarNav />}>
        <SidebarViewer />
      </Suspense>
    </aside>
  );
}

export function DashboardMobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur-md lg:hidden">
      <ProductLogo />
      <Link href="/dashboard/account" className="grid size-10 place-items-center rounded-full border border-line bg-surface" aria-label="Account">
        <CircleUser aria-hidden className="size-5 text-ink-2" />
      </Link>
    </header>
  );
}
