import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LevelView } from "@/components/qualification/qualification-views";
import { getCatalogue, getLevel, QUALIFICATION_INFO } from "@/lib/qualifications/catalogue";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getCatalogue("cma").levels.map((l) => ({ level: l.id }));
}

export async function generateMetadata({ params }: PageProps<"/cma/[level]">): Promise<Metadata> {
  const level = getLevel("cma", (await params).level);
  if (!level) return {};
  return pageMetadata({
    title: `CMA ${level.name}`,
    description: `CMA ${level.name}: official ${QUALIFICATION_INFO.cma.bodyShort} syllabus, study material and past papers for every paper.`,
    path: `/cma/${level.id}`,
  });
}

export default async function Page({ params }: PageProps<"/cma/[level]">) {
  const level = getLevel("cma", (await params).level);
  if (!level) notFound();
  return <LevelView q="cma" level={level} />;
}
