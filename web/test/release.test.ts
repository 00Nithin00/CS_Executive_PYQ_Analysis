// Release invariants: one Pro price everywhere, nothing purchasable, the real paper inventory reconciles to its
// official sources, published analytics are computed from records (not constants), and candidate data stays out.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import inventoryJson from "@/content/papers/clp-paper-inventory.json";
import resourcesJson from "@/content/official-resources.json";
import { ATTEMPTS } from "@/content/attempts";
import { computeSummary, indexTaxonomy } from "@/lib/analytics/compute";
import { checkoutBlock, PRO_PRICE as BILLING_PRICE, readBillingConfig } from "@/lib/billing/config";
import { PLAN_PRESENTATION } from "@/lib/config/pricing";
import { PRO_PRICE, PRO_PRICE_LABEL } from "@/lib/config/pro-price";
import { mockProvider } from "@/lib/data/mock-provider";
import { getPaperInventory } from "@/lib/data/paper-inventory";
import type { PaperInventory } from "@/types/papers";

const WEB = fileURLToPath(new URL("..", import.meta.url));
const ROOT = resolve(WEB, "..");
const INV = inventoryJson as PaperInventory;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(tsx?|json|mjs)$/.test(f) ? [p] : [];
  });
}
const PUBLIC_SOURCES = ["app", "components", "lib", "content"].flatMap((d) => sourceFiles(join(WEB, d)));

describe("pricing", () => {
  it("has one Pro price, ₹349 per user per month, used by billing and the pricing page", () => {
    expect(PRO_PRICE.amountPaise).toBe(34900);
    expect(PRO_PRICE.unit).toBe("user");
    expect(PRO_PRICE.interval).toBe("monthly");
    expect(BILLING_PRICE).toBe(PRO_PRICE);
    expect(PRO_PRICE_LABEL).toBe("₹349 per user per month");
    const pro = PLAN_PRESENTATION.find((p) => p.id === "PRO")!;
    expect(pro.price).toEqual({ amount: 349, currency: "INR", period: "month", per: "user" });
  });

  it("leaves no stale or conflicting price in the website source", () => {
    for (const f of PUBLIC_SOURCES) {
      const s = readFileSync(f, "utf8");
      expect(s, f).not.toMatch(/To be announced|₹\s?320\b|amountPaise:\s*32000|no price has been set|Pricing will be announced/);
    }
  });

  it("offers nothing for sale: no plan is purchasable and checkout is blocked without billing configuration", () => {
    expect(PLAN_PRESENTATION.every((p) => p.purchasable === false)).toBe(true);
    expect(checkoutBlock(readBillingConfig({}), "cs")).toBe("NOT_CONFIGURED");
    const pricingPage = readFileSync(join(WEB, "app/(site)/pricing/page.tsx"), "utf8");
    expect(pricingPage).toContain("not yet available to buy");
    expect(pricingPage).not.toMatch(/buy now|subscribe now|start your subscription/i);
  });
});

