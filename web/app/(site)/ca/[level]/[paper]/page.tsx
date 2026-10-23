import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaperView } from "@/components/qualification/qualification-views";
import { getCatalogue, getLevel, getPaper, paperSlug, QUALIFICATION_INFO } from "@/lib/qualifications/catalogue";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getCatalogue("ca").papers.map((p) => ({ level: p.levelId, paper: paperSlug(p) }));
}

export async function generateMetadata({ params }: PageProps<"/ca/[level]/[paper]">): Promise<Metadata> {
  const { level: levelId, paper: slug } = await params;
  const level = getLevel("ca", levelId);
  const paper = level && getPaper("ca", level.id, slug);
  if (!level || !paper) return {};
  return pageMetadata({
    title: `${paper.name} (CA ${level.name})`,
    description: `CA ${level.name} — ${paper.name}: official ${QUALIFICATION_INFO.ca.bodyShort} syllabus, study material and past papers by attempt.`,
    path: `/ca/${level.id}/${slug}`,
  });
}

export default async function Page({ params }: PageProps<"/ca/[level]/[paper]">) {
  const { level: levelId, paper: slug } = await params;
  const level = getLevel("ca", levelId);
  const paper = level && getPaper("ca", level.id, slug);
  if (!level || !paper) notFound();
  return <PaperView q="ca" level={level} paper={paper} />;
}
