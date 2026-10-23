import type { Metadata } from "next";
import { QualificationHub } from "@/components/qualification/qualification-views";
import { QUALIFICATION_INFO } from "@/lib/qualifications/catalogue";
import { pageMetadata } from "@/lib/seo";

const info = QUALIFICATION_INFO.ca;

export const metadata: Metadata = pageMetadata({
  title: `${info.name} (${info.short})`,
  description: `Official ${info.bodyShort} syllabus, study material and past papers for every CA level, linked to the official source.`,
  path: "/ca",
});

export default function Page() {
  return <QualificationHub q="ca" />;
}
