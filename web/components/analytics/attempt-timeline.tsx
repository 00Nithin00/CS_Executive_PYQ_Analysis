import type { AttemptStat } from "@/types/analytics";

/** Horizontal on wide screens, vertical stack on mobile. */
export function AttemptTimeline({ attempts }: { attempts: AttemptStat[] }) {
  return (
    <ol className="relative grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {attempts.map((a, i) => (
        <li key={a.attempt} className="relative rounded-md border border-line bg-canvas p-4">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display font-semibold">{a.label}</p>
            <span className="tabular text-xs text-ink-3">#{i + 1}</span>
          </div>
          <p className="tabular mt-1 text-sm text-ink-3">
            {a.questionCount} questions · {a.marks} marks
          </p>
          {a.topChapters.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {a.topChapters.map((c) => (
                <li key={c.chapterName} className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="truncate text-ink-2" title={c.chapterName}>
                    {c.chapterName}
                  </span>
                  <span className="tabular shrink-0 font-medium text-ink">{c.marks}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
