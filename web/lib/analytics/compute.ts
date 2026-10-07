// Pure analytics over question records — PROJECT_METHODOLOGY.md §8 (metrics) and §9 (priority).
// No numbers are hard-coded anywhere in the UI: everything shown is derived here from records,
// so swapping demo records for the approved dataset changes the output, not the code.
import type { AnalyticsEnvelope, AttemptStat, ChapterStat, PriorityEntry, PriorityLabel, RecurringConcept, SubjectAnalytics, SubjectSummary, TopicStat } from "@/types/analytics";
import type { AttemptId, ExamAttempt, QuestionRecord, SyllabusStatus, Taxonomy, Topic } from "@/types/domain";

export interface TaxonomyIndex {
  chapter: Map<string, { id: string; name: string; number: number; part: "I" | "II"; status: SyllabusStatus }>;
  topic: Map<string, Topic & { chapterId: string }>;
  nameOf: (id: string) => string;
}

export function indexTaxonomy(tax: Taxonomy): TaxonomyIndex {
  const chapter = new Map<string, { id: string; name: string; number: number; part: "I" | "II"; status: SyllabusStatus }>();
  const topic = new Map<string, Topic & { chapterId: string }>();
  const names = new Map<string, string>();
  for (const c of tax.chapters) {
    chapter.set(c.id, { id: c.id, name: c.name, number: c.number, part: c.part, status: c.status });
    names.set(c.id, c.name);
    for (const t of c.topics) {
      topic.set(t.id, { ...t, chapterId: c.id });
      names.set(t.id, t.name);
      for (const s of t.subtopics) names.set(s.id, s.name);
    }
  }
  return { chapter, topic, nameOf: (id) => names.get(id) ?? id };
}

/**
 * Records that may enter analytics (methodology §6.1, §8, §10):
 *  - classified to an analytics-eligible taxonomy node (control/holding and alias nodes are excluded),
 *  - carrying a verification status the provider accepts (APPROVED for real data, DEMO for demo data),
 *  - from an attempt inside the analysis window.
 */
function eligible(env: AnalyticsEnvelope, records: QuestionRecord[], idx: TaxonomyIndex) {
  const window = new Set<string>(env.attemptsInWindow);
  return records.filter(
    (q) =>
      idx.topic.get(q.topicId)?.historicalAnalyticsEligible === true &&
      env.acceptedVerificationStatuses.includes(q.verificationStatus) &&
      window.has(q.attempt),
  );
}

/** Marks weight counts compulsory units only; alternatives in a choice group add no marks (methodology §8). */
const marksOf = (q: QuestionRecord) => (q.isAlternative ? 0 : (q.marks ?? 0));

function longestRun(flags: boolean[]) {
  let best = 0;
  let cur = 0;
  for (const f of flags) {
    cur = f ? cur + 1 : 0;
    best = Math.max(best, cur);
  }
  return best;
}

export function computeSummary(env: AnalyticsEnvelope, records: QuestionRecord[], idx: TaxonomyIndex): SubjectSummary {
  const rs = eligible(env, records, idx);
  const attempts = env.attemptsInWindow.filter((a) => rs.some((q) => q.attempt === a));
  return {
    ...env,
    attemptsAnalyzed: attempts.length,
    questionCount: rs.length,
    marksAnalyzed: rs.reduce((s, q) => s + marksOf(q), 0),
    chaptersCovered: new Set(rs.map((q) => q.chapterId)).size,
    lastAttempt: attempts.at(-1) ?? null,
    excluded: {
      unmapped: records.filter((q) => !idx.topic.get(q.topicId)?.historicalAnalyticsEligible).length,
      notAccepted: records.filter((q) => !env.acceptedVerificationStatuses.includes(q.verificationStatus)).length,
      nullMarks: rs.filter((q) => q.marks === null).length,
      alternativeMarks: rs.filter((q) => q.isAlternative).length,
    },
  };
}

