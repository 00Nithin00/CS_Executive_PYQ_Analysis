// Analytics eligibility invariants: per-record chapter figures (CR-007), per-record recurring-concept
// eligibility, and the review-status overlay (held records stay historical, never current-priority evidence).
import { describe, expect, it } from "vitest";
import { computeAnalytics, indexTaxonomy } from "@/lib/analytics/compute";
import type { AnalyticsEnvelope } from "@/types/analytics";
import type { AttemptId, ExamAttempt, QuestionRecord, SyllabusStatus, Taxonomy, Topic } from "@/types/domain";

const ATTEMPTS: ExamAttempt[] = [
  { id: "2024-06", label: "June 2024", shortLabel: "Jun 2024", syllabusVersion: "2022-original" },
  { id: "2024-12", label: "December 2024", shortLabel: "Dec 2024", syllabusVersion: "2022-original" },
  { id: "2025-06", label: "June 2025", shortLabel: "Jun 2025", syllabusVersion: "2022-original" },
  { id: "2025-12", label: "December 2025", shortLabel: "Dec 2025", syllabusVersion: "2022-mod-dec2025" },
];
const WINDOW = ATTEMPTS.map((a) => a.id);

const topic = (id: string, current: boolean): Topic => ({
  id,
  name: id,
  status: (current ? "CURRENT" : "DELETED_FROM_DEC2025") as SyllabusStatus,
  classificationUse: "CLASSIFIABLE",
  currentPriorityEligible: current,
  historicalAnalyticsEligible: true,
  lessonBySyllabusVersion: current ? { "2022-original": id.slice(0, 7), "2022-mod-dec2025": id.slice(0, 7) } : { "2022-original": id.slice(0, 7) },
  subtopics: [],
});

// L10 is PARTIALLY_DELETED: one deleted topic (T02) and one current topic (T01).
const TAX: Taxonomy = {
  subject: "clp",
  taxonomyVersion: "test",
  chapters: [
    {
      id: "CLP.L10", name: "Compromise", status: "PARTIALLY_DELETED", classificationUse: "STRUCTURAL", currentPriorityEligible: true,
      historicalAnalyticsEligible: true, number: 10, part: "I", studyMaterialLesson: 10,
      topics: [topic("CLP.L10.T01", true), topic("CLP.L10.T02", false)],
    },
    {
      id: "CLP.L11", name: "Dormant", status: "CURRENT", classificationUse: "STRUCTURAL", currentPriorityEligible: true,
      historicalAnalyticsEligible: true, number: 11, part: "I", studyMaterialLesson: 11,
      topics: [topic("CLP.L11.T01", true)],
    },
  ],
};
const IDX = indexTaxonomy(TAX);
const ENV: AnalyticsEnvelope = { provenance: "DEMO", acceptedVerificationStatuses: ["DEMO"], subject: "clp", attemptsInWindow: WINDOW, taxonomyVersion: "test", generatedFrom: "test" };

let n = 0;
const q = (topicId: string, attempt: AttemptId, marks: number, extra: Partial<QuestionRecord> = {}): QuestionRecord => ({
  id: `T-${++n}`, isDemo: true, subject: "clp", paperCode: "522", attempt, syllabusVersion: "2022-original", questionNumber: 1,
  subQuestion: null, paperPart: "I", marks, questionText: "", questionType: "descriptive_theory", chapterId: topicId.slice(0, 7),
  topicId, subtopicId: null, conceptKey: `concept-${n}`, canonicalTaxonomyLocation: topicId, historicalLessonAtExamTime: topicId.slice(0, 7),
  historicalNodeAtExamTime: null, syllabusStatus: IDX.topic.get(topicId)!.status, verificationStatus: "DEMO", classificationConfidence: "HIGH",
  choiceGroupId: null, isAlternative: false, repeatStatus: "FIRST_SEEN", relatedQuestionIds: [], sourceUrl: null, sourcePage: null, ...extra,
});

