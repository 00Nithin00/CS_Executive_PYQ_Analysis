// Launch invariants: CS Executive Pro is the only product and is checked against the configured plan before any
// subscription is created; real analytics come only from fully human-reviewed attempts. Release objects below are
// TEST FIXTURES built in memory; the real release file is asserted separately (it currently holds no decisions).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const razor = vi.hoisted(() => ({ plan: null as unknown, created: [] as unknown[] }));
vi.mock("@/lib/billing/razorpay", async (orig) => ({
  ...(await orig<typeof import("@/lib/billing/razorpay")>()),
  razorpayApi: () => ({
    fetchPlan: async () => razor.plan,
    createSubscription: async (input: unknown) => (razor.created.push(input), { id: "sub_TEST123", status: "created" }),
    fetchSubscription: async () => ({}),
    cancelSubscription: async () => ({}),
  }),
}));
vi.mock("@/lib/auth/viewer", () => ({
  getViewer: async () => ({ degraded: false, user: { id: "00000000-0000-0000-0000-000000000001", name: "Fixture", email: "fixture@example.test" }, plan: "FREE" }),
}));
vi.mock("@/lib/store", () => ({
  store: { hitRateLimit: async () => ({ allowed: true }), upsertProviderSubscription: async () => ({}) },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => undefined }));

import releaseJson from "@/content/releases/clp-approved-release.json";
import { ATTEMPTS } from "@/content/attempts";
import { computeAnalytics, indexTaxonomy } from "@/lib/analytics/compute";
import { startCheckoutAction } from "@/lib/billing/actions";
import { checkoutBlock, readBillingConfig } from "@/lib/billing/config";
import { PLAN_PRESENTATION } from "@/lib/config/pricing";
import { planMatchesProPrice, PRO_PRICE, PRO_PRODUCT } from "@/lib/config/pro-price";
import { FEATURES } from "@/lib/entitlements/capabilities";
import { mockProvider } from "@/lib/data/mock-provider";
import { MIN_RELEASED_ATTEMPTS, selectQuestionSet, type ApprovedRelease } from "@/lib/data/release";
import type { QuestionRecord } from "@/types/domain";

const GOOD_PLAN = { id: "plan_CS349", period: "monthly", interval: 1, item: { amount: 34900, currency: "INR" } };
const ENV = { RAZORPAY_KEY_ID: "rzp_test_fixture", RAZORPAY_KEY_SECRET: "fixture-secret", RAZORPAY_WEBHOOK_SECRET: "fixture-webhook", RAZORPAY_PLAN_ID_CS: "plan_CS349", RAZORPAY_PLAN_ID_CA: "plan_CA349", BILLING_CHECKOUT_QUALIFICATIONS: "cs,ca,cma" };

describe("CS Executive Pro: the only product, at the published price", () => {
  it("names the product and keeps it to the CS qualification", () => {
    expect(PRO_PRODUCT).toEqual({ name: "CS Executive Pro", qualification: "cs" });
    expect(PLAN_PRESENTATION.find((p) => p.id === "PRO")!.name).toBe("CS Executive Pro");
  });

  it("never opens checkout for CA or CMA, even when the environment lists them", () => {
    const cfg = readBillingConfig(ENV);
    expect(checkoutBlock(cfg, "cs")).toBeNull();
    expect(checkoutBlock(cfg, "ca")).toBe("NOT_SOLD");
    expect(checkoutBlock(cfg, "cma")).toBe("NOT_SOLD");
  });

  it("accepts only a Razorpay plan that bills exactly ₹349 INR every month", () => {
    expect(planMatchesProPrice(GOOD_PLAN)).toBe(true);
    for (const bad of [
      { ...GOOD_PLAN, item: { amount: 32000, currency: "INR" } },
      { ...GOOD_PLAN, item: { amount: 34900, currency: "USD" } },
      { ...GOOD_PLAN, period: "yearly" },
      { ...GOOD_PLAN, interval: 3 },
      null,
      {},
    ])
      expect(planMatchesProPrice(bad as never)).toBe(false);
  });

  it("lists no unimplemented feature on the Pro card", () => {
    const pro = PLAN_PRESENTATION.find((p) => p.id === "PRO")!;
    for (const c of pro.highlights) expect(FEATURES[c].availability, c).not.toBe("COMING_SOON");
    expect(FEATURES.MOCK_TESTS.availability).toBe("COMING_SOON");
    expect(FEATURES.AI_ASSISTANT.availability).toBe("COMING_SOON");
  });
});

