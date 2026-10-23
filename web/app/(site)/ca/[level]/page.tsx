import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LevelView } from "@/components/qualification/qualification-views";
import { getCatalogue, getLevel, QUALIFICATION_INFO } from "@/lib/qualifications/catalogue";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getCatalogue("ca").levels.map((l) => ({ level: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/ca/[level]">): Promise<Metadata> {
  const level = getLevel("ca", (await params).level);
  if (!level) return {};
  return pageMetadata({
    title: `CA ${level.name}`,
    description: `CA ${level.name}: official ${QUALIFICATION_INFO.ca.bodyShort} syllabus, study material and past papers for every paper.`,
    path: `/ca/${level.id}`,
  });
}

export default async function Page({ params }: PageProps<"/ca/[level]">) {
  const level = getLevel("ca", (await params).level);
  if (!level) notFound();
  return <LevelView q="ca" level={level} />;
}
