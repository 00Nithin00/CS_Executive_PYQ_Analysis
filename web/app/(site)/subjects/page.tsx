import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { SubjectCard } from "@/components/subjects/subject-card";
import { Container } from "@/components/ui/primitives";
import { listSubjects } from "@/lib/data/service";

export const metadata: Metadata = pageMetadata({
  title: "Subjects",
  description: "All seven CS Executive (Syllabus 2022) papers — official ICSI resources, syllabus lessons and PYQ analysis as each dataset is verified.",
  path: "/subjects",
});

export default async function SubjectsPage() {
  const subjects = await listSubjects();
  return (
    <>
      <PageHeader
        eyebrow="Executive Programme · Syllabus 2022"
        title="Subjects"
        lead="Seven papers across two groups. Each subject page brings together the official ICSI resources, the syllabus lessons and — as it is verified — the historical question analysis."
        crumbs={[{ href: "/", label: "Home" }, { href: "/subjects", label: "Subjects" }]}
      />
      <Container className="py-12">
        {[1, 2].map((g) => (
          <section key={g} className="mb-12 last:mb-0" aria-labelledby={`group-${g}`}>
            <h2 id={`group-${g}`} className="mb-5 text-xl font-semibold">
              Group {g}
            </h2>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects
                .filter((s) => s.group === g)
                .map((s) => (
                  <StaggerItem key={s.slug}>
                    <SubjectCard subject={s} />
                  </StaggerItem>
                ))}
            </Stagger>
          </section>
        ))}
      </Container>
    </>
  );
}
