import type { ExamAttempt } from "@/types/domain";
import type { TopicStat } from "@/types/analytics";
import { cn } from "@/lib/utils/cn";

// Sequential, single hue (validated ordinal ramp accent-300..700). Absent = neutral surface step.
const STEPS = ["bg-accent-300", "bg-accent-400", "bg-accent-500", "bg-accent-600", "bg-accent-700"] as const;
const BINS = [1, 5, 9, 13, 17]; // marks thresholds (lower bound of each step)

function step(marks: number) {
  let i = 0;
  for (let b = 0; b < BINS.length; b++) if (marks >= BINS[b]) i = b;
  return STEPS[i];
}

/** Topic × attempt grid. Each filled cell = the topic appeared in that attempt; shade = marks. */
export function CoverageGrid({ topics, attempts }: { topics: TopicStat[]; attempts: ExamAttempt[] }) {
  // Column count follows the analysis window (no hard-coded 6). Mobile: label row + n cells; sm+: label column.
  const n = attempts.length;
  const cols = { "--n": n } as React.CSSProperties;
  return (
    <div>
      <div role="table" aria-label="Topic coverage by attempt" className="w-full">
        <div role="row" style={cols} className="grid grid-cols-[repeat(var(--n),minmax(0,1fr))] items-end gap-1.5 pb-2 sm:grid-cols-[minmax(0,1fr)_repeat(var(--n),2.5rem)]">
          <span role="columnheader" className="sr-only text-xs font-medium text-ink-3 sm:not-sr-only">Topic</span>
          {attempts.map((a) => (
            <span role="columnheader" key={a.id} className="text-center text-[0.65rem] leading-tight text-ink-3 sm:text-xs">
              <span className="block">{a.shortLabel.split(" ")[0]}</span>
              <span className="block">{a.shortLabel.split(" ")[1]?.slice(2)}</span>
            </span>
          ))}
        </div>
        {topics.map((t) => (
          <div role="row" key={t.topicId} style={cols} className="grid grid-cols-[repeat(var(--n),minmax(0,1fr))] items-center gap-x-1.5 gap-y-1 border-b border-line/60 py-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_repeat(var(--n),2.5rem)] sm:border-0 sm:py-[3px]">
            {/* Mobile: full-width label above the six cells; desktop: label column. */}
            <span role="rowheader" className="col-span-full text-[0.8125rem] leading-snug text-ink-2 sm:col-span-1 sm:truncate sm:pr-2 sm:text-sm" title={`${t.topicName} — ${t.chapterName}`}>
              {t.topicName}
            </span>
            {attempts.map((a) => {
              const marks = t.marksByAttempt[a.id] ?? 0;
              const label = marks ? `${t.topicName}, ${a.label}: ${marks} marks` : `${t.topicName}, ${a.label}: not asked`;
              return (
                <span
                  role="cell"
                  key={a.id}
                  title={label}
                  aria-label={label}
                  className={cn(
                    "h-7 rounded-[4px] transition-transform duration-150 hover:scale-110",
                    marks ? step(marks) : "bg-surface-2",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-surface-2" /> Not asked
        </span>
        <span className="flex items-center gap-1.5">
          Marks
          {STEPS.map((s, i) => (
            <span key={s} className={cn("size-3 rounded-[3px]", s)} title={`${BINS[i]}${BINS[i + 1] ? `–${BINS[i + 1] - 1}` : "+"} marks`} />
          ))}
          <span>1 → {BINS.at(-1)}+</span>
        </span>
      </div>
    </div>
  );
}
