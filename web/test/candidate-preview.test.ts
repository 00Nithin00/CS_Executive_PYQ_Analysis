// Integration tests for the local AI-desk-review candidate preview: the real candidate, overlay, taxonomy v0.3 and
// raw extraction files, the production analytics pipeline, and the rendered preview. Expected values are derived
// independently from the research JSON files, never copied from the analytics output.
import { createHash } from "node:crypto";
import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CandidatePreviewLayout from "@/app/(site)/preview/candidate/layout";
import CandidatePreviewPage, { generateMetadata } from "@/app/(site)/preview/candidate/page";
import { CandidatePreviewView } from "@/components/preview/candidate-preview-view";
import { ATTEMPTS } from "@/content/attempts";
import { computeAnalytics, indexTaxonomy } from "@/lib/analytics/compute";
import { CANDIDATE_LABEL, candidatePreviewEnabled, candidatePreviewPaths } from "@/lib/config/candidate-preview";
import { mockProvider } from "@/lib/data/mock-provider";
import { loadCandidatePreview, type CandidatePreviewData } from "@/lib/preview/candidate";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));
const PATHS = candidatePreviewPaths({ CANDIDATE_PREVIEW_ROOT: ROOT } as unknown as NodeJS.ProcessEnv);
const read = (p: string) => JSON.parse(readFileSync(p, "utf8"));
const CAND = read(PATHS.dataset);
const OVERLAY = read(PATHS.overlay);
const NODES = new Map<string, Record<string, unknown>>(read(PATHS.taxonomy).nodes.map((n: { taxonomy_id: string }) => [n.taxonomy_id, n]));
const V01 = read(resolve(ROOT, "03_Classified_Questions/CLP_classified_questions_v0.1.json"));
type Rec = { question_id: string; topic: string | null; chapter: string | null; canonical_taxonomy_location: string; attempt: string; marks: number; is_alternative: boolean; concept_key: string; classification_confidence: string };
const RECS: Rec[] = CAND.records;
const HOLDS = new Set<string>(OVERLAY.current_priority_holds);

// Independent policy, straight from the files: a record is historical evidence if its own topic is analytics-eligible,
// and current evidence if its own topic is current-priority eligible and the overlay does not hold it.
const hist = (r: Rec) => r.topic !== null && NODES.get(r.topic)?.historical_analytics_eligible === true;
const current = (r: Rec) => r.topic !== null && NODES.get(r.topic)?.current_priority_eligible === true && !HOLDS.has(r.question_id);
const marks = (rs: Rec[]) => rs.reduce((s, r) => s + (r.is_alternative ? 0 : r.marks), 0);
const label2id = new Map(ATTEMPTS.map((a) => [a.label, a.id]));

function load(): CandidatePreviewData {
  const res = loadCandidatePreview(PATHS);
  if (!res.ok) throw new Error(res.errors.join("\n"));
  return res.data;
}
const D = load();
const A = D.analytics;
const html = (result: ReturnType<typeof loadCandidatePreview>) => renderToStaticMarkup(createElement(CandidatePreviewView, { result, attempts: ATTEMPTS }));

describe("candidate loading and schema validation", () => {
  it("loads the real candidate with its matching overlay", () => {
    expect(D.source.datasetSha256).toBe(createHash("sha256").update(readFileSync(PATHS.dataset)).digest("hex"));
    expect(D.source.datasetSha256).toBe(OVERLAY.candidate_sha256);
    expect(D.source.classificationVersion).toBe(CAND.meta.classification_version);
    expect(D.source.taxonomyVersion).toBe("0.3");
    expect(D.label).toBe(CANDIDATE_LABEL);
    expect(D.analytics.provenance).toBe("CANDIDATE");
    expect(D.records.every((r) => r.questionText === "")).toBe(true); // no question text enters the preview
  });

  it("retains all 200 records, in file order", () => {
    expect(RECS.length).toBe(200);
    expect(D.recordCount).toBe(200);
    expect(D.records.map((r) => r.id)).toEqual(RECS.map((r) => r.question_id));
  });

  it("accounts for the 26 Priority-A records and the 10 changed records", () => {
    expect(OVERLAY.records.length).toBe(26);
    expect(Object.values(D.reviewCounts).reduce((s, n) => s + n, 0)).toBe(26);
    expect(D.changedRecordIds).toEqual(CAND.meta.changed_record_ids);
    expect(D.changedRecordIds.length).toBe(10);
  });

  it("judges eligibility on each record's topic, which agrees with its canonical node for every record", () => {
    for (const r of RECS.filter((x) => x.topic)) {
      const t = NODES.get(r.topic!)!;
      const c = NODES.get(r.canonical_taxonomy_location)!;
      expect(t.current_priority_eligible, r.question_id).toBe(c.current_priority_eligible);
      expect(t.historical_analytics_eligible, r.question_id).toBe(c.historical_analytics_eligible);
    }
  });
});

