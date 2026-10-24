import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";
import { absoluteUrl } from "@/lib/seo";
import { Hero } from "@/components/home/hero";
import { IntelligencePreview } from "@/components/home/intelligence-preview";
import { Differentiators, FinalCta, HowItWorks, OriginStory, SubjectsSection } from "@/components/home/sections";
import { listSubjects } from "@/lib/data/service";

// Page-level openGraph replaces the layout's, so the full set is repeated with an absolute URL.
export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/") },
  openGraph: { type: "website", siteName: SITE.fullName, title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description, locale: "en_IN", url: absoluteUrl("/") },
};

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
