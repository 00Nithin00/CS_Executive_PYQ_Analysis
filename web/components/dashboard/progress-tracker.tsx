"use client";

import { useState, useTransition } from "react";
import { setProgressAction } from "@/lib/actions/personal";
import type { ProgressRecord } from "@/lib/store/types";
import { cn } from "@/lib/utils/cn";

type Status = ProgressRecord["status"];
const OPTIONS: { value: Status; label: string }[] = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COVERED", label: "Covered" },
];

export function ProgressTracker({ chapters, initial }: { chapters: { id: string; number: number; name: string; part: string }[]; initial: Record<string, Status> }) {
  const [state, setState] = useState(initial);
  const [, start] = useTransition();
  const covered = chapters.filter((c) => state[c.id] === "COVERED").length;
  const pct = Math.round((covered / chapters.length) * 100);

  const update = (id: string, status: Status) => {
    const prev = state[id] ?? "NOT_STARTED";
    setState((s) => ({ ...s, [id]: status }));
    start(async () => {
      const res = await setProgressAction(id, status);
      if (!res.ok) setState((s) => ({ ...s, [id]: prev }));
    });
  };

  return (
    <div>
      <div className="rounded-lg border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <p className="font-medium">Company Law & Practice</p>
          <p className="tabular text-sm text-ink-3">
            {covered} of {chapters.length} chapters covered
          </p>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-accent-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Chapters covered">
          <div className="h-full origin-left rounded-r-[4px] bg-accent-600 transition-transform duration-500 ease-(--ease-soft)" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
      <ul className="mt-6 divide-y divide-line rounded-lg border border-line bg-surface">
        {chapters.map((c) => {
          const current = state[c.id] ?? "NOT_STARTED";
          return (
            <li key={c.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 text-sm">
                <span className="tabular mr-2 text-ink-3">L{c.number}</span>
                <span className="text-ink">{c.name}</span>
              </p>
              <div role="radiogroup" aria-label={`Status for ${c.name}`} className="grid shrink-0 grid-cols-3 rounded-full border border-line bg-canvas p-0.5">
                {OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    role="radio"
                    aria-checked={current === o.value}
                    onClick={() => update(c.id, o.value)}
                    className={cn(
                      "h-9 rounded-full px-3 text-xs font-medium transition-colors",
                      current === o.value ? (o.value === "COVERED" ? "bg-accent-600 text-white" : "bg-ink text-white") : "text-ink-3 hover:text-ink",
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
