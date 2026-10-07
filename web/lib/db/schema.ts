// PostgreSQL schema (Drizzle). Not yet connected — the app runs on the file store + mock provider.
// Academic tables mirror PROJECT_METHODOLOGY.md v0.3 §5 and the frozen taxonomy files exactly;
// this schema stores the research output, it does not define a competing taxonomy.
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------- accounts & monetisation
export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const planEnum = pgEnum("plan", ["FREE", "PRO"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["ACTIVE", "CANCELLED", "EXPIRED", "PAST_DUE"]);
export const subscriptionSourceEnum = pgEnum("subscription_source", ["ADMIN_GRANT", "RAZORPAY", "STRIPE", "COUPON"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** Session tokens issued before this instant are rejected (set on logout). */
  sessionsRevokedAt: timestamp("sessions_revoked_at", { withTimezone: true }),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    plan: planEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    source: subscriptionSourceEnum("source").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }), // NULL = no expiry (admin grant)
    providerReference: text("provider_reference"),
    grantedBy: uuid("granted_by").references(() => users.id),
    note: text("note"),
  },
  (t) => [index("subscriptions_user_idx").on(t.userId)],
);

/** Optional per-user overrides on top of plan capabilities (e.g. beta access to one feature). */
export const entitlements = pgTable(
  "entitlements",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    capability: text("capability").notNull(), // value from lib/entitlements/capabilities.ts
    granted: boolean("granted").notNull().default(true),
    source: subscriptionSourceEnum("source").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.capability] })],
);

// ---------------------------------------------------------------- taxonomy (versioned, frozen per release)
export const syllabusStatusEnum = pgEnum("syllabus_status", ["CURRENT", "DELETED_FROM_DEC2025", "PARTIALLY_DELETED", "OUT_OF_TAXONOMY_REVIEW"]);
export const classificationUseEnum = pgEnum("classification_use", ["CLASSIFIABLE", "STRUCTURAL", "ALIAS_ONLY", "CONTROL"]);

export const subjects = pgTable("subjects", {
  slug: text("slug").primaryKey(), // jigl, clp, ...
  paperNumber: integer("paper_number").notNull(),
  paperCode: text("paper_code").notNull().unique(), // 521..527
  groupNo: integer("group_no").notNull(),
  name: text("name").notNull(),
  taxonomyVersion: text("taxonomy_version"), // e.g. "0.2"
});

const taxonomyColumns = {
  id: text("id").primaryKey(), // taxonomy_id, e.g. CLP.L14.T03
  taxonomyVersion: text("taxonomy_version").notNull(),
  name: text("name").notNull(),
  status: syllabusStatusEnum("status").notNull(),
  classificationUse: classificationUseEnum("classification_use").notNull(),
  historicalAnalyticsEligible: boolean("historical_analytics_eligible").notNull(),
  currentPriorityEligible: boolean("current_priority_eligible").notNull(),
  classifyTo: text("classify_to"),
  lessonBySyllabusVersion: jsonb("lesson_by_syllabus_version"),
  sourceReference: jsonb("topic_source_reference"),
};

export const chapters = pgTable("chapters", {
  ...taxonomyColumns,
  subjectSlug: text("subject_slug").notNull().references(() => subjects.slug),
  number: integer("number").notNull(), // canonical = syllabus lesson number
  part: text("part"),
  studyMaterialLesson: integer("study_material_lesson"),
});

export const topics = pgTable("topics", {
  ...taxonomyColumns,
  chapterId: text("chapter_id").notNull().references(() => chapters.id),
});

export const subtopics = pgTable("subtopics", {
  ...taxonomyColumns,
  topicId: text("topic_id").notNull().references(() => topics.id),
  basis: text("basis"), // study_material_heading | statutory_provision
});

// ---------------------------------------------------------------- examinations & questions
export const examAttempts = pgTable("exam_attempts", {
  id: text("id").primaryKey(), // "2025-12"
  label: text("label").notNull(),
  syllabusVersion: text("syllabus_version").notNull(), // 2022-original | 2022-mod-dec2025
  examStart: timestamp("exam_start", { withTimezone: true }),
});

export const papers = pgTable(
  "papers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subjectSlug: text("subject_slug").notNull().references(() => subjects.slug),
    attemptId: text("attempt_id").notNull().references(() => examAttempts.id),
    paperCode: text("paper_code").notNull(),
    officialUrl: text("official_url").notNull(),
    sha256: text("sha256"),
    totalQuestionsPrinted: integer("total_questions_printed"),
    maxMarksPrinted: integer("max_marks_printed"),
    guidelineAnswerUrl: text("guideline_answer_url"),
  },
  (t) => [uniqueIndex("papers_attempt_code_idx").on(t.attemptId, t.paperCode)],
);

