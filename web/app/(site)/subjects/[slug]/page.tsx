import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ResourceList } from "@/components/resources/resource-list";
import { SubjectIntelligence, SubjectIntelligenceSkeleton } from "@/components/subjects/subject-intelligence";
import { Badge, Container, DemoBadge } from "@/components/ui/primitives";
import { Reveal } from "@/components/motion/reveal";
import { getSubject, listResources, listSubjects } from "@/lib/data/service";

export async function generateStaticParams() {
  return (await listSubjects()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/subjects/[slug]">): Promise<Metadata> {
  const subject = await getSubject((await params).slug);
  if (!subject) return {};
  return pageMetadata({
    title: `${subject.name} (Paper ${subject.paperCode})`,
    description: `${subject.name} — CS Executive Paper ${subject.paperNumber} (${subject.paperCode}): official ICSI study material, previous papers, guideline answers and syllabus lessons.`,
    path: `/subjects/${subject.slug}`,
  });
}

export default async function SubjectPage({ params }: PageProps<"/subjects/[slug]">) {
  const subject = await getSubject((await params).slug);
  if (!subject) notFound();
  const resources = await listResources(null, { subject: subject.slug });
  const papers = resources.filter((r) => r.resourceType === "QUESTION_PAPER" && !r.paperCode?.endsWith("EH"));
  const other = resources.filter((r) => r.resourceType !== "QUESTION_PAPER" && r.resourceType !== "GUIDELINE_ANSWER");

  return (
    <>
      <PageHeader
        eyebrow={`Paper ${subject.paperNumber} · ${subject.paperCode} · Group ${subject.group}`}
        title={subject.name}
        lead={subject.description}
        crumbs={[{ href: "/", label: "Home" }, { href: "/subjects", label: "Subjects" }, { href: `/subjects/${subject.slug}`, label: subject.shortName }]}
      >
        <div className="flex flex-wrap gap-2">
          {subject.parts.map((p) => (
            <Badge key={p.label} tone="outline">
              {p.label} · {p.marks} marks
            </Badge>
          ))}
          {subject.taxonomyVersion && <Badge tone="accent">Taxonomy v{subject.taxonomyVersion}</Badge>}
        </div>
      </PageHeader>

      <Container className="py-12">
        <section aria-labelledby="intel">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <h2 id="intel" className="text-display-md font-semibold">
              {subject.intelligenceStatus === "DEMO" ? "Sample PYQ analysis" : "PYQ intelligence"}
            </h2>
            {subject.intelligenceStatus === "DEMO" && <DemoBadge />}
          </div>
          <Suspense fallback={<SubjectIntelligenceSkeleton />}>
            <SubjectIntelligence subject={subject} />
          </Suspense>
        </section>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
          <Reveal as="section">
            <h2 className="text-xl font-semibold">Syllabus lessons</h2>
            <p className="mt-1 text-sm text-ink-3">From the ICSI Syllabus 2022, as modified effective December 2025.</p>
            <ol className="mt-5 divide-y divide-line rounded-lg border border-line bg-surface">
              {subject.lessons.map((l) => (
                <li key={l.number} className="flex items-baseline gap-3 px-4 py-3">
                  <span className="tabular w-7 shrink-0 text-sm text-ink-3">{l.number}</span>
                  <span className={l.status === "DELETED_FROM_DEC2025" ? "flex-1 text-ink-3 line-through decoration-ink-3/60" : "flex-1 text-ink-2"}>{l.name}</span>
                  {l.status === "DELETED_FROM_DEC2025" && <Badge tone="outline">Removed Dec 2025</Badge>}
                  {l.status === "PARTIALLY_DELETED" && <Badge tone="neutral">Partly revised</Badge>}
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal as="section" delay={0.05}>
            <h2 className="text-xl font-semibold">Official resources</h2>
            <p className="mt-1 text-sm text-ink-3">Opens the document at its ICSI source.</p>
            <div className="mt-5 space-y-6">
              {other.length > 0 && <ResourceList resources={other} showType />}
              {papers.length > 0 && (
                <div>
                  <h3 className="mb-3 text-base font-semibold">Previous papers</h3>
                  <ResourceList resources={papers} />
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
