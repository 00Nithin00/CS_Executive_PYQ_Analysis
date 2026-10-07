// Single source for demo-data disclosure and provenance-aware analytics wording.
// While a dataset is DEMO, nothing may be called "historical", "actual", "verified" or "frequency of the exam".
import type { Provenance } from "@/types/domain";

export const DEMO_DISCLOSURE = {
  long: "Demonstration data — these analytics use synthetic questions mapped to the CLP taxonomy (built from the official ICSI syllabus) and do not represent historical ICSI examination frequencies.",
  short: "Demonstration data — synthetic questions, not ICSI examination history.",
  questions:
    "Demonstration questions — synthetic text mapped to the CLP taxonomy (built from the official ICSI syllabus). Not ICSI question text and not historical examination data.",
  badge: "Demo data",
} as const;

/** Section titles and labels that change with provenance. */
export function analyticsCopy(provenance: Provenance) {
  const demo = provenance === "DEMO";
  return {
    sectionTitle: demo ? "Sample PYQ analysis" : "Historical PYQ intelligence",
    coverageTitle: "Topic coverage by attempt",
    coverageSubtitle: demo
      ? "Sample: topics in the demonstration questions, by attempt. Darker cells carry more marks."
      : "Topics most often covered across the attempts. Darker cells carried more marks.",
    priorityTitle: demo ? "Example priorities" : "Priority topics",
    prioritySubtitle: demo
      ? "How priorities will be explained, computed here from demonstration questions. Tap a topic to see the reasoning."
      : "Evidence-based, from coverage, marks, recency and recurrence. Tap a topic to see why.",
    marksTitle: demo ? "Marks by chapter (sample)" : "Marks by chapter",
    marksSubtitle: demo ? "Total marks in the demonstration questions, by chapter." : "Total marks across all attempts in the window.",
    recurringTitle: demo ? "Recurring concepts (sample)" : "Recurring concepts",
    recurringSubtitle: demo
      ? "Concepts repeated across attempts in the demonstration questions."
      : "The same provision and rule tested in more than one attempt.",
    timelineTitle: demo ? "Attempt timeline (sample)" : "Attempt timeline",
    timelineSubtitle: demo ? "Where each demonstration paper's marks went." : "Where each paper's marks went.",
    typesTitle: demo ? "Question types (sample)" : "Question types",
    repeatTitle: demo ? "Repeat analysis (sample)" : "Repeat analysis",
    stat: {
      attempts: demo ? "Attempts represented" : "Attempts analysed",
      questions: demo ? "Demonstration questions" : "Questions",
      marks: demo ? "Marks in sample" : "Marks analysed",
      chapters: demo ? "Chapters in sample" : "Chapters covered",
    },
    focusTitle: demo ? "Example focus list" : "CLP focus list",
  };
}
