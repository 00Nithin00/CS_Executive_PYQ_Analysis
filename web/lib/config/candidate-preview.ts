// Local AI-desk-review candidate preview: label, switch and file locations.
// The preview never replaces the production/demo provider; it is a separate, opt-in route.
import { resolve } from "node:path";

export const CANDIDATE_LABEL = "AI DESK REVIEW CANDIDATE — NOT PROFESSIONALLY VERIFIED";

export const CANDIDATE_DISCLOSURE =
  "Local, non-production preview. These figures come from the v0.2 candidate classification of the CLP Paper 522 questions, after an AI desk review (not a qualified human or professional review). No record is human-reviewed, independently verified or approved, and the cited Acts, Rules and Secretarial Standards have not been verified as in force on each exam date. Do not share these figures as validated findings.";

export const CANDIDATE_ROUTE = "/preview/candidate";

/** Off unless explicitly enabled for a local run (`CANDIDATE_PREVIEW=1`). Production builds leave it unset. */
export function candidatePreviewEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.CANDIDATE_PREVIEW === "1";
}

export interface CandidatePreviewPaths {
  root: string;
  dataset: string;
  overlay: string;
  taxonomy: string;
  raw: string;
}

/** Research files live in the repository root, one level above `web/`. Each can be overridden for a local run or a test. */
export function candidatePreviewPaths(env: NodeJS.ProcessEnv = process.env): CandidatePreviewPaths {
  const root = env.CANDIDATE_PREVIEW_ROOT ?? resolve(process.cwd(), "..");
  return {
    root,
    dataset: env.CANDIDATE_PREVIEW_DATASET ?? resolve(root, "03_Classified_Questions/CLP_classified_questions_v0.2_ai_desk_review_candidate.json"),
    overlay: env.CANDIDATE_PREVIEW_OVERLAY ?? resolve(root, "04_Verification/ai_desk_review_2026-10-24/implementation_v0.2/REVIEW_STATUS_OVERLAY.json"),
    taxonomy: env.CANDIDATE_PREVIEW_TAXONOMY ?? resolve(root, "taxonomy/clp_taxonomy_v0.3.json"),
    raw: env.CANDIDATE_PREVIEW_RAW ?? resolve(root, "02_Raw_Extraction/CLP_atomic_questions_raw.json"),
  };
}
