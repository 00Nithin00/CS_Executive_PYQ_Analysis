// What anonymous visitors may see of the analytics, decided in ONE place.
// Marks-weight analysis is a Pro capability (MARKS_ANALYSIS). The homepage preview may show the
// chapter-level marks chart only for DEMO data (it illustrates the product). Once the verified
// dataset is connected, the preview is hidden unless this is deliberately changed.
import type { Provenance } from "@/types/domain";

export const PUBLIC_PREVIEW = {
  chapterMarks: { subject: "clp" as const, maxChapters: 6, allowedProvenance: ["DEMO"] as Provenance[] },
};
