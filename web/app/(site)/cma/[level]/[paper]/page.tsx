import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaperView } from "@/components/qualification/qualification-views";
import { getCatalogue, getLevel, getPaper, paperSlug, QUALIFICATION_INFO } from "@/lib/qualifications/catalogue";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getCatalogue("cma").papers.map((p) => ({ level: p.levelId, paper: paperSlug(p) }));
}

export async function generateMetadata({ params }: PageProps<"/cma/[level]/[paper]">): Promise<Metadata> {
  const { level: levelId, paper: slug } = await params;
  const level = getLevel("cma", levelId);
  const paper = level && getPaper("cma", level.id, slug);
  if (!level || !paper) return {};
  return pageMetadata({
    title: `${paper.name} (CMA ${level.name})`,
    description: `CMA ${level.name} — ${paper.name}: official ${QUALIFICATION_INFO.cma.bodyShort} syllabus, study material and past papers by attempt.`,
    path: `/cma/${level.id}/${slug}`,
  });
}

export default async function Page({ params }: PageProps<"/cma/[level]/[paper]">) {
  const { level: levelId, paper: slug } = await params;
  const level = getLevel("cma", levelId);
  const paper = level && getPaper("cma", level.id, slug);
  if (!level || !paper) notFound();
  return <PaperView q="cma" level={level} paper={paper} />;
}