describe("review holds", () => {
  it("holds exactly the nine unresolved records: 6 pending evidence, 2 pending review, 1 confidence conflict", () => {
    expect(D.held.map((h) => h.id).sort()).toEqual([...HOLDS].sort());
    expect(D.held.length).toBe(9);
    const n = (s: string) => D.held.filter((h) => h.status === s).length;
    expect([n("NOT_APPLIED_PENDING_EVIDENCE"), n("NOT_APPLIED_PENDING_REVIEW"), n("NOT_APPLIED_CONFLICT")]).toEqual([6, 2, 1]);
    expect(D.records.filter((r) => r.currentPriorityHold).map((r) => r.id).sort()).toEqual([...HOLDS].sort());
  });

  it("keeps the confidence-conflict record 2026J-Q1-d on hold with its original v0.1 classification", () => {
    const id = "EP-2022-522-2026J-Q1-d";
    const h = D.held.find((x) => x.id === id)!;
    expect(h.status).toBe("NOT_APPLIED_CONFLICT");
    const orig = V01.records.find((r: Rec) => r.question_id === id);
    expect(RECS.find((r) => r.question_id === id)).toEqual(orig);
    const rec = D.records.find((r) => r.id === id)!;
    expect(rec.currentPriorityHold).toBe(true);
    expect(rec.canonicalTaxonomyLocation).toBe(orig.canonical_taxonomy_location);
    expect(rec.classificationConfidence).toBe(orig.classification_confidence);
    for (const t of [...A.topics, ...A.currentTopics]) expect(t.topicId).not.toBe(rec.topicId);
  });

  it("excludes every held record from current-priority calculations", () => {
    const heldTopics = new Set(D.records.filter((r) => r.currentPriorityHold).map((r) => r.topicId));
    for (const t of A.currentTopics) {
      const expected = RECS.filter((r) => r.topic === t.topicId && current(r));
      expect(t.questionCount, t.topicId).toBe(expected.length);
      expect(t.marks, t.topicId).toBe(marks(expected));
    }
    // the two held records on current topics: present historically, absent from current figures
    const onCurrent = D.held.filter((h) => h.onCurrentNode);
    expect(onCurrent.map((h) => h.shortId).sort()).toEqual(["2025J-Q3-c", "2025J-Q6-d"]);
    for (const h of onCurrent) {
      const topic = RECS.find((r) => r.question_id === h.id)!.topic!;
      const histT = A.topics.find((t) => t.topicId === topic)!;
      const curT = A.currentTopics.find((t) => t.topicId === topic);
      expect(histT.marks - (curT?.marks ?? 0), topic).toBe(marks(RECS.filter((r) => r.topic === topic && HOLDS.has(r.question_id))));
      expect(heldTopics.has(topic)).toBe(true);
    }
    expect(D.current.questionCount).toBe(RECS.filter(current).length);
    expect(D.current.marks).toBe(marks(RECS.filter(current)));
  });

  it("does not let a held record move a priority label or threshold", () => {
    const unheld = D.records.map((r) => ({ ...r, currentPriorityHold: false }));
    const dropped = D.records.filter((r) => !r.currentPriorityHold);
    const idx = indexTaxonomy(D.taxonomy);
    const env = { ...A, attemptsInWindow: A.attemptsInWindow };
    const withoutHeld = computeAnalytics(env, dropped, idx, ATTEMPTS);
    expect(A.priority).toEqual(withoutHeld.priority);
    expect(A.currentTopics).toEqual(withoutHeld.currentTopics);
    expect(computeAnalytics(env, unheld, idx, ATTEMPTS).priority).not.toEqual(A.priority);
  });

  it("leaves historical metrics unchanged when holds are applied", () => {
    const idx = indexTaxonomy(D.taxonomy);
    const noHolds = computeAnalytics(A, D.records.map((r) => ({ ...r, currentPriorityHold: false })), idx, ATTEMPTS);
    expect(A.topics).toEqual(noHolds.topics);
    expect(A.attempts).toEqual(noHolds.attempts);
    expect(A.questionTypes).toEqual(noHolds.questionTypes);
    const historicalChapterMetrics = (chapters: typeof A.chapters) =>
      chapters.map((chapter) =>
        Object.fromEntries(
          Object.entries(chapter).filter(
            ([key]) =>
              ![
                "currentMarks",
                "currentQuestionCount",
                "currentMarksByAttempt",
              ].includes(key),
          ),
        ),
      );
    expect(historicalChapterMetrics(A.chapters)).toEqual(
      historicalChapterMetrics(noHolds.chapters),
    );
    const hist198 = RECS.filter(hist);
    expect(D.summary.questionCount).toBe(hist198.length);
    expect(D.summary.marksAnalyzed).toBe(marks(hist198));
    expect(D.summary.excluded.unmapped).toBe(RECS.filter((r) => !hist(r)).length);
  });
});

