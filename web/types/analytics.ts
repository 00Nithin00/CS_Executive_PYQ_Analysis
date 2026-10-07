import type { AttemptId, Provenance, QuestionType, RepeatStatus, SubjectSlug, SyllabusStatus } from "./domain";

/** Every analytics payload says where its numbers came from and how big the window is. */
export interface AnalyticsEnvelope {
  provenance: Provenance;
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
  currentPriorityEligible: boolean;
}

export interface AttemptStat {
  attempt: AttemptId;
  label: string;
  questionCount: number;
  marks: number;
  topChapters: { chapterName: string; marks: number }[];
}

export interface SubjectAnalytics extends AnalyticsEnvelope {
  topics: TopicStat[];
  chapters: ChapterStat[];
  priority: PriorityEntry[];
  recurringConcepts: RecurringConcept[];
  attempts: AttemptStat[];
  questionTypes: { type: QuestionType; count: number; marks: number }[];
  repeatBreakdown: { status: RepeatStatus; count: number }[];
}
