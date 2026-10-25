import Link from "next/link";
import { Suspense } from "react";
import type { Subject } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/primitives";
import { ExplorerSection, ExplorerSkeleton } from "./explorer-section";

export function PyqPageBody({ subjects, active }: { subjects: Subject[]; active: Subject }) {
  return (
    <>
      <PageHeader
        eyebrow={active.intelligenceStatus === "DEMO" ? "PYQ explorer · demonstration" : "PYQ explorer"}
        title="Past questions, in their place in the syllabus."
        lead={
          active.intelligenceStatus === "DEMO"
            ? "This explorer currently holds synthetic demonstration questions mapped to the official syllabus. They are not ICSI questions."
            : "Company Law & Practice: every question part of the six Syllabus 2022 papers, with its chapter and topic (human-reviewed; not independently verified). Question text stays in the official ICSI papers, linked from each card. Other subjects are in preparation."
        }
        crumbs={[{ href: "/", label: "Home" }, { href: "/pyq", label: "PYQ explorer" }]}
      />
      <Container className="py-8 sm:py-10">
        <nav aria-label="Subject" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap">
            {subjects.map((s) => {
              const isActive = s.slug === active.slug;
              return (
                <li key={s.slug}>
                  <Link
                    href={`/pyq/${s.slug}`}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                      isActive ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-line-strong",
                    )}
                  >
                    {s.shortName}
                    {s.intelligenceStatus === "IN_PREPARATION" && <span className={cn("text-xs", isActive ? "text-white/80" : "text-ink-3")}>soon</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Suspense fallback={<ExplorerSkeleton />}>
          <ExplorerSection subject={active} />
        </Suspense>
      </Container>
    </>
  );
}
