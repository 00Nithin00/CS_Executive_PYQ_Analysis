"use client";

import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { useFocusTrap } from "@/lib/utils/use-focus-trap";

/**
 * Accessible slide-in panel: bottom sheet on mobile (side="bottom") or side drawer (side="right").
 * Locks body scroll, closes on Escape / backdrop, returns focus to the opener.
 */
export function Sheet({
  open,
  onClose,
  title,
  side = "bottom",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "bottom" | "right";
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);

  const isBottom = side === "bottom";
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <m.div
            className="absolute inset-0 bg-ink/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cn(
              "absolute flex flex-col bg-surface shadow-lg outline-none",
              isBottom ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-xl" : "inset-y-0 right-0 w-[min(420px,92vw)]",
            )}
            initial={isBottom ? { y: "100%" } : { x: "100%" }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            {isBottom && <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line-strong" />}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-base font-semibold">{title}</h2>
              <button onClick={onClose} className="grid size-10 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Close">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
            {footer && <div className="border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
