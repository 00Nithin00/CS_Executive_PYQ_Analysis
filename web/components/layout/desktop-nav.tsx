"use client";

import { m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavActive, PRIMARY_NAV } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(item, pathname);
          return (
            <li key={item.href} className="relative">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative block rounded-full px-3.5 py-2 text-[0.9375rem] transition-colors duration-200",
                  active ? "text-ink" : "text-ink-3 hover:text-ink",
                )}
              >
                {active && (
                  <m.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-full bg-surface-2"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
