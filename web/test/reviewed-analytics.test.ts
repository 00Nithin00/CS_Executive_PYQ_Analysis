// The public CLP analytics, recomputed independently from the reviewed release and the paper inventory.
// Every figure the provider serves must match a direct calculation from the source records.
import { describe, expect, it } from "vitest";
import inventoryJson from "@/content/papers/clp-paper-inventory.json";
import releaseJson from "@/content/releases/clp-approved-release.json";
import taxonomyJson from "@/content/taxonomy/clp.json";
import { ATTEMPTS } from "@/content/attempts";
import { mockProvider } from "@/lib/data/mock-provider";
import type { QuestionRecord } from "@/types/domain";
import type { PaperInventory } from "@/types/papers";

const REL = releaseJson.records as unknown as QuestionRecord[];
const INV = inventoryJson as PaperInventory;
const TOPICS = new Map(taxonomyJson.chapters.flatMap((c) => c.topics.map((t) => [t.id, t] as const)));
const eligible = (r: QuestionRecord) => TOPICS.get(r.topicId)?.historicalAnalyticsEligible === true;
const current = (r: QuestionRecord) => TOPICS.get(r.topicId)?.currentPriorityEligible === true;
const marks = (rs: QuestionRecord[]) => rs.reduce((s, r) => s + (r.isAlternative ? 0 : (r.marks ?? 0)), 0);

describe("reviewed release integrity", () => {
  it("holds all 200 question parts once, matching the paper inventory", () => {
    expect(REL).toHaveLength(200);
    expect(new Set(REL.map((r) => r.id)).size).toBe(200);
    for (const p of INV.papers) {
      const rs = REL.filter((r) => r.attempt === p.attempt);
      expect(rs, p.paperId).toHaveLength(p.totals.atomicParts);
      expect(rs.filter((r) => r.isAlternative), p.paperId).toHaveLength(p.totals.alternativeParts);
      expect(rs.every((r) => r.sourceUrl === null || r.sourceUrl === p.officialPaperUrl), p.paperId).toBe(true);
    }
    expect(REL.every((r) => r.verificationStatus === "APPROVED" && !r.isDemo && r.questionText === "")).toBe(true);
  });

  it("carries no reviewer identity, only the agreed public wording", () => {
    const text = JSON.stringify(releaseJson);
    expect(text).not.toMatch(/reviewer_?name|reviewerAliases|sourceSheet/i); // no name field, no hash of the private sheet
    expect(releaseJson.meta.reviewBasis).toBe("Human-reviewed dataset. Reviewed on 25 October 2026 by one human reviewer; not independently verified.");
    expect(releaseJson.meta.independentVerification).toBe(false);
    expect(releaseJson.meta.reviewerIdentity).toMatch(/confidential/);
  });

  it("keeps the one holding-node record out of every topic figure", () => {
    const held = REL.filter((r) => r.topicId === "CLP.UNMAPPED");
    expect(held.map((r) => r.id)).toEqual(["EP-2022-522-2026J-Q1-d"]);
  });

  it("counts each either/or group once: every paper reconciles to its printed 100 marks", () => {
    for (const p of INV.papers) {
      const rs = REL.filter((r) => r.attempt === p.attempt);
      expect(marks(rs), p.paperId).toBe(p.printed.maximumMarks);
      for (const g of new Set(rs.map((r) => r.choiceGroupId).filter(Boolean))) {
        const counted = rs.filter((r) => r.choiceGroupId === g && !r.isAlternative);
        const options = new Set(rs.filter((r) => r.choiceGroupId === g).map((r) => r.subQuestion?.match(/^Q\d+A?/)?.[0]));
        expect(options.size, `${p.paperId} ${g}`).toBe(2);
        expect(new Set(counted.map((r) => r.subQuestion?.match(/^Q\d+A?/)?.[0])).size, `${p.paperId} ${g}`).toBe(1);
      }
    }
  });
});

describe("served analytics equal a direct calculation from the records", () => {
  it("summary, attempts and either/or marks", async () => {
    const s = (await mockProvider.getSummary("clp"))!;
    const a = (await mockProvider.getAnalytics("clp"))!;
    expect(s.questionCount).toBe(REL.filter(eligible).length);
    expect(s.marksAnalyzed).toBe(marks(REL.filter(eligible)));
    expect(s.excluded.unmapped).toBe(REL.filter((r) => !eligible(r)).length);
    expect(a.attemptsInWindow).toEqual(ATTEMPTS.map((x) => x.id));
    for (const st of a.attempts) {
      const rs = REL.filter((r) => r.attempt === st.attempt);
      expect(st.questionCount, st.attempt).toBe(rs.filter(eligible).length);
      // attempt marks + marks of unmapped records = the printed maximum: nothing counted twice, nothing lost
      expect(st.marks + marks(rs.filter((r) => !eligible(r))), st.attempt).toBe(100);
    }
  });

  it("topic frequency, coverage and marks weight", async () => {
    const a = (await mockProvider.getAnalytics("clp"))!;
    const ids = new Set(REL.filter(eligible).map((r) => r.topicId));
    expect(new Set(a.topics.map((t) => t.topicId))).toEqual(ids);
    for (const t of a.topics) {
      const rs = REL.filter((r) => r.topicId === t.topicId);
      expect(t.questionCount, t.topicId).toBe(rs.length);
      expect(t.marks, t.topicId).toBe(marks(rs));
      expect(t.coverage, t.topicId).toBe(new Set(rs.map((r) => r.attempt)).size);
    }
    for (const t of a.currentTopics) {
      const rs = REL.filter((r) => r.topicId === t.topicId && current(r));
      expect([t.questionCount, t.marks], t.topicId).toEqual([rs.length, marks(rs)]);
    }
  });

  it("chapter figures, historical and current", async () => {
    const a = (await mockProvider.getAnalytics("clp"))!;
    for (const c of a.chapters) {
      const rs = REL.filter((r) => r.chapterId === c.chapterId && eligible(r));
      expect([c.questionCount, c.marks], c.chapterId).toEqual([rs.length, marks(rs)]);
      expect(c.currentMarks, c.chapterId).toBe(marks(rs.filter(current)));
    }
  });

  it("makes no repeat or recurrence claim, because concept keys were not reviewed", async () => {
    const a = (await mockProvider.getAnalytics("clp"))!;
    expect(a.coverage?.conceptAnalysis).toBe(false);
    expect(a.recurringConcepts).toEqual([]);
    expect(a.repeatBreakdown.every((r) => r.status === "UNRESOLVED")).toBe(true);
    expect(a.priority.every((p) => p.points.repetition === 0)).toBe(true);
    expect(a.topics.every((t) => t.repeatedConceptClusters === 0)).toBe(true);
  });

  it("priorities rank only current-syllabus topics; removed topics are marked not examinable", async () => {
    const a = (await mockProvider.getAnalytics("clp"))!;
    for (const p of a.priority) {
      const cur = TOPICS.get(p.topicId)!.currentPriorityEligible;
      if (!cur) expect(p.label, p.topicId).toBe("NOT_EXAMINABLE");
      else expect(["HIGH", "MEDIUM", "LOW", "INSUFFICIENT_HISTORY"], p.topicId).toContain(p.label);
      expect(p.explanation, p.topicId).not.toMatch(/demonstration|synthetic/i);
    }
  });
});
