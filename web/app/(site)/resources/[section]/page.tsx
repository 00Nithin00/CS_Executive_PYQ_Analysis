import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ResourceList } from "@/components/resources/resource-list";
import { Container, EmptyState } from "@/components/ui/primitives";
import { attemptLabel } from "@/content/attempts";
import { RESOURCE_SECTIONS } from "@/lib/config/site";
import { listResources, listSubjects } from "@/lib/data/service";
import type { OfficialResource } from "@/types/domain";

export function generateStaticParams() {
  return RESOURCE_SECTIONS.map((s) => ({ section: s.slug }));
}

const find = (slug: string) => RESOURCE_SECTIONS.find((s) => s.slug === slug);

export async function generateMetadata({ params }: PageProps<"/resources/[section]">): Promise<Metadata> {
  const s = find((await params).section);
  return s ? pageMetadata({ title: `${s.label} — official ICSI links`, description: s.blurb, path: `/resources/${s.slug}` }) : {};
}

export default async function ResourceSectionPage({ params }: PageProps<"/resources/[section]">) {
  const section = find((await params).section);
  if (!section) notFound();
  const [all, subjects] = await Promise.all([listResources(null), listSubjects()]);
  const items = all.filter((r) =>
    section.slug === "syllabus" ? ["SYLLABUS", "NOTICE", "RELEVANT_MATERIAL"].includes(r.resourceType) : r.resourceType === section.type,
  );

  // Group: by attempt for papers & guideline answers, by subject otherwise.
  const byAttempt = section.type === "QUESTION_PAPER" || section.type === "GUIDELINE_ANSWER";
  const groups = new Map<string, OfficialResource[]>();
  for (const r of items) {
    const key = byAttempt ? r.attempt ?? "other" : r.subject ?? "general";
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const ordered = [...groups.entries()].sort(([a], [b]) => (byAttempt ? b.localeCompare(a) : subjects.findIndex((s) => s.slug === a) - subjects.findIndex((s) => s.slug === b)));
  const heading = (key: string) => (byAttempt ? attemptLabel(key) : (subjects.find((s) => s.slug === key)?.name ?? "General"));

  return (
    <>
      <PageHeader
        eyebrow="Official resources"
        title={section.label}
        lead={section.blurb}
        crumbs={[{ href: "/", label: "Home" }, { href: "/resources", label: "Resources" }, { href: `/resources/${section.slug}`, label: section.label }]}
      />
      <Container className="py-12">
        {ordered.length === 0 ? (
          <EmptyState title="Nothing listed yet">No official documents of this type are recorded yet.</EmptyState>
        ) : (
          <div className="space-y-10">
            {ordered.map(([key, list]) => (
              <Reveal as="section" key={key}>
                <h2 className="mb-4 text-xl font-semibold">{heading(key)}</h2>
                <ResourceList resources={list} showType={section.slug === "syllabus"} />
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
