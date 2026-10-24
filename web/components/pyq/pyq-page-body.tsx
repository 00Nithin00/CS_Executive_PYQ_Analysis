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
        eyebrow="PYQ explorer · demonstration"
        title="How past questions will be organised in the syllabus."
        lead="This explorer currently holds synthetic demonstration questions mapped to the official syllabus. They are not ICSI questions. Real questions are added subject by subject once each dataset is verified."
        crumbs={[{ href: "/", label: "Home" }, { href: "/pyq", label: "PYQ explorer (demo)" }]}
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
