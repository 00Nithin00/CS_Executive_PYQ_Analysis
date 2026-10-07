"use client";

import { m } from "motion/react";
import { BarChart3, Bookmark, CalendarRange, CircleUser, LayoutGrid, ListChecks, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export const DASH_NAV = [
  { href: "/dashboard", label: "Overview", short: "Home", icon: LayoutGrid },
  { href: "/dashboard/pyq", label: "PYQ Intelligence", short: "PYQ", icon: BarChart3 },
  { href: "/dashboard/study-plan", label: "Study Plan", short: "Plan", icon: CalendarRange },
  { href: "/dashboard/progress", label: "Progress", short: "Progress", icon: ListChecks },
  { href: "/dashboard/bookmarks", label: "Bookmarks", short: "Saved", icon: Bookmark },
  { href: "/dashboard/account", label: "Account", short: "Account", icon: CircleUser },
] as const;

const isActive = (path: string, href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));

export function DashboardSidebarNav({ showAdmin = false }: { showAdmin?: boolean }) {
  const path = usePathname();
  const items = showAdmin ? [...DASH_NAV, { href: "/dashboard/admin", label: "Admin", short: "Admin", icon: ShieldCheck }] : DASH_NAV;
  return (
    <ul className="space-y-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(path, href);
        return (
          <li key={href} className="relative">
            {active && <m.span layoutId="dash-active" className="absolute inset-0 rounded-md bg-surface-2" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
            <Link href={href} aria-current={active ? "page" : undefined} className={cn("relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors", active ? "font-medium text-ink" : "text-ink-3 hover:text-ink")}>
              <Icon aria-hidden className={cn("size-4", active && "text-accent-700")} />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Mobile: fixed bottom tab bar, five primary destinations (Account lives in the header). */
export function DashboardTabBar() {
  const path = usePathname();
  return (
    <nav aria-label="Dashboard" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {DASH_NAV.slice(0, 5).map(({ href, short, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <li key={href} className="relative">
              <Link href={href} aria-current={active ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem]", active ? "text-accent-700" : "text-ink-3")}>
                {active && <m.span layoutId="tab-active" className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-600" />}
                <Icon aria-hidden className="size-5" />
                {short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
