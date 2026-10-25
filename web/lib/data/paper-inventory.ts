// Real question-paper inventory (official papers, structure and marks only). Separate from the analytics provider:
// it carries no question text and no classifications, so it can be shown publicly while classification review is pending.
import clp from "@/content/papers/clp-paper-inventory.json";
import type { SubjectSlug } from "@/types/domain";
import type { PaperInventory } from "@/types/papers";

const INVENTORIES: Partial<Record<SubjectSlug, PaperInventory>> = { clp: clp as PaperInventory };

export function getPaperInventory(slug: SubjectSlug): PaperInventory | null {
  return INVENTORIES[slug] ?? null;
}
