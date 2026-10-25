// Approved-release selection for the public provider (pure; no I/O, no server-only).
// Real classifications reach the public analytics only through content/releases/<subject>-approved-release.json,
// written by scripts/build_clp_approved_release.py from named human review decisions. Until at least
// MIN_RELEASED_ATTEMPTS attempts are fully reviewed, the provider keeps the labelled demonstration set.
import type { ReleaseCoverage } from "@/types/analytics";
import type { AttemptId, ExamAttempt, QuestionRecord } from "@/types/domain";
import type { QuestionSet } from "./provider";

export const MIN_RELEASED_ATTEMPTS = 2;

export interface ApprovedRelease {
  meta: {
    release: string;
    taxonomyVersion: string;
    methodologyVersion: string;
    totalRecords: number;
    reviewedRecords: number;
    excludedRecords: number;
    attemptCoverage: { attempt: string; label: string; total: number; reviewed: number; excluded: number; complete: boolean }[];
    releasedAttempts: string[];
    conceptAnalysis: boolean;
    releaseDate?: string | null;
    reviewBasis?: string;
    independentVerification?: boolean;
  };
  records: QuestionRecord[];
}

export function releaseCoverage(release: ApprovedRelease, attempts: ExamAttempt[]): ReleaseCoverage {
  const order = attempts.map((a) => a.id as string);
  return {
    release: release.meta.release,
    taxonomyVersion: release.meta.taxonomyVersion,
    methodologyVersion: release.meta.methodologyVersion,
    reviewedRecords: release.meta.reviewedRecords,
    excludedRecords: release.meta.excludedRecords,
    totalRecords: release.meta.totalRecords,
    releasedAttempts: release.meta.releasedAttempts.filter((a) => order.includes(a)).sort((a, b) => order.indexOf(a) - order.indexOf(b)) as AttemptId[],
    allAttempts: attempts.length,
    conceptAnalysis: release.meta.conceptAnalysis,
    releaseDate: release.meta.releaseDate ?? null,
    reviewBasis: release.meta.reviewBasis,
    independentVerification: release.meta.independentVerification ?? false,
  };
}

/** The question set the public analytics may use: the approved release once enough attempts are fully reviewed, else the demo set. */
export function selectQuestionSet(release: ApprovedRelease | null, demo: QuestionSet, attempts: ExamAttempt[], source: string): { set: QuestionSet; coverage: ReleaseCoverage | null } {
  if (!release) return { set: demo, coverage: null };
  const coverage = releaseCoverage(release, attempts);
  if (coverage.releasedAttempts.length < MIN_RELEASED_ATTEMPTS) return { set: demo, coverage: null };
  const released = new Set<string>(coverage.releasedAttempts);
  const records = release.records.filter((r) => r.verificationStatus === "APPROVED" && !r.isDemo && released.has(r.attempt));
  return { set: { provenance: "VERIFIED", generatedFrom: source, records }, coverage };
}
