import type { AttemptId, ExamAttempt } from "@/types/domain";
import { cn } from "@/lib/utils/cn";

/** Six dots, one per attempt: filled = appeared. Paired with a text summary (never colour alone). */
export function AttemptDots({ attempts, appeared }: { attempts: ExamAttempt[]; appeared: AttemptId[] }) {
  const set = new Set(appeared);
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Appeared in ${appeared.length} of ${attempts.length} attempts`}>
      {attempts.map((a) => (
        <span
          key={a.id}
          title={`${a.label}: ${set.has(a.id) ? "appeared" : "not asked"}`}
          className={cn("size-2.5 rounded-full", set.has(a.id) ? "bg-accent-600" : "border border-line-strong bg-surface")}
        />
      ))}
    </span>
  );
}