describe("startCheckoutAction", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    Object.assign(process.env, ENV);
    razor.created = [];
  });
  afterEach(() => {
    for (const k of Object.keys(ENV)) delete process.env[k];
    Object.assign(process.env, saved);
  });

  it("refuses to create a subscription when the configured plan does not match ₹349 per month", async () => {
    razor.plan = { ...GOOD_PLAN, item: { amount: 32000, currency: "INR" } };
    const err = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(await startCheckoutAction("cs")).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(razor.created).toEqual([]);
    err.mockRestore();
  });

  it("creates the CS subscription at the published price when the plan matches", async () => {
    razor.plan = GOOD_PLAN;
    const r = await startCheckoutAction("cs");
    expect(r).toMatchObject({ ok: true, amountPaise: PRO_PRICE.amountPaise, description: "CS Executive Pro · ₹349 per user per month" });
    expect(razor.created).toHaveLength(1);
  });

  it("refuses CA and CMA checkout before any provider call", async () => {
    razor.plan = GOOD_PLAN;
    expect(await startCheckoutAction("ca")).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(await startCheckoutAction("cma")).toEqual({ ok: false, error: "UNAVAILABLE" });
    expect(razor.created).toEqual([]);
  });
});

// ---- release switch (fixtures)
const demo = { provenance: "DEMO" as const, generatedFrom: "demo", records: [] as QuestionRecord[] };
function fixtureRelease(complete: string[]): ApprovedRelease {
  const rec = (id: string, attempt: string, topicId: string, marks: number): QuestionRecord => ({
    id, isDemo: false, subject: "clp", paperCode: "522", attempt: attempt as QuestionRecord["attempt"], syllabusVersion: "2022-mod-dec2025", questionNumber: 1,
    subQuestion: null, paperPart: "I", marks, questionText: "", questionType: "practical_application", chapterId: topicId.slice(0, 7), topicId, subtopicId: null,
    conceptKey: `unreviewed:${id}`, canonicalTaxonomyLocation: topicId, historicalLessonAtExamTime: topicId.slice(0, 7), historicalNodeAtExamTime: null,
    syllabusStatus: "CURRENT", verificationStatus: "APPROVED", classificationConfidence: null, choiceGroupId: null, isAlternative: false,
    repeatStatus: "UNRESOLVED", relatedQuestionIds: [], sourceUrl: null, sourcePage: null,
  });
  return {
    meta: {
      release: "R1-fixture", taxonomyVersion: "0.3", methodologyVersion: "0.4", totalRecords: 200, reviewedRecords: 70, excludedRecords: 0,
      attemptCoverage: [], releasedAttempts: complete, conceptAnalysis: false,
    },
    records: [rec("F1", "2025-12", "CLP.L14.T03", 5), rec("F2", "2026-06", "CLP.L14.T03", 4), rec("F3", "2025-06", "CLP.L06.T06", 3)],
  };
}

describe("approved-release switch", () => {
  it("keeps demo data while fewer than the minimum attempts are fully reviewed", () => {
    expect(MIN_RELEASED_ATTEMPTS).toBe(2);
    expect(selectQuestionSet(null, demo, ATTEMPTS, "x").set).toBe(demo);
    expect(selectQuestionSet(fixtureRelease(["2026-06"]), demo, ATTEMPTS, "x")).toEqual({ set: demo, coverage: null });
  });

  it("switches to approved records of fully reviewed attempts only, and limits the window to them", async () => {
    const { set, coverage } = selectQuestionSet(fixtureRelease(["2026-06", "2025-12"]), demo, ATTEMPTS, "release.json");
    expect(set.provenance).toBe("VERIFIED");
    expect(set.records.map((r) => r.id).sort()).toEqual(["F1", "F2"]); // F3 belongs to an attempt not fully reviewed
    expect(coverage!.releasedAttempts).toEqual(["2025-12", "2026-06"]);
    const tax = (await mockProvider.getTaxonomy("clp"))!;
    const env = { provenance: set.provenance, acceptedVerificationStatuses: ["APPROVED"], subject: "clp" as const, attemptsInWindow: coverage!.releasedAttempts, taxonomyVersion: "0.3", generatedFrom: "release.json", coverage };
    const a = computeAnalytics(env, set.records, indexTaxonomy(tax), ATTEMPTS);
    expect(a.topics.find((t) => t.topicId === "CLP.L14.T03")).toMatchObject({ marks: 9, coverage: 2 });
    expect(a.recurringConcepts).toEqual([]); // unreviewed concept keys make no repeat claim
  });

  it("serves the reviewed release: all six attempts complete, so the demo set is replaced", async () => {
    expect(releaseJson.meta.reviewedRecords).toBe(200);
    expect(releaseJson.meta.releasedAttempts).toHaveLength(6);
    const set = (await mockProvider.getQuestionSet("clp"))!;
    expect(set.provenance).toBe("VERIFIED");
    expect(set.records.every((r) => !r.isDemo && r.verificationStatus === "APPROVED")).toBe(true);
    const coverage = (await mockProvider.getSummary("clp"))!.coverage!;
    expect(coverage.releasedAttempts).toEqual(ATTEMPTS.map((a) => a.id));
    expect(coverage.independentVerification).toBe(false);
    expect((await mockProvider.getSubject("clp"))!.intelligenceStatus).toBe("AVAILABLE");
  });
});
