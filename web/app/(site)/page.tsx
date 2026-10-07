import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { IntelligencePreview } from "@/components/home/intelligence-preview";
import { Differentiators, FinalCta, HowItWorks, OriginStory, SubjectsSection } from "@/components/home/sections";
import { listSubjects } from "@/lib/data/service";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const subjects = await listSubjects();
  return (
    <>
      <Hero />
      <IntelligencePreview />
      <SubjectsSection subjects={subjects} />
      <Differentiators />
      <HowItWorks />
      <OriginStory />
      <FinalCta />
    </>
  );
}