describe("chapter eligibility is per record (CR-007)", () => {
  it("does not take the chapter's current figures from its first record", () => {
    // First L10 record is on the DELETED topic, the second on the CURRENT topic, then deleted again.
    const records = [q("CLP.L10.T02", "2024-06", 5), q("CLP.L10.T01", "2024-12", 3), q("CLP.L10.T02", "2025-06", 4)];
    const ch = computeAnalytics(ENV, records, IDX, ATTEMPTS).chapters.find((c) => c.chapterId === "CLP.L10")!;
    expect(ch.marks).toBe(12); // historical: every record
    expect(ch.questionCount).toBe(3);
    expect(ch.currentMarks).toBe(3); // current: only the record whose own topic is current
    expect(ch.currentQuestionCount).toBe(1);
    expect(ch.currentMarksByAttempt).toEqual({ "2024-06": 0, "2024-12": 3, "2025-06": 0, "2025-12": 0 });
  });

  it("gives the same current figures whichever record comes first", () => {
    const a = [q("CLP.L10.T01", "2024-12", 3), q("CLP.L10.T02", "2024-06", 5)];
    const b = [...a].reverse();
    const pick = (rs: QuestionRecord[]) => computeAnalytics(ENV, rs, IDX, ATTEMPTS).chapters.find((c) => c.chapterId === "CLP.L10")!;
    expect(pick(a).currentMarks).toBe(pick(b).currentMarks);
    expect(pick(a).currentMarks).toBe(3);
  });
});

describe("recurring concepts use each record's own eligibility", () => {
  it("does not mark a concept current because its first record is current", () => {
    const records = [q("CLP.L10.T01", "2024-06", 2, { conceptKey: "k" }), q("CLP.L10.T02", "2024-12", 2, { conceptKey: "k" }), q("CLP.L10.T02", "2025-06", 2, { conceptKey: "k" })];
    const c = computeAnalytics(ENV, records, IDX, ATTEMPTS).recurringConcepts.find((x) => x.conceptKey === "k")!;
    expect(c.attempts).toEqual(["2024-06", "2024-12", "2025-06"]); // historical recurrence kept
    expect(c.currentAttempts).toEqual(["2024-06"]);
    expect(c.currentPriorityEligible).toBe(false);
  });

  it("marks a concept current when it recurs through current records even if the first record is deleted content", () => {
    const records = [q("CLP.L10.T02", "2024-06", 2, { conceptKey: "m" }), q("CLP.L11.T01", "2024-12", 2, { conceptKey: "m" }), q("CLP.L10.T01", "2025-06", 2, { conceptKey: "m" })];
    const c = computeAnalytics(ENV, records, IDX, ATTEMPTS).recurringConcepts.find((x) => x.conceptKey === "m")!;
    expect(c.currentAttempts).toEqual(["2024-12", "2025-06"]);
    expect(c.currentPriorityEligible).toBe(true);
  });
});

describe("review-status overlay (currentPriorityHold)", () => {
  const base = [q("CLP.L11.T01", "2024-06", 5), q("CLP.L11.T01", "2024-12", 5), q("CLP.L11.T01", "2025-06", 5), q("CLP.L10.T01", "2025-12", 3)];
  const held = q("CLP.L11.T01", "2025-12", 10, { currentPriorityHold: true });

  it("keeps held records in historical topic and chapter figures", () => {
    const a = computeAnalytics(ENV, [...base, held], IDX, ATTEMPTS);
    const t = a.topics.find((x) => x.topicId === "CLP.L11.T01")!;
    expect(t.marks).toBe(25);
    expect(t.coverage).toBe(4);
    const ch = a.chapters.find((c) => c.chapterId === "CLP.L11")!;
    expect(ch.marks).toBe(25);
    expect(ch.currentMarks).toBe(15);
  });

  it("excludes held records from priority evidence: identical to the dataset without them", () => {
    const withHold = computeAnalytics(ENV, [...base, held], IDX, ATTEMPTS).priority;
    const without = computeAnalytics(ENV, base, IDX, ATTEMPTS).priority;
    expect(withHold).toEqual(without);
    const notHeld = computeAnalytics(ENV, [...base, { ...held, currentPriorityHold: false }], IDX, ATTEMPTS).priority;
    expect(notHeld).not.toEqual(without); // the hold is what removes it, not some other filter
  });

  it("changes nothing when no record is held", () => {
    const a = computeAnalytics(ENV, base, IDX, ATTEMPTS);
    const b = computeAnalytics(ENV, base.map((r) => ({ ...r, currentPriorityHold: false })), IDX, ATTEMPTS);
    expect(b.priority).toEqual(a.priority);
    expect(b.topics).toEqual(a.topics);
    expect(b.chapters).toEqual(a.chapters);
  });
});
