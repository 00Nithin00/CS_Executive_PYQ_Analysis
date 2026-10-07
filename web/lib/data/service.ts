// Viewer-aware service layer. The ONLY place UI code gets data from.
// Capability checks happen here, on the server, before data is shaped for the client:
// a Free viewer never receives Pro fields, regardless of what the browser does.
import "server-only";
import { attemptLabel } from "@/content/attempts";
import { assertCapability, can, type Viewer } from "@/lib/auth/viewer";
import { indexTaxonomy } from "@/lib/analytics/compute";
import { store } from "@/lib/store";
import type { BasicQuestion, ExplorerQuestion, ProQuestion, QuestionRecord, SubjectSlug } from "@/types/domain";
import { mockProvider } from "./mock-provider";
import type { DataProvider, ResourceFilter } from "./provider";
import { PUBLIC_PREVIEW } from "@/lib/config/public-preview";

function selectProvider(): DataProvider {
  const kind = process.env.DATA_PROVIDER ?? "mock";
  if (kind === "mock") return mockProvider;
  throw new Error(`DATA_PROVIDER="${kind}" is not implemented yet.`);
}

// Not exported: UI code must go through the functions below, never the raw provider.
const provider = selectProvider();

// ---- public (no capability needed)
export const listSubjects = () => provider.listSubjects();
export const getSubject = (slug: string) => provider.getSubject(slug);
export const getTaxonomy = (slug: SubjectSlug) => provider.getTaxonomy(slug);
export const listAttempts = () => provider.listAttempts();
export const getSubjectSummary = (slug: SubjectSlug) => provider.getSummary(slug);

export async function listResources(viewer: Viewer | null, filter?: ResourceFilter) {
  // Official links are free for everyone, including anonymous visitors.
  if (viewer) assertCapability(viewer, "OFFICIAL_RESOURCES");
  return provider.listResources(filter);
}
export const resourcesVerifiedOn = () => provider.resourcesVerifiedOn();

// ---- public homepage preview (policy: lib/config/public-preview.ts)
export async function getPublicChapterPreview() {
  const policy = PUBLIC_PREVIEW.chapterMarks;
  const analytics = await provider.getAnalytics(policy.subject);
  if (!analytics || !policy.allowedProvenance.includes(analytics.provenance)) return null;
  return {
    provenance: analytics.provenance,
    attemptsInWindow: analytics.attemptsInWindow,
    chapters: analytics.chapters
      .filter((c) => c.status !== "DELETED_FROM_DEC2025")
      .slice(0, policy.maxChapters)
      .map((c) => ({ chapterId: c.chapterId, chapterName: c.chapterName, marks: c.marks, attemptsAppeared: c.attemptsAppeared.length })),
  };
}

// ---- input validation helpers for server actions (never trust client-supplied ids)
export async function questionExists(id: string) {
  for (const s of await provider.listSubjects()) {
    const set = await provider.getQuestionSet(s.slug);
    if (set?.records.some((q) => q.id === id)) return true;
  }
  return false;
}
export async function isCurrentChapter(chapterId: string) {
  const subjects = await provider.listSubjects();
  for (const s of subjects) {
    const tax = await provider.getTaxonomy(s.slug);
    const ch = tax?.chapters.find((c) => c.id === chapterId);
    if (ch) return ch.status !== "DELETED_FROM_DEC2025" && ch.classificationUse === "STRUCTURAL";
  }
  return false;
}
export async function knownSubjectSlugs() {
  return new Set((await provider.listSubjects()).map((s) => s.slug as string));
}

// ---- Pro analytics
export async function getSubjectAnalytics(viewer: Viewer, slug: SubjectSlug) {
  assertCapability(viewer, "PYQ_ANALYTICS");
  return provider.getAnalytics(slug);
}

// ---- PYQ explorer
function label(q: QuestionRecord) {
  return `Q${q.questionNumber}${q.subQuestion ? `(${q.subQuestion})` : ""}`;
}

export interface ExplorerPayload {
  provenance: "DEMO" | "VERIFIED";
  questions: ExplorerQuestion[];
  /** true when Pro fields were included (viewer has REPEAT_ANALYSIS + ADVANCED_FILTERS) */
  advanced: boolean;
  bookmarkedIds: string[];
}

export async function getExplorerQuestions(viewer: Viewer, slug: SubjectSlug): Promise<ExplorerPayload | null> {
  assertCapability(viewer, "BASIC_PYQ");
  const [set, tax] = await Promise.all([provider.getQuestionSet(slug), provider.getTaxonomy(slug)]);
  if (!set || !tax) return null;
  const idx = indexTaxonomy(tax);
  const advanced = can(viewer, "REPEAT_ANALYSIS") && can(viewer, "ADVANCED_FILTERS");
  const byId = new Map(set.records.map((q) => [q.id, q]));

  // Only records analytics would accept are shown (APPROVED for real data; DEMO for demo data).
  const accepted = set.provenance === "DEMO" ? "DEMO" : "APPROVED";
  const questions = set.records
    .filter((q) => q.verificationStatus === accepted && idx.topic.has(q.topicId))
    .sort((a, b) => b.attempt.localeCompare(a.attempt) || a.questionNumber - b.questionNumber || (a.subQuestion ?? "").localeCompare(b.subQuestion ?? ""))
    .map((q): ExplorerQuestion => {
      const ch = idx.chapter.get(q.chapterId)!;
      const basic: BasicQuestion = {
        id: q.id,
        isDemo: q.isDemo,
        subject: q.subject,
        attempt: q.attempt,
        label: label(q),
        marks: q.marks,
        questionText: q.questionText,
        chapter: { id: ch.id, name: ch.name, number: ch.number },
        sourceUrl: q.sourceUrl,
      };
      if (!advanced) return basic;
      const pro: ProQuestion = {
        ...basic,
        topic: { id: q.topicId, name: idx.nameOf(q.topicId) },
        subtopic: q.subtopicId ? { id: q.subtopicId, name: idx.nameOf(q.subtopicId) } : null,
        questionType: q.questionType,
        repeatStatus: q.repeatStatus,
        previousAppearances: q.relatedQuestionIds
          .map((id) => byId.get(id))
          .filter((x): x is QuestionRecord => Boolean(x))
          .map((x) => ({ attempt: x.attempt, label: attemptLabel(x.attempt) })),
        syllabusStatus: q.syllabusStatus,
      };
      return pro;
    });

  const bookmarkedIds =
    viewer.user && can(viewer, "BOOKMARKS") ? (await store.listBookmarks(viewer.user.id)).map((b) => b.questionId) : [];
  return { provenance: set.provenance, questions, advanced, bookmarkedIds };
}

export async function getBookmarkedQuestions(viewer: Viewer) {
  assertCapability(viewer, "BOOKMARKS");
  if (!viewer.user) return [];
  const ids = new Set((await store.listBookmarks(viewer.user.id)).map((b) => b.questionId));
  if (!ids.size) return [];
  const out: ExplorerQuestion[] = [];
  for (const s of await provider.listSubjects()) {
    const set = await provider.getQuestionSet(s.slug);
    if (!set?.records.some((q) => ids.has(q.id))) continue; // skip subjects with no bookmarked questions
    const payload = await getExplorerQuestions(viewer, s.slug);
    if (payload) out.push(...payload.questions.filter((q) => ids.has(q.id)));
  }
  return out;
}
