// Plans map to capabilities. Change the split here; no page needs to change.
import type { Capability } from "./capabilities";

export type PlanId = "FREE" | "PRO";

export const PLAN_CAPABILITIES: Record<PlanId, readonly Capability[]> = {
  FREE: ["OFFICIAL_RESOURCES", "BASIC_PYQ"],
  PRO: [
    "OFFICIAL_RESOURCES",
    "BASIC_PYQ",
    "PYQ_ANALYTICS",
    "TOPIC_FREQUENCY",
    "MARKS_ANALYSIS",
    "REPEAT_ANALYSIS",
    "ADVANCED_FILTERS",
    "PRIORITY_TOPICS",
    "STUDY_PLANNER",
    "PROGRESS_TRACKING",
    "BOOKMARKS",
    "MOCK_TESTS",
    "AI_ASSISTANT",
    "ADVANCED_ANALYTICS",
  ],
};

/** Capabilities anyone gets, signed in or not. */
export const ANONYMOUS_CAPABILITIES: readonly Capability[] = ["OFFICIAL_RESOURCES", "BASIC_PYQ"];
