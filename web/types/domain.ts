// Domain types shared by the UI, the data providers and (later) the database layer.
// The academic shapes follow PROJECT_METHODOLOGY.md (v0.3) §5 and the frozen CLP taxonomy (v0.3; nodes unchanged from v0.2).

export type SubjectSlug = "jigl" | "clp" | "sbill" | "cafm" | "cmsl" | "ecipl" | "tlp";

export type AttemptId = `${number}-${"06" | "12"}`;

export type SyllabusVersion = "2022-original" | "2022-mod-dec2025";

export type SyllabusStatus = "CURRENT" | "DELETED_FROM_DEC2025" | "PARTIALLY_DELETED" | "OUT_OF_TAXONOMY_REVIEW";

/**
 * Where a dataset came from. The UI must label anything that is not VERIFIED.
 * CANDIDATE: the local AI-desk-review candidate preview only (never served by the production provider).
 */
export type Provenance = "DEMO" | "VERIFIED" | "CANDIDATE";

/** How far an analytics product is from being publishable for a subject. */
export type IntelligenceStatus = "AVAILABLE" | "DEMO" | "IN_PREPARATION";

export interface ExamAttempt {
  id: AttemptId;
  label: string; // "December 2025"
  shortLabel: string; // "Dec 2025"
  syllabusVersion: SyllabusVersion;
}

export interface SubjectPart {
  label: string;
  marks: number;
}

export interface Subject {
  slug: SubjectSlug;
  paperNumber: number;
  paperCode: string;
  group: 1 | 2;
  name: string;
  shortName: string;
  description: string;
  parts: SubjectPart[];
  /** Lesson names from the ICSI Syllabus 2022 (S1). */
  lessons: { number: number; name: string; status: SyllabusStatus }[];
  taxonomyVersion: string | null;
  intelligenceStatus: IntelligenceStatus;
}

export interface TaxonomyNodeBase {
  id: string;
  name: string;
  status: SyllabusStatus;
  classificationUse: "CLASSIFIABLE" | "STRUCTURAL" | "ALIAS_ONLY" | "CONTROL";
  currentPriorityEligible: boolean;
  historicalAnalyticsEligible: boolean;
  classifyTo?: string;
  lessonBySyllabusVersion?: Partial<Record<SyllabusVersion, string>>;
}

export type Subtopic = TaxonomyNodeBase;

export interface Topic extends TaxonomyNodeBase {
  subtopics: Subtopic[];
}

export interface Chapter extends TaxonomyNodeBase {
  number: number;
  part: "I" | "II";
  studyMaterialLesson: number | null;
  topics: Topic[];
}

export interface Taxonomy {
  subject: SubjectSlug;
  taxonomyVersion: string;
  chapters: Chapter[];
}

export type QuestionType =
  | "mcq"
  | "descriptive_theory"
  | "short_note"
  | "comment_true_false"
  | "practical_application"
  | "case_based"
  | "numerical"
  | "drafting";

export type RepeatStatus =
  | "FIRST_SEEN"
  | "EXACT_REPEAT"
  | "CONCEPTUAL_REPEAT"
  | "TOPIC_REPEAT"
  | "CHAPTER_REPEAT"
  | "UNRESOLVED";

/** Full question record (server-side only). */
export interface QuestionRecord {
  id: string;
  isDemo: boolean;
  subject: SubjectSlug;
  paperCode: string;
  attempt: AttemptId;
  syllabusVersion: SyllabusVersion;
  questionNumber: number;
  subQuestion: string | null;
  paperPart: "I" | "II";
  marks: number | null;
  questionText: string;
  questionType: QuestionType;
  chapterId: string;
  topicId: string;
  subtopicId: string | null;
  conceptKey: string;
  canonicalTaxonomyLocation: string;
  historicalLessonAtExamTime: string | null;
  /** Set when the concept sat in a now-alias node at exam time (methodology §5.3). */
  historicalNodeAtExamTime: string | null;
  syllabusStatus: SyllabusStatus;
  /** "APPROVED" for released research records; "DEMO" for synthetic records. Analytics accept only the provider's accepted status. */
  verificationStatus: string;
  classificationConfidence: "HIGH" | "MEDIUM" | "LOW" | null;
  /** Internal alternatives ("OR" / "attempt any"): marks count once per choice group (methodology §5.1, §8). */
  choiceGroupId: string | null;
  isAlternative: boolean;
  repeatStatus: RepeatStatus;
  relatedQuestionIds: string[];
  sourceUrl: string | null;
  sourcePage: number | null;
  /**
   * Review-status overlay: true while the record's review is unresolved. It stays in every historical figure
   * but never counts as current-syllabus priority evidence. Per record; the node's own eligibility is unchanged.
   */
  currentPriorityHold?: boolean;
}

/** What a Free viewer is allowed to receive. */
export interface BasicQuestion {
  id: string;
  isDemo: boolean;
  subject: SubjectSlug;
  attempt: AttemptId;
  label: string; // "Q4(a)"
  marks: number | null;
  questionText: string;
  chapter: { id: string; name: string; number: number };
  sourceUrl: string | null;
}

/** Pro adds topic placement, type and repeat intelligence. */
export interface ProQuestion extends BasicQuestion {
  topic: { id: string; name: string };
  subtopic: { id: string; name: string } | null;
  questionType: QuestionType;
  repeatStatus: RepeatStatus;
  previousAppearances: { attempt: AttemptId; label: string }[];
  syllabusStatus: SyllabusStatus;
}

export type ExplorerQuestion = BasicQuestion | ProQuestion;

export const isProQuestion = (q: ExplorerQuestion): q is ProQuestion => "repeatStatus" in q;

export type ResourceType =
  | "STUDY_MATERIAL"
  | "QUESTION_PAPER"
  | "GUIDELINE_ANSWER"
  | "SUPPLEMENT"
  | "SYLLABUS"
  | "NOTICE"
  | "RELEVANT_MATERIAL";

export interface OfficialResource {
  id: string;
  title: string;
  resourceType: ResourceType;
  subject: SubjectSlug | null;
  subjectsCovered?: SubjectSlug[];
  group?: string;
  attempt?: string;
  paperCode?: string;
  syllabus: string;
  officialUrl: string;
  sourcePage: string;
  applicableExam: string;
  language?: string;
  note?: string;
  lastVerified: string;
  status: "ACTIVE" | "SUPERSEDED" | "BROKEN";
}