export function computeAnalytics(
  env: AnalyticsEnvelope,
  records: QuestionRecord[],
  idx: TaxonomyIndex,
  attempts: ExamAttempt[],
): SubjectAnalytics {
  const rs = eligible(env, records, idx);
  const window = env.attemptsInWindow;
  const N = window.length;
  const pos = (a: AttemptId) => window.indexOf(a);

  // ---- topics
  const byTopic = new Map<string, QuestionRecord[]>();
  for (const q of rs) byTopic.set(q.topicId, [...(byTopic.get(q.topicId) ?? []), q]);

  const topics: TopicStat[] = [...byTopic.entries()].map(([topicId, qs]) => {
    const t = idx.topic.get(topicId)!;
    const ch = idx.chapter.get(t.chapterId)!;
    const appeared = window.filter((a) => qs.some((q) => q.attempt === a));
    const flags = window.map((a) => appeared.includes(a));
    const last = appeared.at(-1) ?? null;
    const marks = qs.reduce((s, q) => s + marksOf(q), 0);
    const conceptAttempts = new Map<string, Set<string>>();
    for (const q of qs) conceptAttempts.set(q.conceptKey, (conceptAttempts.get(q.conceptKey) ?? new Set()).add(q.attempt));
    return {
      topicId,
      topicName: t.name,
      chapterId: ch.id,
      chapterName: ch.name,
      chapterNumber: ch.number,
      questionCount: qs.length,
      marks,
      attemptsAppeared: appeared,
      marksByAttempt: Object.fromEntries(appeared.map((a) => [a, qs.filter((q) => q.attempt === a).reduce((s, q) => s + marksOf(q), 0)])),
      coverage: appeared.length,
      lastSeen: last,
      attemptsSinceLastSeen: last ? N - 1 - pos(last) : null,
      longestStreak: longestRun(flags),
      onCurrentStreak: flags.at(-1) === true,
      averageMarks: appeared.length ? Math.round((marks / appeared.length) * 10) / 10 : 0,
      repeatedConceptClusters: [...conceptAttempts.values()].filter((s) => s.size >= 2).length,
      currentPriorityEligible: t.currentPriorityEligible,
    };
  });
  topics.sort((a, b) => b.coverage - a.coverage || b.marks - a.marks);

  // ---- chapters
  const byChapter = new Map<string, QuestionRecord[]>();
  for (const q of rs) byChapter.set(q.chapterId, [...(byChapter.get(q.chapterId) ?? []), q]);
  const chapters: ChapterStat[] = [...byChapter.entries()]
    .map(([chapterId, qs]) => {
      const ch = idx.chapter.get(chapterId)!;
      const marksByAttempt: Record<string, number> = {};
      for (const a of window) marksByAttempt[a] = qs.filter((q) => q.attempt === a).reduce((s, q) => s + marksOf(q), 0);
      return {
        chapterId,
        chapterName: ch.name,
        chapterNumber: ch.number,
        part: ch.part,
        status: ch.status,
        questionCount: qs.length,
        marks: qs.reduce((s, q) => s + marksOf(q), 0),
        attemptsAppeared: window.filter((a) => marksByAttempt[a] > 0),
        marksByAttempt,
      };
    })
    .sort((a, b) => b.marks - a.marks);

  // ---- recurring concepts (same concept_key in >= 2 attempts)
  const byConcept = new Map<string, QuestionRecord[]>();
  for (const q of rs) byConcept.set(q.conceptKey, [...(byConcept.get(q.conceptKey) ?? []), q]);
  const recurringConcepts: RecurringConcept[] = [...byConcept.entries()]
    .map(([conceptKey, qs]) => ({
      conceptKey,
      conceptName: idx.nameOf(conceptKey),
      topicName: idx.nameOf(qs[0].topicId),
      attempts: window.filter((a) => qs.some((q) => q.attempt === a)),
      occurrences: qs.length,
      currentPriorityEligible: idx.topic.get(qs[0].topicId)?.currentPriorityEligible ?? false,
    }))
    .filter((c) => c.attempts.length >= 2)
    .sort((a, b) => b.attempts.length - a.attempts.length || b.occurrences - a.occurrences);

  // ---- attempts
  const attemptStats: AttemptStat[] = window.map((a) => {
    const qs = rs.filter((q) => q.attempt === a);
    const top = chapters
      .map((c) => ({ chapterName: c.chapterName, marks: c.marksByAttempt[a] ?? 0 }))
      .filter((c) => c.marks > 0)
      .sort((x, y) => y.marks - x.marks)
      .slice(0, 3);
    return {
      attempt: a,
      label: attempts.find((x) => x.id === a)?.label ?? a,
      questionCount: qs.length,
      marks: qs.reduce((s, q) => s + marksOf(q), 0),
      topChapters: top,
    };
  });

  // ---- distributions
  const typeMap = new Map<string, { count: number; marks: number }>();
  for (const q of rs) {
    const e = typeMap.get(q.questionType) ?? { count: 0, marks: 0 };
    typeMap.set(q.questionType, { count: e.count + 1, marks: e.marks + marksOf(q) });
  }
  const questionTypes = [...typeMap.entries()]
    .map(([type, v]) => ({ type: type as QuestionRecord["questionType"], ...v }))
    .sort((a, b) => b.marks - a.marks);

  const repeatOrder: QuestionRecord["repeatStatus"][] = ["EXACT_REPEAT", "CONCEPTUAL_REPEAT", "TOPIC_REPEAT", "CHAPTER_REPEAT", "FIRST_SEEN", "UNRESOLVED"];
  const repeatBreakdown = repeatOrder
    .map((status) => ({ status, count: rs.filter((q) => q.repeatStatus === status).length }))
    .filter((r) => r.count > 0);

  return {
    ...env,
    topics,
    chapters,
    priority: computePriority(topics, idx, attempts, window, env.provenance),
    recurringConcepts,
    attempts: attemptStats,
    questionTypes,
    repeatBreakdown,
  };
}

