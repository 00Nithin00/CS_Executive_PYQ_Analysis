// Shape of content/papers/<subject>-paper-inventory.json (written by scripts/export-paper-inventory.mjs).
import type { AttemptId } from "./domain";

export interface PaperInventoryQuestion {
  number: string;
  parts: number;
  marks: number;
  alternativeGroup: string | null;
}

export interface PaperInventoryPaper {
  paperId: string;
  attempt: AttemptId;
  attemptLabel: string;
  paperCode: string;
  officialPaperUrl: string;
  officialArchive: string;
  guidelineAnswerUrl: string | null;
  sourceSha256: string;
  pages: number;
  printed: { maximumMarks: number; totalQuestions: number; timeAllowed: string };
  questions: PaperInventoryQuestion[];
  totals: { atomicParts: number; alternativeParts: number; attemptableMarks: number };
  checks: { source: "VERIFIED" | "NOT_VERIFIED"; sourceVerifiedOn: string; extraction: { passed: number; total: number } };
}

export interface PaperInventory {
  meta: {
    subject: string;
    paper: string;
    extractionStage: string;
    status: { papers: string; extraction: string; classification: string };
    classificationRecords: number;
    classificationHumanReviewed: number;
    note: string;
  };
  papers: PaperInventoryPaper[];
}
