import type { AttemptId, Provenance, QuestionType, RepeatStatus, SubjectSlug, SyllabusStatus } from "./domain";

/** Every analytics payload says where its numbers came from and how big the window is. */
/** Human-reviewed coverage behind real analytics (absent for demonstration data). */
export interface ReleaseCoverage {
  release: string;
  taxonomyVersion: string;
  methodologyVersion: string;
  reviewedRecords: number;
  excludedRecords: number;
  totalRecords: number;
  /** Attempts in which every record has a human review decision; the analysis window is limited to these. */
  releasedAttempts: AttemptId[];
  allAttempts: number;
  /** Concept keys reviewed (repeat / recurring-concept analysis may be shown). */
  conceptAnalysis: boolean;
  releaseDate?: string | null;
  /** Plain statement of who reviewed the records (e.g. one named reviewer, no independent verification). */
  reviewBasis?: string;
  independentVerification?: boolean;
}

export interface AnalyticsEnvelope {
  provenance: Provenance;
  coverage?: ReleaseCoverage | null;
  /** verificationStatus values counted by analytics (e.g. ["APPROVED"] or ["DEMO"]). */
  acceptedVerificationStatuses: string[];
  subject: SubjectSlug;
  attemptsInWindow: AttemptId[];
  taxonomyVersion: string;
  generatedFrom: string; // e.g. "mock/questions/clp.json" or "web_export release_2026xxxx"
}

/** Free-tier headline numbers. */
export interface SubjectSummary extends AnalyticsEnvelope {
  attemptsAnalyzed: number;
  questionCount: number;
  marksAnalyzed: number;
  chaptersCovered: number;
  lastAttempt: AttemptId | null;
  /** Records present in the dataset but excluded from analytics, by reason (methodology §8, §10). */
  excluded: { unmapped: number; notAccepted: number; nullMarks: number; alternativeMarks: number };
}

export interface TopicStat {
  topicId: string;
  topicName: string;
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  questionCount: number;
  marks: number;
  attemptsAppeared: AttemptId[];
  marksByAttempt: Partial<Record<AttemptId, number>>;
  coverage: number; // attemptsAppeared.length
  lastSeen: AttemptId | null;
  attemptsSinceLastSeen: number | null;
  longestStreak: number;
  onCurrentStreak: boolean;
  averageMarks: number;
  repeatedConceptClusters: number;
  currentPriorityEligible: boolean;
}

export interface ChapterStat {
  chapterId: string;
  chapterName: string;
  chapterNumber: number;
  part: "I" | "II";
  status: SyllabusStatus;
  questionCount: number;
  marks: number;
  attemptsAppeared: AttemptId[];
  marksByAttempt: Record<string, number>;
  /** CR-007: built only from records whose own topic is current-priority eligible and not held by the review overlay. */
  currentQuestionCount: number;
  currentMarks: number;
  currentMarksByAttempt: Record<string, number>;
}

export type PriorityLabel = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT_HISTORY" | "NOT_EXAMINABLE";

export interface PriorityEntry {
  topicId: string;
  topicName: string;
  chapterName: string;
  label: PriorityLabel;
  points: { coverage: number; marks: number; recency: number; repetition: number; total: number };
  explanation: string;
}

export interface RecurringConcept {
  conceptKey: string;
  conceptName: string;
  topicName: string;
  attempts: AttemptId[];
  occurrences: number;
  /** True when the concept recurs (>= 2 attempts) through records that each count as current-priority evidence. */
  currentPriorityEligible: boolean;
  /** Attempts in which the concept appears through current-priority records only. */
  currentAttempts: AttemptId[];
}

export interface AttemptStat {
  attempt: AttemptId;
  label: string;
  questionCount: number;
  marks: number;
  topChapters: { chapterName: string; marks: number }[];
}

export interface SubjectAnalytics extends AnalyticsEnvelope {
  /** Historical: every eligible record, including records held by the review overlay. */
  topics: TopicStat[];
  /** Current-syllabus evidence: only records that each count as current (own topic eligible, no review hold). */
  currentTopics: TopicStat[];
  chapters: ChapterStat[];
  priority: PriorityEntry[];
  recurringConcepts: RecurringConcept[];
  attempts: AttemptStat[];
  questionTypes: { type: QuestionType; count: number; marks: number }[];
  repeatBreakdown: { status: RepeatStatus; count: number }[];
}