// ---------------------------------------------------------------------------------------------
// Study priority — methodology §9. Published thresholds, no decimals, explanation always attached.

const fraction = (k: number, n: number) => (n === 0 ? 0 : k / n);

export function computePriority(topics: TopicStat[], idx: TaxonomyIndex, attempts: ExamAttempt[], window: AttemptId[], provenance: AnalyticsEnvelope["provenance"] = "VERIFIED"): PriorityEntry[] {
  const N = window.length;
  const sortedMarks = topics.filter((t) => t.currentPriorityEligible).map((t) => t.marks).sort((a, b) => a - b);
  const quantile = (p: number) => sortedMarks[Math.min(sortedMarks.length - 1, Math.floor(p * sortedMarks.length))] ?? 0;
  const median = quantile(0.5);
  const q3 = quantile(0.75);
  const label = (a: AttemptId) => attempts.find((x) => x.id === a)?.shortLabel ?? a;

  return topics.map((t) => {
    const node = idx.topic.get(t.topicId)!;
    const eligibleAttempts = window.filter((a) => {
      const v = attempts.find((x) => x.id === a)?.syllabusVersion;
      return v ? Boolean(node.lessonBySyllabusVersion?.[v]) : false;
    });
    const cov = fraction(t.coverage, N);
    const points = {
      coverage: cov >= 2 / 3 ? 2 : cov >= 1 / 3 ? 1 : 0,
      marks: t.marks >= q3 && t.marks > 0 ? 2 : t.marks >= median && t.marks > 0 ? 1 : 0,
      recency: t.attemptsSinceLastSeen === 0 ? 2 : t.attemptsSinceLastSeen !== null && t.attemptsSinceLastSeen < 3 ? 1 : 0,
      repetition: t.repeatedConceptClusters > 0 ? 1 : 0,
      total: 0,
    };
    points.total = points.coverage + points.marks + points.recency + points.repetition;

    let lab: PriorityLabel;
    if (!t.currentPriorityEligible) lab = "NOT_EXAMINABLE";
    else if (eligibleAttempts.length < 3) lab = "INSUFFICIENT_HISTORY";
    else if (points.total >= 5 && cov >= 2 / 3) lab = "HIGH";
    else if (points.total >= 3) lab = "MEDIUM";
    else lab = "LOW";

    const demo = provenance === "DEMO";
    const parts = [
      `${demo ? "In the demonstration data, appeared" : "Appeared"} in ${t.coverage} of the last ${N} attempts`,
      `carrying ${t.marks} marks in total (average ${t.averageMarks} per appearance)`,
      t.lastSeen ? `last asked ${label(t.lastSeen)}` : "",
      t.repeatedConceptClusters > 0 ? `${t.repeatedConceptClusters} concept${t.repeatedConceptClusters > 1 ? "s" : ""} recurred across attempts` : "",
    ].filter(Boolean);
    const explanation =
      lab === "NOT_EXAMINABLE"
        ? `Removed from the syllabus from December 2025. Shown for history only. ${parts[0]}.`
        : lab === "INSUFFICIENT_HISTORY"
          ? `Only ${eligibleAttempts.length} attempts have examined this topic in its current form — too few to rank.`
          : `${parts.join(", ")}. ${demo ? "Illustrative only — synthetic questions, not ICSI examination history." : "Historical pattern only; not a prediction."}`;

    return { topicId: t.topicId, topicName: t.topicName, chapterName: t.chapterName, label: lab, points, explanation };
  });
}
