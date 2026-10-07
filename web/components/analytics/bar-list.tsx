"use client";

import { m } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Shown on hover/focus — the per-mark tooltip layer. */
  detail?: string;
  muted?: boolean;
}

/**
 * Horizontal single-series bars (magnitude). One hue, value at the tip, 4px rounded data-end,
 * square at the baseline, <=24px thick. Bars grow from the baseline when scrolled into view.
 */
export function BarList({
  data,
  unit = "",
  max,
  emptyLabel = "No data",
  size = "md",
}: {
  data: BarDatum[];
  unit?: string;
  max?: number;
  emptyLabel?: string;
  size?: "sm" | "md";
}) {
  const [active, setActive] = useState<string | null>(null);
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-sm text-ink-3">{emptyLabel}</p>;

  return (
    <m.ul
      className="space-y-1"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
    >
      {data.map((d) => {
        const pct = (d.value / top) * 100;
        const isActive = active === d.key;
        return (
          <li key={d.key}>
            <div
              tabIndex={0}
              role="img"
              onMouseEnter={() => setActive(d.key)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(d.key)}
              onBlur={() => setActive(null)}
              aria-label={`${d.label}: ${d.value}${unit}${d.detail ? `. ${d.detail}` : ""}`}
              className={cn(
                "group grid cursor-default grid-cols-1 gap-1.5 rounded-md px-2 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-600 sm:grid-cols-[minmax(9rem,15rem)_1fr] sm:items-center sm:gap-4",
                isActive && "bg-surface-2",
              )}
            >
              <span className={cn("truncate text-sm", d.muted ? "text-ink-3" : "text-ink-2")} title={d.label}>
                {d.label}
              </span>
              <span className="flex items-center gap-3">
                <span className={cn("relative flex-1", size === "sm" ? "h-2.5" : "h-3.5")}>
                  <m.span
                    className={cn("absolute inset-y-0 left-0 origin-left rounded-r-[4px]", d.muted ? "bg-accent-200" : "bg-accent-500", isActive && !d.muted && "bg-accent-600")}
                    style={{ width: `${Math.max(pct, 1.5)}%` }}
                    variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}
                  />
                </span>
                <span className="tabular w-12 shrink-0 text-right text-sm font-medium text-ink">
                  {d.value}
                  {unit && <span className="ml-0.5 text-xs font-normal text-ink-3">{unit}</span>}
                </span>
              </span>
            </div>
            {d.detail && (
              <p className={cn("px-2 text-xs text-ink-3 transition-opacity duration-150 sm:pl-[calc(min(15rem,40%)+1.5rem)]", isActive ? "h-auto pb-1 opacity-100" : "sr-only")}>{d.detail}</p>
            )}
          </li>
        );
      })}
    </m.ul>
  );
}