describe("per-record eligibility", () => {
  it("builds chapter current figures from each record's own topic, independent of record order", () => {
    for (const c of A.chapters) {
      const inCh = RECS.filter((r) => r.chapter === c.chapterId);
      expect(c.marks, c.chapterId).toBe(marks(inCh.filter(hist)));
      expect(c.currentMarks, c.chapterId).toBe(marks(inCh.filter(current)));
      expect(c.currentQuestionCount, c.chapterId).toBe(inCh.filter(current).length);
    }
    const l10 = A.chapters.find((c) => c.chapterId === "CLP.L10")!; // PARTIALLY_DELETED: deleted and current topics mixed
    expect(l10.status).toBe("PARTIALLY_DELETED");
    expect(l10.currentMarks).toBeLessThan(l10.marks);
    const reversed = computeAnalytics(A, [...D.records].reverse(), indexTaxonomy(D.taxonomy), ATTEMPTS);
    const byId = (cs: typeof A.chapters) => Object.fromEntries(cs.map((c) => [c.chapterId, [c.marks, c.currentMarks, c.currentQuestionCount]]));
    expect(byId(reversed.chapters)).toEqual(byId(A.chapters));
  });

  it("derives recurring-concept eligibility from each record", () => {
    for (const c of A.recurringConcepts) {
      const rs = RECS.filter((r) => r.concept_key === c.conceptKey && hist(r));
      const curAttempts = [...new Set(rs.filter(current).map((r) => label2id.get(r.attempt)))];
      expect([...c.currentAttempts].sort(), c.conceptKey).toEqual(curAttempts.sort());
      expect(c.currentPriorityEligible, c.conceptKey).toBe(curAttempts.length >= 2);
    }
  });
});

describe("no double counting", () => {
  it("credits each record's marks and question once, to its primary topic only", () => {
    const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
    expect(sum(A.topics.map((t) => t.marks))).toBe(D.summary.marksAnalyzed);
    expect(sum(A.chapters.map((c) => c.marks))).toBe(D.summary.marksAnalyzed);
    expect(sum(A.attempts.map((a) => a.marks))).toBe(D.summary.marksAnalyzed);
    expect(sum(A.topics.map((t) => t.questionCount))).toBe(D.summary.questionCount);
    expect(sum(A.chapters.map((c) => c.questionCount))).toBe(D.summary.questionCount);
    expect(sum(A.currentTopics.map((t) => t.marks))).toBe(sum(A.chapters.map((c) => c.currentMarks)));
    expect(sum(A.currentTopics.map((t) => t.questionCount))).toBe(sum(A.chapters.map((c) => c.currentQuestionCount)));
    expect(sum(A.questionTypes.map((q) => q.count))).toBe(D.summary.questionCount);
  });
});

describe("failure is visible, never demo data", () => {
  const tmp = mkdtempSync(join(tmpdir(), "candidate-preview-"));

  it("reports a missing candidate file and renders an explicit error", () => {
    const res = loadCandidatePreview({ ...PATHS, dataset: join(tmp, "missing.json") });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errors.join(" ")).toContain("missing.json");
    const out = html(res);
    expect(out).toContain("could not be loaded");
    expect(out).toContain("no demonstration data was substituted");
    expect(out).toContain(CANDIDATE_LABEL);
    expect(out).not.toContain("Demonstration data");
    expect(out).not.toContain("Historical figures");
  });

  it("rejects invalid JSON", () => {
    const p = join(tmp, "bad.json");
    writeFileSync(p, "{ not json");
    const res = loadCandidatePreview({ ...PATHS, dataset: p });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.errors[0]).toContain("not valid JSON");
  });

  it("rejects a candidate that does not match the overlay, or claims approval", () => {
    const tampered = structuredClone(CAND);
    tampered.records[0].verification_status = "APPROVED";
    const p = join(tmp, "tampered.json");
    writeFileSync(p, JSON.stringify(tampered));
    const res = loadCandidatePreview({ ...PATHS, dataset: p });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.errors.some((e) => e.includes("candidate_sha256 mismatch"))).toBe(true);
    expect(res.errors.some((e) => e.includes("APPROVED"))).toBe(true);
  });

  it("rejects an overlay whose holds list disagrees with its records", () => {
    const ov = structuredClone(OVERLAY);
    ov.current_priority_holds = ov.current_priority_holds.slice(1);
    const p = join(tmp, "overlay.json");
    writeFileSync(p, JSON.stringify(ov));
    copyFileSync(PATHS.dataset, join(tmp, "cand.json"));
    const res = loadCandidatePreview({ ...PATHS, overlay: p });
    expect(res.ok).toBe(false);
  });
});

