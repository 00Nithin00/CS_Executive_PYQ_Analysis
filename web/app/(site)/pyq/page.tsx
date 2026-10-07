import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PyqPageBody } from "@/components/pyq/pyq-page-body";
import { listSubjects } from "@/lib/data/service";

export const metadata: Metadata = pageMetadata({
  title: "PYQ Intelligence",
  description: "Browse CS Executive previous-year questions by attempt, chapter, topic and concept.",
  path: "/pyq", index: false,
});

export default async function PyqPage() {
  const subjects = await listSubjects();
  const first = subjects.find((s) => s.intelligenceStatus !== "IN_PREPARATION") ?? subjects[0];
  return <PyqPageBody subjects={subjects} active={first} />;
}
