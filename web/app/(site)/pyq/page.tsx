import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PyqPageBody } from "@/components/pyq/pyq-page-body";
import { listSubjects } from "@/lib/data/service";

export const metadata: Metadata = pageMetadata({
  title: "PYQ explorer",
  description: "Browse CS Executive Company Law & Practice previous-year questions from the six Syllabus 2022 papers by attempt, chapter and topic, with links to the official ICSI papers.",
  path: "/pyq", index: false,
});

export default async function PyqPage() {
  const subjects = await listSubjects();
  const first = subjects.find((s) => s.intelligenceStatus !== "IN_PREPARATION") ?? subjects[0];
  return <PyqPageBody subjects={subjects} active={first} />;
}
