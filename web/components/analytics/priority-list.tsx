import { ChevronDown } from "lucide-react";
import type { PriorityEntry, PriorityLabel } from "@/types/analytics";
import type { Provenance } from "@/types/domain";
import { PRIORITY_LABEL } from "@/lib/utils/labels";
import { cn } from "@/lib/utils/cn";

const TONE: Record<PriorityLabel, string> = {
  HIGH: "bg-accent-700 text-white",
  MEDIUM: "bg-accent-100 text-accent-800",
  LOW: "bg-surface-2 text-ink-2",
  INSUFFICIENT_HISTORY: "border border-line text-ink-3",
  NOT_EXAMINABLE: "border border-dashed border-line-strong text-ink-3",
};

/** Labels from data that is not verified carry their status in the text itself, so they never read as recommendations. */
const QUALIFIER: Record<Provenance, string | null> = { VERIFIED: null, DEMO: "Example", CANDIDATE: "Unverified" };
const NOTE: Record<Provenance, string | null> = {
  VERIFIED: null,
  DEMO: "Example labels computed from synthetic demonstration questions. They are not study recommendations and describe no real examination.",
  CANDIDATE: "Computed from an unverified candidate dataset. Not a study recommendation.",
};

export function PriorityBadge({ label, provenance = "VERIFIED" }: { label: PriorityLabel; provenance?: Provenance }) {
  const q = QUALIFIER[provenance];
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", TONE[label])}>
      {q ? `${q}: ${PRIORITY_LABEL[label].toLowerCase()}` : PRIORITY_LABEL[label]}
    </span>
  );
}

/** Each entry expands to show the evidence and the points behind the label (methodology §9). */
export function PriorityList({ entries, provenance = "VERIFIED" }: { entries: PriorityEntry[]; provenance?: Provenance }) {
  const note = NOTE[provenance];
  return (
    <ul className="divide-y divide-line">
      {note && (
        <li className="py-3 text-xs text-ink-3" data-priority-note>
          {note}
        </li>
      )}
      {entries.map((e) => (
        <li key={e.topicId}>
          <details className="group py-3">
            <summary className="flex cursor-pointer list-none items-start gap-3 rounded-md [&::-webkit-details-marker]:hidden">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{e.topicName}</p>
                <p className="truncate text-xs text-ink-3">{e.chapterName}</p>
              </div>
              <PriorityBadge label={e.label} provenance={provenance} />
              <ChevronDown aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="mt-3 rounded-md bg-surface-2 p-3 text-sm">
              <p className="text-ink-2">{e.explanation}</p>
              <dl className="tabular mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {(
                  [
                    ["Coverage", e.points.coverage, 2],
                    ["Marks weight", e.points.marks, 2],
                    ["Recency", e.points.recency, 2],
                    ["Recurring concept", e.points.repetition, 1],
                  ] as const
                ).map(([k, v, max]) => (
                  <div key={k} className="rounded bg-surface px-2 py-1.5">
                    <dt className="text-ink-3">{k}</dt>
                    <dd className="font-semibold text-ink">
                      {v} / {max}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