/** One row per atomic question unit (methodology §5). Only APPROVED records are imported. */
export const questions = pgTable(
  "questions",
  {
    id: text("id").primaryKey(), // EP-2022-522-2025D-Q1-a-ii
    paperId: uuid("paper_id").notNull().references(() => papers.id),
    parentQuestionId: text("parent_question_id"),
    questionNumber: integer("question_number").notNull(),
    subQuestion: text("sub_question"),
    paperPart: text("paper_part"),
    choiceGroupId: text("choice_group_id"),
    isAlternative: boolean("is_alternative").notNull().default(false),
    questionText: text("question_text").notNull(),
    marks: integer("marks"), // NULL when not printed — never estimated
    questionType: text("question_type").notNull(),
    canonicalTaxonomyLocation: text("canonical_taxonomy_location").notNull(),
    chapterId: text("chapter_id").notNull().references(() => chapters.id),
    topicId: text("topic_id").notNull().references(() => topics.id),
    subtopicId: text("subtopic_id").references(() => subtopics.id),
    historicalLessonAtExamTime: text("historical_lesson_at_exam_time"),
    historicalNodeAtExamTime: text("historical_node_at_exam_time"),
    conceptKey: text("concept_key"),
    classificationConfidence: text("classification_confidence"),
    repeatStatus: text("repeat_status"),
    sourcePage: integer("source_page"),
    taxonomyVersion: text("taxonomy_version").notNull(),
    methodologyVersion: text("methodology_version").notNull(),
    verificationStatus: text("verification_status").notNull(),
    releaseId: text("release_id").notNull(), // 05_Approved_Dataset release
  },
  (t) => [index("questions_topic_idx").on(t.topicId), index("questions_paper_idx").on(t.paperId)],
);

export const questionRepeats = pgTable(
  "question_repeats",
  {
    questionId: text("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    relatedQuestionId: text("related_question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
    relation: text("relation").notNull(), // EXACT_REPEAT | CONCEPTUAL_REPEAT | TOPIC_REPEAT | CHAPTER_REPEAT
    confidence: text("confidence"),
  },
  (t) => [primaryKey({ columns: [t.questionId, t.relatedQuestionId] })],
);

// ---------------------------------------------------------------- analytics (computed per release, never hand-edited)
export const analyticsSubject = pgTable("analytics_subject", {
  subjectSlug: text("subject_slug").notNull().references(() => subjects.slug),
  releaseId: text("release_id").notNull(),
  payload: jsonb("payload").notNull(), // SubjectSummary
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.subjectSlug, t.releaseId] })]);

export const analyticsTopic = pgTable("analytics_topic", {
  topicId: text("topic_id").notNull().references(() => topics.id),
  releaseId: text("release_id").notNull(),
  payload: jsonb("payload").notNull(), // TopicStat + PriorityEntry
}, (t) => [primaryKey({ columns: [t.topicId, t.releaseId] })]);

export const analyticsAttempt = pgTable("analytics_attempt", {
  subjectSlug: text("subject_slug").notNull().references(() => subjects.slug),
  attemptId: text("attempt_id").notNull().references(() => examAttempts.id),
  releaseId: text("release_id").notNull(),
  payload: jsonb("payload").notNull(), // AttemptStat
}, (t) => [primaryKey({ columns: [t.subjectSlug, t.attemptId, t.releaseId] })]);

// ---------------------------------------------------------------- official resources (links only)
export const resources = pgTable("resources", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  resourceType: text("resource_type").notNull(),
  subjectSlug: text("subject_slug").references(() => subjects.slug),
  attemptId: text("attempt_id"),
  syllabus: text("syllabus").notNull(),
  officialUrl: text("official_url").notNull(),
  sourcePage: text("source_page"),
  applicableExam: text("applicable_exam"),
  lastVerified: timestamp("last_verified", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("ACTIVE"),
});

// ---------------------------------------------------------------- personal data
export const userProgress = pgTable("user_progress", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  chapterId: text("chapter_id").notNull().references(() => chapters.id),
  status: text("status").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.chapterId] })]);

export const bookmarks = pgTable("bookmarks", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.questionId] })]);

export const studyPlans = pgTable("study_plans", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  examAttempt: text("exam_attempt").notNull(),
  subjects: jsonb("subjects").notNull().default(sql`'[]'::jsonb`),
  hoursPerWeek: integer("hours_per_week").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// P2 — schema reserved, no UI yet
export const mockTests = pgTable("mock_tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectSlug: text("subject_slug").notNull().references(() => subjects.slug),
  title: text("title").notNull(),
  questionIds: jsonb("question_ids").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

export const testAttempts = pgTable("test_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mockTestId: uuid("mock_test_id").notNull().references(() => mockTests.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  score: integer("score"),
});
