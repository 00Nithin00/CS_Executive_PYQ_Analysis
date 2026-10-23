// Read model for the CA / CMA official-resource journeys. Data comes only from the imported, provenance-checked
// catalogues; nothing here invents a paper, mark, date or link. Coverage is computed from the records themselves.
import caData from "@/content/ca/catalogue.json";
import cmaData from "@/content/cma/catalogue.json";
import type { Qualification } from "@/lib/entitlements/resolve";
import type { QualCatalogue, QualLevel, QualPaper, QualResource, QualResourceType } from "@/types/qualification";

export type ResourceQualification = Exclude<Qualification, "cs">;

const CATALOGUES: Record<ResourceQualification, QualCatalogue> = {
  ca: caData as QualCatalogue,
  cma: cmaData as QualCatalogue,
};

export interface QualificationInfo {
  id: Qualification;
  short: string;
  name: string;
  bodyShort: string;
  bodyName: string;
  href: string;
  /** What is genuinely available today. */
  status: "LIVE" | "RESOURCES";
  blurb: string;
}

export const QUALIFICATION_INFO: Record<Qualification, QualificationInfo> = {
  cs: {
    id: "cs",
    short: "CS",
    name: "Company Secretary",
    bodyShort: "ICSI",
    bodyName: "The Institute of Company Secretaries of India",
    href: "/cs",
    status: "LIVE",
    blurb: "CS Executive: official resources, paper finder, subject pages and the question explorer.",
  },
  ca: {
    id: "ca",
    short: "CA",
    name: "Chartered Accountancy",
    bodyShort: "ICAI",
    bodyName: CATALOGUES.ca.body.name,
    href: "/ca",
    status: "RESOURCES",
    blurb: "Foundation, Intermediate and Final: syllabus, study material, question papers and suggested answers at the ICAI source.",
  },
  cma: {
    id: "cma",
    short: "CMA",
    name: "Cost & Management Accountancy",
    bodyShort: "ICMAI",
    bodyName: CATALOGUES.cma.body.name,
    href: "/cma",
    status: "RESOURCES",
    blurb: "Foundation, Intermediate and Final: syllabus, study material, question papers and practice test papers at the ICMAI source.",
  },
};

export const RESOURCE_QUALIFICATIONS: ResourceQualification[] = ["ca", "cma"];

export const QUAL_RESOURCE_LABEL: Record<QualResourceType, string> = {
  SYLLABUS: "Syllabus",
  STUDY_MATERIAL: "Study material",
  QUESTION_PAPER: "Question paper",
  SUGGESTED_ANSWER: "Suggested answers",
  RTP: "Revision test paper",
  MTP: "Practice / model test paper",
  NOTICE: "Notice",
};

export const getCatalogue = (q: ResourceQualification) => CATALOGUES[q];

/** URL segment for a paper: "p1", "p20a" (from ids like ca-f-p1, cma-fin-p20a). */
export const paperSlug = (p: QualPaper) => p.id.slice(p.id.lastIndexOf("-") + 1);

export function getLevel(q: ResourceQualification, levelId: string): QualLevel | null {
  return CATALOGUES[q].levels.find((l) => l.id === levelId) ?? null;
}

export function papersOf(q: ResourceQualification, levelId: string): QualPaper[] {
  return CATALOGUES[q].papers.filter((p) => p.levelId === levelId).sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
}

export function getPaper(q: ResourceQualification, levelId: string, slug: string): QualPaper | null {
  return papersOf(q, levelId).find((p) => paperSlug(p) === slug) ?? null;
}

// Newest attempt first; for undated documents (e.g. study-material editions) the newest edition id first.
const byAttemptDesc = (a: QualResource, b: QualResource) =>
  (b.attempt ?? "").localeCompare(a.attempt ?? "") || a.title.localeCompare(b.title) || b.id.localeCompare(a.id);

export function resourcesFor(q: ResourceQualification, f: { levelId?: string; paperId?: string | null; types?: QualResourceType[] }): QualResource[] {
  return CATALOGUES[q].resources
    .filter((r) => (f.levelId ? r.levelId === f.levelId : true))
    .filter((r) => (f.paperId === undefined ? true : r.paperId === f.paperId))
    .filter((r) => (f.types ? f.types.includes(r.resourceType) : true))
    .sort(byAttemptDesc);
}

export const attemptLabel = (a: string) => {
  const [y, m] = a.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });
};

/**
 * Per-paper availability of question papers and answers by attempt, computed from the records.
 * Used to show coverage honestly: an empty cell means "no official document catalogued", never a guess.
 */
export function paperCoverage(q: ResourceQualification, paper: QualPaper) {
  const rs = resourcesFor(q, { paperId: paper.id, types: ["QUESTION_PAPER", "SUGGESTED_ANSWER"] });
  const attempts = [...new Set(rs.map((r) => r.attempt).filter(Boolean) as string[])].sort().reverse();
  return attempts.map((attempt) => ({
    attempt,
    paper: rs.find((r) => r.attempt === attempt && r.resourceType === "QUESTION_PAPER") ?? null,
    answers: rs.find((r) => r.attempt === attempt && r.resourceType === "SUGGESTED_ANSWER") ?? null,
  }));
}

export function qualificationCounts(q: ResourceQualification) {
  const c = CATALOGUES[q];
  const count = (t: QualResourceType) => c.resources.filter((r) => r.resourceType === t).length;
  return {
    papers: c.papers.length,
    resources: c.resources.length,
    questionPapers: count("QUESTION_PAPER"),
    suggestedAnswers: count("SUGGESTED_ANSWER"),
    studyMaterial: count("STUDY_MATERIAL"),
    attempts: new Set(c.resources.filter((r) => r.resourceType === "QUESTION_PAPER").map((r) => r.attempt)).size,
    lastVerified: c.resources.reduce((m, r) => (r.lastVerified > m ? r.lastVerified : m), ""),
  };
}

/**
 * Known gaps, stated from the source reports (research/<q>/*_SOURCE_REPORT.md). Kept short and factual; each is
 * something the official body does not publish publicly, not something we chose to omit.
 */
export const KNOWN_GAPS: Record<ResourceQualification, string[]> = {
  ca: [
    "ICAI's Mock Test Paper series is available only after logging in to the ICAI BoS portal, so it is not linked here.",
    "Foundation Papers 3 and 4 (objective papers): ICAI did not publish question papers for attempts before September 2026.",
    "Documents for attempts that have not happened yet appear only once ICAI publishes them.",
  ],
  cma: [
    "Suggested answers: ICMAI provides these only through a student login (registration number required), so none are linked here.",
    "Foundation question papers: the official site lists them only for the June 2026 term; earlier terms list Intermediate and Final papers only.",
    "Some Final-level study material is shared by ICMAI through third-party file hosting and is not linked here until it can be verified as authorised.",
  ],
};
