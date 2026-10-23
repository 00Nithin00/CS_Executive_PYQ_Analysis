// Shapes of the imported CA / CMA catalogues (content/<q>/catalogue.json, written by scripts/import-qualification.mjs).
// CS keeps its richer, research-backed model in ./domain.ts; these types cover the official-resource journeys.

export type QualResourceType = "SYLLABUS" | "STUDY_MATERIAL" | "QUESTION_PAPER" | "SUGGESTED_ANSWER" | "RTP" | "MTP" | "NOTICE";

export interface QualCitation {
  document: string;
  url: string;
  linkedFrom?: string;
  sha256?: string;
  readAt?: string;
  location: string;
}

export interface QualLevel {
  id: string;
  name: string;
  schemeId: string;
  examSessions: string[];
  examSessionsSourceUrl?: string;
  groups: { id: string; name: string; paperIds: string[] }[];
  electives?: { chooseOne: string[] };
  totalMarks?: number;
}

export interface QualPaper {
  id: string;
  levelId: string;
  groupId: string | null;
  number: number;
  name: string;
  marks: number | null;
  format: "descriptive" | "objective" | "mixed" | "unknown";
  sourceUrl: string;
  elective?: boolean;
  factsCitation?: QualCitation;
}

export interface QualResource {
  id: string;
  title: string;
  resourceType: QualResourceType;
  levelId: string;
  paperId: string | null;
  attempt: string | null; // YYYY-MM
  officialUrl: string;
  sourcePage: string;
  lastVerified: string;
  provenance: { method: "OFFICIAL_DOMAIN" | "LINKED_FROM_OFFICIAL_PAGE"; sourcePage: string; tracedAt?: string };
  /** Which exams this edition applies to, as stated on the official page. */
  applicability?: string;
  notes?: string;
}

export interface QualCatalogue {
  qualification: "CA" | "CMA";
  body: { name: string; url: string };
  schemes: { id: string; name: string; effectiveFrom: string; sourceUrls: string[] }[];
  levels: QualLevel[];
  papers: QualPaper[];
  resources: QualResource[];
  meta: { importedAt: string; sourceSha256: string; publishedCount: number; excludedCount: number };
}
