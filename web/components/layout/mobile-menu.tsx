"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useFocusTrap } from "@/lib/utils/use-focus-trap";
import { isNavActive, PRIMARY_NAV, RESOURCE_SECTIONS } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/** Full-height panel that slides down under the header, with staggered links. */
export function MobileMenu({ authSlot }: { authSlot: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // Trap focus across the toggle button + panel while open, so Tab cannot reach the page underneath.
  useFocusTrap(wrapRef, open);

  /** Close; optionally return focus to the toggle (Escape) — link navigation leaves focus to the new page. */
  const close = useCallback((restoreFocus = false) => {
    // Stop the panel taking taps synchronously, before React re-renders and the exit fade starts.
    if (panelRef.current) panelRef.current.style.pointerEvents = "none";
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => buttonRef.current?.focus());
  }, []);

  // Any link activated inside the panel closes it — including a link to the page already shown,
  // which does not change the pathname. No preventDefault/stopPropagation: navigation proceeds normally.
  const onPanelClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a[href]")) close();
  };

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    window.addEventListener("keydown", onKey);
    // Growing past the lg breakpoint hides this component (lg:hidden): close it so no scroll lock,
    // focus trap or stale "open" state is left behind on desktop.
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => desktop.matches && close();
    desktop.addEventListener("change", onBreakpoint);
    onBreakpoint();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open, close]);

  return (
    <div className="lg:hidden" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="relative z-50 grid size-11 touch-manipulation place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-surface-2"
      >
        {/* The icon is never removed while swapping (no exit/"wait" phase), and it ignores pointer
            events so taps always land on the <button> itself. */}
        <m.span key={open ? "x" : "menu"} className="pointer-events-none grid place-items-center" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 0.18 }}>
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </m.span>
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            ref={panelRef}
            id="mobile-menu"
            className="fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-canvas"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            // While fading out, the panel must not intercept taps (no invisible overlay), and with
            // reduced motion it is removed immediately.
            exit={{ opacity: 0, y: -8, pointerEvents: "none", transition: { duration: reduceMotion ? 0 : 0.2 } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <m.nav
              aria-label="Mobile"
              onClick={onPanelClick}
              className="flex min-h-full flex-col px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } }}
            >
              <ul className="divide-y divide-line border-y border-line">
                {[{ href: "/", label: "Home" }, ...PRIMARY_NAV, { href: "/papers", label: "CS Previous Papers" }].map((item) => {
                  const active = item.href === "/" ? pathname === "/" : isNavActive(item, pathname);
                  return (
                    <m.li key={item.href} variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn("flex items-center justify-between py-4 font-display text-xl tracking-tight", active ? "text-accent-700" : "text-ink")}
                      >
                        {item.label}
                        <ArrowUpRight aria-hidden className="size-5 text-ink-4" />
                      </Link>
                    </m.li>
                  );
                })}
              </ul>

              <m.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">Official resources</p>
                <div className="grid grid-cols-2 gap-2">
                  {RESOURCE_SECTIONS.map((r) => (
                    <Link key={r.slug} href={`/resources/${r.slug}`} className="rounded-md border border-line bg-surface px-3 py-3 text-sm text-ink-2 hover:border-line-strong">
                      {r.label}
                    </Link>
                  ))}
                </div>
              </m.div>

              <m.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-auto pt-8">
                {authSlot}
              </m.div>
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
