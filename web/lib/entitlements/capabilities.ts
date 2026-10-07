// Central capability registry. Pages and data functions check capabilities, never plan names.

export const CAPABILITIES = [
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
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export type FeatureAvailability = "AVAILABLE" | "COMING_SOON";

export interface FeatureInfo {
  capability: Capability;
  label: string;
  description: string;
  availability: FeatureAvailability;
}

/** Human-facing description of every capability (pricing page, lock panels). */
export const FEATURES: Record<Capability, FeatureInfo> = {
  OFFICIAL_RESOURCES: { capability: "OFFICIAL_RESOURCES", label: "Official ICSI resources", description: "Study material, previous papers, guideline answers, supplements and syllabus, linked to the official ICSI source.", availability: "AVAILABLE" },
  BASIC_PYQ: { capability: "BASIC_PYQ", label: "PYQ browser", description: "Browse previous questions by subject, attempt and chapter.", availability: "AVAILABLE" },
  PYQ_ANALYTICS: { capability: "PYQ_ANALYTICS", label: "PYQ analytics", description: "Topic-level analysis for each subject once its dataset is verified.", availability: "AVAILABLE" },
  TOPIC_FREQUENCY: { capability: "TOPIC_FREQUENCY", label: "Topic frequency", description: "How often each topic has appeared across attempts.", availability: "AVAILABLE" },
  MARKS_ANALYSIS: { capability: "MARKS_ANALYSIS", label: "Marks-weight analysis", description: "Where the marks have historically gone, by chapter and topic.", availability: "AVAILABLE" },
  REPEAT_ANALYSIS: { capability: "REPEAT_ANALYSIS", label: "Repeat & concept analysis", description: "Which concepts recur, and when they last appeared.", availability: "AVAILABLE" },
  ADVANCED_FILTERS: { capability: "ADVANCED_FILTERS", label: "Advanced filters", description: "Filter by topic, marks, question type and repeat status.", availability: "AVAILABLE" },
  PRIORITY_TOPICS: { capability: "PRIORITY_TOPICS", label: "Evidence-based priorities", description: "Transparent HIGH / MEDIUM / LOW study priorities with the evidence behind each.", availability: "AVAILABLE" },
  STUDY_PLANNER: { capability: "STUDY_PLANNER", label: "Study planner", description: "A plan built around your exam date and historical priorities.", availability: "AVAILABLE" },
  PROGRESS_TRACKING: { capability: "PROGRESS_TRACKING", label: "Progress tracking", description: "Mark chapters as covered and see what is left.", availability: "AVAILABLE" },
  BOOKMARKS: { capability: "BOOKMARKS", label: "Bookmarks", description: "Save questions to revisit.", availability: "AVAILABLE" },
  MOCK_TESTS: { capability: "MOCK_TESTS", label: "Mock tests", description: "Timed practice papers built from the question bank.", availability: "COMING_SOON" },
  AI_ASSISTANT: { capability: "AI_ASSISTANT", label: "AI study assistant", description: "Ask questions about topics and past questions.", availability: "COMING_SOON" },
  ADVANCED_ANALYTICS: { capability: "ADVANCED_ANALYTICS", label: "Advanced analytics", description: "Cross-attempt comparisons and deeper breakdowns.", availability: "COMING_SOON" },
};
