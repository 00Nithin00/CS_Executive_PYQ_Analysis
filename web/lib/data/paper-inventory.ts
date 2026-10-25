// Real question-paper inventory (official papers, structure and marks only). Separate from the analytics provider:
// it carries no question text and no classifications, so it can be shown publicly while classification review is pending.
import clp from "@/content/papers/clp-paper-inventory.json";
import clpRelease from "@/content/releases/clp-approved-release.json";
import type { SubjectSlug } from "@/types/domain";
import type { PaperInventory } from "@/types/papers";

const INVENTORIES: Partial<Record<SubjectSlug, PaperInventory>> = { clp: clp as PaperInventory };

export function getPaperInventory(slug: SubjectSlug): PaperInventory | null {
  return INVENTORIES[slug] ?? null;
}

/** Human review progress, from the approved release (the only record of named human decisions). */
export interface ReviewProgress {
  reviewed: number;
  total: number;
  releasedAttempts: number;
}

const REVIEW: Partial<Record<SubjectSlug, ReviewProgress>> = {
  clp: { reviewed: clpRelease.meta.reviewedRecords, total: clpRelease.meta.totalRecords, releasedAttempts: clpRelease.meta.releasedAttempts.length },
};

export function getReviewProgress(slug: SubjectSlug): ReviewProgress | null {
  return REVIEW[slug] ?? null;
}