describe("paper inventory (real data)", () => {
  it("covers exactly the six Syllabus 2022 attempts in the analysis window", () => {
    expect(INV.papers.map((p) => p.attempt)).toEqual(ATTEMPTS.map((a) => a.id));
    expect(getPaperInventory("clp")).toBe(INV);
    expect(getPaperInventory("jigl")).toBeNull();
  });

  it("reconciles every paper to its printed structure and maximum marks", () => {
    for (const p of INV.papers) {
      expect(p.checks.source, p.paperId).toBe("VERIFIED");
      expect(p.checks.extraction.passed, p.paperId).toBe(p.checks.extraction.total);
      expect(p.totals.attemptableMarks, p.paperId).toBe(p.printed.maximumMarks);
      expect(p.questions.reduce((s, q) => s + q.parts, 0), p.paperId).toBe(p.totals.atomicParts);
      const compulsory = p.questions.filter((q) => !q.alternativeGroup).reduce((s, q) => s + q.marks, 0);
      const groups = new Map<string, number>();
      for (const q of p.questions.filter((q) => q.alternativeGroup)) groups.set(q.alternativeGroup!, Math.max(groups.get(q.alternativeGroup!) ?? 0, q.marks));
      expect(compulsory + [...groups.values()].reduce((s, m) => s + m, 0), p.paperId).toBe(p.printed.maximumMarks);
      // questions numbered from 1 to the printed total, plus the lettered alternatives
      expect(p.questions.filter((q) => !/A$/.test(q.number)).map((q) => q.number), p.paperId).toEqual(
        Array.from({ length: p.printed.totalQuestions }, (_, i) => String(i + 1)),
      );
    }
    expect(INV.papers.reduce((s, p) => s + p.totals.atomicParts, 0)).toBe(200);
    expect(INV.papers.reduce((s, p) => s + p.totals.alternativeParts, 0)).toBe(45);
  });

  it("links only to official ICSI documents already in the resource catalogue", () => {
    const urls = new Set(resourcesJson.resources.map((r) => r.officialUrl));
    for (const p of INV.papers) {
      expect(urls.has(p.officialPaperUrl), p.paperId).toBe(true);
      expect(p.guidelineAnswerUrl && urls.has(p.guidelineAnswerUrl), p.paperId).toBe(true);
    }
  });

  it("publishes no question text and no classification", () => {
    const s = JSON.stringify(INV);
    expect(s).not.toMatch(/question_?text|"topic|"chapter|canonical|concept_?key|subtopic|priority|confidence/i);
    expect(INV.meta.classificationHumanReviewed).toBe(200);
    expect(INV.meta.status.classification).toContain("by one human reviewer; not independently verified");
  });

  it("is current with the research files (when they are present locally)", () => {
    if (!existsSync(join(ROOT, "02_Raw_Extraction/CLP_atomic_questions_raw.json"))) return;
    expect(() => execFileSync(process.execPath, [join(WEB, "scripts/export-paper-inventory.mjs"), "--check"], { stdio: "pipe" })).not.toThrow();
    const cls = JSON.parse(readFileSync(join(ROOT, "03_Classified_Questions/CLP_classified_questions_v0.1.json"), "utf8")).records;
    expect(cls.length).toBe(INV.meta.classificationRecords);
    // human review lives in the approved release, never in the original v0.1 file (which stays unmodified)
    const release = JSON.parse(readFileSync(join(ROOT, "05_Approved_Dataset/CLP_approved_release.json"), "utf8"));
    expect(release.meta.reviewedRecords).toBe(INV.meta.classificationHumanReviewed);
  });
});

describe("analytics provenance", () => {
  it("computes the published figures from the records, not from constants", async () => {
    const set = (await mockProvider.getQuestionSet("clp"))!;
    const tax = (await mockProvider.getTaxonomy("clp"))!;
    const summary = (await mockProvider.getSummary("clp"))!;
    const fresh = computeSummary({ ...summary }, set.records, indexTaxonomy(tax));
    expect(summary.questionCount).toBe(fresh.questionCount);
    // dropping one record changes the figures, so they are derived, not hard-coded
    const drop = set.records.findIndex((r) => r.topicId !== "CLP.UNMAPPED");
    expect(computeSummary({ ...summary }, set.records.filter((_, i) => i !== drop), indexTaxonomy(tax)).questionCount).toBe(fresh.questionCount - 1);
  });

  it("switches the analytics provider off demonstration data only because every attempt is fully reviewed", async () => {
    const set = (await mockProvider.getQuestionSet("clp"))!;
    expect(set.provenance).toBe("VERIFIED");
    expect(set.records.some((r) => r.isDemo || r.verificationStatus === "DEMO")).toBe(false);
    expect(INV.meta.classificationHumanReviewed).toBe(200);
  });

  it("never wires the research candidate into the public provider or the paper inventory", () => {
    for (const f of ["lib/data/mock-provider.ts", "lib/data/provider.ts", "lib/data/service.ts", "lib/data/paper-inventory.ts"]) {
      const s = readFileSync(join(WEB, f), "utf8");
      expect(s, f).not.toMatch(/from\s+["']@\/(lib\/preview|lib\/config\/candidate-preview|components\/preview)|ai_desk_review|REVIEW_STATUS_OVERLAY|03_Classified_Questions/);
    }
  });
});