describe("production/demo route keeps its data source", () => {
  it("serves demonstration data from mock/questions/clp.json, never the candidate", async () => {
    const set = (await mockProvider.getQuestionSet("clp"))!;
    expect(set.provenance).toBe("DEMO");
    expect(set.generatedFrom).toBe("mock/questions/clp.json");
    expect(set.records.some((r) => r.currentPriorityHold)).toBe(false);
    const a = (await mockProvider.getAnalytics("clp"))!;
    expect(a.provenance).toBe("DEMO");
    expect(a.generatedFrom).toBe("mock/questions/clp.json");
    expect(a.currentTopics).toEqual(a.topics.filter((t) => t.currentPriorityEligible)); // no holds: identical to the old filter
    const src = ["lib/data/mock-provider.ts", "lib/data/service.ts", "lib/data/provider.ts"].map((f) => readFileSync(resolve(ROOT, "web", f), "utf8")).join("\n");
    expect(src).not.toMatch(/from\s+["']@\/(lib\/preview|lib\/config\/candidate-preview|components\/preview)/);
    expect(src).not.toMatch(/ai_desk_review_candidate|REVIEW_STATUS_OVERLAY/);
  });

  it("the preview route is off unless CANDIDATE_PREVIEW=1", () => {
    expect(candidatePreviewEnabled({} as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(candidatePreviewEnabled({ CANDIDATE_PREVIEW: "true" } as unknown as NodeJS.ProcessEnv)).toBe(false);
    expect(candidatePreviewEnabled({ CANDIDATE_PREVIEW: "1" } as unknown as NodeJS.ProcessEnv)).toBe(true);
    const prev = process.env.CANDIDATE_PREVIEW;
    delete process.env.CANDIDATE_PREVIEW;
    try {
      expect(() => CandidatePreviewPage()).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
    } finally {
      if (prev !== undefined) process.env.CANDIDATE_PREVIEW = prev;
    }
  });
});

describe("candidate warning on every entry point", () => {
  it("the route layout renders the warning whenever the preview is on, and nothing when it is off", () => {
    const prev = process.env.CANDIDATE_PREVIEW;
    try {
      process.env.CANDIDATE_PREVIEW = "1";
      const out = renderToStaticMarkup(createElement(CandidatePreviewLayout, null, createElement("p", null, "child")));
      expect(out).toContain(CANDIDATE_LABEL);
      expect(out).toContain("data-candidate-banner");
      expect(generateMetadata().description).toBe(CANDIDATE_LABEL);
      delete process.env.CANDIDATE_PREVIEW;
      expect(() => CandidatePreviewLayout({ children: null })).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
      expect(JSON.stringify(generateMetadata())).not.toMatch(/candidate/i);
    } finally {
      if (prev === undefined) delete process.env.CANDIDATE_PREVIEW;
      else process.env.CANDIDATE_PREVIEW = prev;
    }
  });

  it("the preview body shows the warning, the per-chart badge, the held records and the actual figures", () => {
    const out = html({ ok: true, data: D });
    expect(out).toContain(CANDIDATE_LABEL);
    expect(out).toContain("Candidate · not verified");
    expect(out).not.toContain("Demo data");
    expect(out).toContain(`${D.held.length} records held from current-priority figures`);
    for (const id of HOLDS) expect(out).toContain(`data-held-record="${id}"`);
    const hist198 = RECS.filter(hist);
    expect(out).toContain(`>${hist198.length}<`);
    expect(out).toContain(`>${marks(hist198)}<`);
    expect(out).toContain(`>${RECS.filter(current).length}<`);
    expect(out).toContain(`>${marks(RECS.filter(current))}<`);
    // the only "professionally verified" wording allowed is the negative label
    expect(out.replace(/not professionally verified/gi, "")).not.toMatch(/professionally verified/i);
  });
});
