import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { PyqPageBody } from "@/components/pyq/pyq-page-body";
import { getSubject, listSubjects } from "@/lib/data/service";

export async function generateStaticParams() {
  return (await listSubjects()).map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pyq/[subject]">): Promise<Metadata> {
  const s = await getSubject((await params).subject);
  if (!s) return {};
  // Indexed only once the subject's question set is verified; demo / in-preparation pages stay out of search.
  return pageMetadata({
    title: `${s.shortName} previous-year questions`,
    description: `${s.name}: previous-year questions by attempt, chapter and topic.`,
    path: `/pyq/${s.slug}`,
    index: s.intelligenceStatus === "AVAILABLE",
  });
}

export default async function PyqSubjectPage({ params }: PageProps<"/pyq/[subject]">) {
  const [subjects, active] = await Promise.all([listSubjects(), getSubject((await params).subject)]);
  if (!active) notFound();
  return <PyqPageBody subjects={subjects} active={active} />;
}
