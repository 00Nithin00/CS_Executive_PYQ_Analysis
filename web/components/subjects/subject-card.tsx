import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Subject } from "@/types/domain";
import { Badge, DemoBadge } from "@/components/ui/primitives";

export function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      href={`/subjects/${subject.slug}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 shadow-xs transition-[box-shadow,border-color,transform] duration-300 ease-(--ease-soft) hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md sm:p-6"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="tabular text-xs font-medium tracking-wide text-ink-3">
          Paper {subject.paperNumber} · {subject.paperCode} · Group {subject.group}
        </span>
        {subject.intelligenceStatus === "DEMO" ? <DemoBadge /> : subject.intelligenceStatus === "AVAILABLE" ? <Badge tone="accent">Intelligence live</Badge> : null}
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-snug">{subject.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-3">{subject.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700">
        Explore subject
        <ArrowRight aria-hidden className="size-4 transition-transform duration-300 ease-(--ease-soft) group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
