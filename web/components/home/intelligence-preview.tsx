import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { DEMO_DISCLOSURE } from "@/lib/config/disclosure";
import { getPublicChapterPreview } from "@/lib/data/service";
import { BarList } from "@/components/analytics/bar-list";
import { Container, DemoBadge, SectionHeading } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";

/**
 * Homepage preview. Data comes through the service-layer public-preview policy
 * (lib/config/public-preview.ts): DEMO data may be shown; verified Pro analytics are not, unless
 * that policy is deliberately changed.
 */
export async function IntelligencePreview() {
  const preview = await getPublicChapterPreview();
  const isDemo = preview?.provenance === "DEMO";

  return (
    <section className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="How the analysis works"
            title="See what is examined — and how much it is worth."
            lead="Every question is placed in the official syllabus structure, so coverage and marks can be read chapter by chapter, topic by topic, attempt by attempt."
          />
          <ul className="mt-8 space-y-3 text-sm text-ink-2">
            {["Coverage across the Syllabus 2022 attempts", "Marks weight by chapter and topic", "Concepts that recur — and those that never have"].map((t) => (
              <li key={t} className="flex gap-3">
                <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-accent-500" />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/subjects/clp" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent-700 hover:underline">
            Open the Company Law & Practice page <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-line bg-surface p-5 shadow-md sm:p-7">
            {preview ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">{isDemo ? "Sample analysis" : "Analysis"} · Company Law & Practice</p>
                    <p className="mt-1 font-display text-xl font-semibold">Marks by chapter</p>
                    <p className="mt-1 text-sm text-ink-3">
                      {isDemo ? "Synthetic demonstration questions" : "Verified questions"} · {preview.attemptsInWindow.length} attempts
                    </p>
                  </div>
                  {isDemo && <DemoBadge />}
                </div>
                <div className="mt-6">
                  <BarList
                    unit=" m"
                    data={preview.chapters.map((c) => ({
                      key: c.chapterId,
                      label: c.chapterName,
                      value: c.marks,
                      detail: `In ${c.attemptsAppeared} of ${preview.attemptsInWindow.length} attempts${isDemo ? " (demonstration data)" : ""}`,
                    }))}
                  />
                </div>
                {isDemo && <p className="mt-5 border-t border-line pt-4 text-xs text-ink-3">{DEMO_DISCLOSURE.long}</p>}
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="font-display text-xl font-semibold">Chapter, topic and marks analysis</p>
                <p className="mx-auto mt-2 max-w-sm text-sm text-ink-3">Available on each subject page as its dataset is verified.</p>
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
