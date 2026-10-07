import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/primitives";
import { ATTEMPTS } from "@/content/attempts";
import { listResources, listSubjects } from "@/lib/data/service";

export const metadata: Metadata = pageMetadata({
  title: "Previous papers",
  description: "Find any CS Executive (Syllabus 2022) question paper by attempt and subject — opens at the official ICSI source.",
  path: "/papers",
});

export default async function PapersPage() {
  const [papers, answers, subjects] = await Promise.all([
    listResources(null, { type: "QUESTION_PAPER" }),
    listResources(null, { type: "GUIDELINE_ANSWER" }),
    listSubjects(),
  ]);
  const attempts = [...ATTEMPTS].reverse();
  const paper = (attempt: string, slug: string) => papers.find((p) => p.attempt === attempt && p.subject === slug && !p.paperCode?.endsWith("EH"));
  const ga = (attempt: string, group: number) => answers.find((a) => a.attempt === attempt && a.group === `G${group}`);

  return (
    <>
      <PageHeader
        eyebrow="Paper finder"
        title="Previous papers"
        lead="Every Syllabus 2022 Executive paper, by attempt. Each link opens the official ICSI PDF; guideline answers are published per group."
        crumbs={[{ href: "/", label: "Home" }, { href: "/papers", label: "Previous papers" }]}
      />
      <Container className="py-12">
        <div className="space-y-6">
          {attempts.map((a) => (
            <section key={a.id} className="rounded-lg border border-line bg-surface p-4 sm:p-6" aria-labelledby={`att-${a.id}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`att-${a.id}`} className="text-xl font-semibold">{a.label}</h2>
                <div className="flex flex-wrap gap-3 text-sm">
                  {[1, 2].map((g) => {
                    const r = ga(a.id, g);
                    return r ? (
                      <a key={g} href={r.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent-700 hover:underline">
                        Guideline answers · Group {g} <ArrowUpRight aria-hidden className="size-3.5" />
                      </a>
                    ) : null;
                  })}
                </div>
              </div>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {subjects.map((s) => {
                  const p = paper(a.id, s.slug);
                  return (
                    <li key={s.slug}>
                      {p ? (
                        <a href={p.officialUrl} target="_blank" rel="noopener noreferrer" className="group flex h-full items-center justify-between gap-3 rounded-md border border-line px-3.5 py-3 transition-colors hover:border-line-strong hover:bg-surface-2/60">
                          <span className="min-w-0">
                            <span className="tabular block text-xs text-ink-3">{s.paperCode} · Group {s.group}</span>
                            <span className="block truncate text-sm font-medium text-ink">{s.shortName}</span>
                          </span>
                          <ArrowUpRight aria-hidden className="size-4 shrink-0 text-accent-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                      ) : (
                        <span className="flex h-full items-center rounded-md border border-dashed border-line px-3.5 py-3 text-sm text-ink-3">{s.shortName} — not listed</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
