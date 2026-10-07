import { ArrowUpRight, History } from "lucide-react";
import { attemptLabel } from "@/content/attempts";
import { isProQuestion, type ExplorerQuestion } from "@/types/domain";
import { QUESTION_TYPE_LABEL, REPEAT_HELP, REPEAT_LABEL } from "@/lib/utils/labels";
import { Badge, DemoBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

const REPEAT_TONE = {
  EXACT_REPEAT: "accent",
  CONCEPTUAL_REPEAT: "accent",
  TOPIC_REPEAT: "neutral",
  CHAPTER_REPEAT: "outline",
  FIRST_SEEN: "outline",
  UNRESOLVED: "outline",
} as const;

export function QuestionCard({ q, actions, className }: { q: ExplorerQuestion; actions?: ReactNode; className?: string }) {
  const pro = isProQuestion(q) ? q : null;
  return (
    <article className={cn("rounded-lg border border-line bg-surface p-4 shadow-xs sm:p-5", className)}>
      <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p className="text-sm font-medium text-ink">
          {attemptLabel(q.attempt)} <span className="text-ink-4">·</span> {q.label}
        </p>
        <span className="tabular text-sm text-ink-3">{q.marks === null ? "Marks not printed" : `${q.marks} marks`}</span>
        <span className="ml-auto flex items-center gap-1.5">
          {q.isDemo && (
            <span className="hidden sm:inline-flex">
              <DemoBadge />
            </span>
          )}
          {actions}
        </span>
      </header>

      <p className="mt-3 leading-relaxed text-ink-2">{q.questionText}</p>

      <p className="mt-3 text-sm text-ink-3">
        <span className="text-ink-2">{q.chapter.name}</span>
        {pro && (
          <>
            <span aria-hidden> → </span>
            <span className="text-ink-2">{pro.topic.name}</span>
            {pro.subtopic && (
              <>
                <span aria-hidden> → </span>
                {pro.subtopic.name}
              </>
            )}
          </>
        )}
      </p>

      {pro && (
        <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <Badge tone={REPEAT_TONE[pro.repeatStatus]} className="cursor-help">
            <span title={REPEAT_HELP[pro.repeatStatus]}>{REPEAT_LABEL[pro.repeatStatus]}</span>
          </Badge>
          <Badge tone="neutral">{QUESTION_TYPE_LABEL[pro.questionType]}</Badge>
          {pro.syllabusStatus === "DELETED_FROM_DEC2025" && <Badge tone="outline">Removed from syllabus Dec 2025</Badge>}
          {/* Methodology §7: only exact/conceptual repeats are "previous appearances" of the question.
              A topic repeat is a different concept; a chapter repeat is never shown as a repeat. */}
          {pro.previousAppearances.length > 0 && (pro.repeatStatus === "EXACT_REPEAT" || pro.repeatStatus === "CONCEPTUAL_REPEAT" || pro.repeatStatus === "TOPIC_REPEAT") && (
            <span className="inline-flex items-center gap-1 text-xs text-ink-3">
              <History aria-hidden className="size-3.5" />
              {pro.repeatStatus === "TOPIC_REPEAT" ? "Topic also asked" : "Previously appeared"}: {[...new Set(pro.previousAppearances.map((p) => p.label))].join(", ")}
            </span>
          )}
        </footer>
      )}

      {q.sourceUrl && (
        <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent-700 hover:underline">
          Official paper <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
      )}
    </article>
  );
}
