import "server-only";
import { ATTEMPTS } from "@/content/attempts";
import resourcesJson from "@/content/official-resources.json";
import { SUBJECTS } from "@/content/subjects";
import clpTaxonomyJson from "@/content/taxonomy/clp.json";
import clpQuestionsJson from "@/mock/questions/clp.json";
import { computeAnalytics, computeSummary, indexTaxonomy } from "@/lib/analytics/compute";
import type { AnalyticsEnvelope } from "@/types/analytics";
import type { OfficialResource, QuestionRecord, Subject, SubjectSlug, Taxonomy } from "@/types/domain";
import type { DataProvider, QuestionSet } from "./provider";

const clpTaxonomy: Taxonomy = {
  subject: "clp",
  taxonomyVersion: clpTaxonomyJson.meta.taxonomyVersion,
  chapters: clpTaxonomyJson.chapters as Taxonomy["chapters"],
};

const TAXONOMIES: Partial<Record<SubjectSlug, Taxonomy>> = { clp: clpTaxonomy };

const QUESTION_SETS: Partial<Record<SubjectSlug, QuestionSet>> = {
  clp: {
    provenance: clpQuestionsJson.meta.provenance as QuestionSet["provenance"],
    generatedFrom: "mock/questions/clp.json",
    records: clpQuestionsJson.questions as QuestionRecord[],
  },
};

/** CLP lessons come from the frozen taxonomy so the subject page and the taxonomy never disagree. */
function withLessons(s: Subject): Subject {
  const tax = TAXONOMIES[s.slug];
  if (!tax || s.lessons.length) return s;
  return { ...s, lessons: tax.chapters.map((c) => ({ number: c.number, name: c.name, status: c.status })) };
}

function envelope(slug: SubjectSlug, set: QuestionSet, tax: Taxonomy): AnalyticsEnvelope {
  return {
    provenance: set.provenance,
    // Demo data counts only DEMO records; a real provider must pass ["APPROVED"] (methodology §10.1).
    acceptedVerificationStatuses: set.provenance === "DEMO" ? ["DEMO"] : ["APPROVED"],
    subject: slug,
    attemptsInWindow: ATTEMPTS.map((a) => a.id),
    taxonomyVersion: tax.taxonomyVersion,
    generatedFrom: set.generatedFrom,
  };
}

const resources = resourcesJson.resources as OfficialResource[];

// Data is static for the life of the process, so compute each subject's analytics once.
const summaryCache = new Map<SubjectSlug, ReturnType<typeof computeSummary>>();
const analyticsCache = new Map<SubjectSlug, ReturnType<typeof computeAnalytics>>();

export const mockProvider: DataProvider = {
  name: "mock",
  async listSubjects() {
    return SUBJECTS.map(withLessons);
  },
  async getSubject(slug) {
    const s = SUBJECTS.find((x) => x.slug === slug);
    return s ? withLessons(s) : null;
  },
  async getTaxonomy(slug) {
    return TAXONOMIES[slug] ?? null;
  },
  async listAttempts() {
    return ATTEMPTS;
  },
  async getQuestionSet(slug) {
    return QUESTION_SETS[slug] ?? null;
  },
  async getSummary(slug) {
    const set = QUESTION_SETS[slug];
    const tax = TAXONOMIES[slug];
    if (!set || !tax) return null;
    if (!summaryCache.has(slug)) summaryCache.set(slug, computeSummary(envelope(slug, set, tax), set.records, indexTaxonomy(tax)));
    return summaryCache.get(slug)!;
  },
  async getAnalytics(slug) {
    const set = QUESTION_SETS[slug];
    const tax = TAXONOMIES[slug];
    if (!set || !tax) return null;
    if (!analyticsCache.has(slug)) analyticsCache.set(slug, computeAnalytics(envelope(slug, set, tax), set.records, indexTaxonomy(tax), ATTEMPTS));
    return analyticsCache.get(slug)!;
  },
  async listResources(filter = {}) {
    return resources.filter(
      (r) =>
        (!filter.type || r.resourceType === filter.type) &&
        (!filter.subject || r.subject === filter.subject || r.subjectsCovered?.includes(filter.subject)) &&
        (!filter.attempt || r.attempt === filter.attempt),
    );
  },
  async resourcesVerifiedOn() {
    return resourcesJson.meta.lastVerified;
  },
};
