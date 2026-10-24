import "server-only";
// Loads and validates the AI-desk-review candidate for the local preview, then runs the production analytics on it.
// Any missing file or failed check returns { ok: false } with the reasons: the preview never falls back to demo data.
// Question text is never read into the preview records (only paper part and source page come from the raw extraction).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { ATTEMPTS } from "@/content/attempts";
import { computeAnalytics, computeSummary, indexTaxonomy } from "@/lib/analytics/compute";
import { CANDIDATE_LABEL, type CandidatePreviewPaths } from "@/lib/config/candidate-preview";
import type { AnalyticsEnvelope, SubjectAnalytics, SubjectSummary } from "@/types/analytics";
import type { AttemptId, Chapter, QuestionRecord, QuestionType, SyllabusVersion, Taxonomy, Topic } from "@/types/domain";

/** Statuses a candidate record may carry. An APPROVED or VERIFIED record cannot be part of an unreviewed candidate. */
const CANDIDATE_STATUSES = ["NEEDS_REVIEW", "CLASSIFIED"];
const QUESTION_TYPES: QuestionType[] = ["mcq", "descriptive_theory", "short_note", "comment_true_false", "practical_application", "case_based", "numerical", "drafting"];
const SYLLABUS_VERSIONS: SyllabusVersion[] = ["2022-original", "2022-mod-dec2025"];

export interface HeldRecord {
  id: string;
  shortId: string;
  attempt: string;
  status: string;
  reviewerDecision: string;
  reason: string;
  primaryNode: string;
  marks: number | null;
  isAlternative: boolean;
  /** Whether the record's own node is current-priority eligible, i.e. whether the hold is what keeps it out of current figures. */
  onCurrentNode: boolean;
  historicallyEligible: boolean;
}

export interface CandidatePreviewData {
  label: string;
  source: {
    dataset: string;
    datasetSha256: string;
    overlay: string;
    taxonomy: string;
    classificationVersion: string;
    taxonomyVersion: string;
    stage: string;
  };
  recordCount: number;
  verificationStatusCounts: Record<string, number>;
  reviewCounts: Record<string, number>;
  changedRecordIds: string[];
  held: HeldRecord[];
  records: QuestionRecord[];
  taxonomy: Taxonomy;
  summary: SubjectSummary;
  analytics: SubjectAnalytics;
  current: { questionCount: number; marks: number; topicCount: number; chapterCount: number };
}

export type CandidatePreviewResult = { ok: true; data: CandidatePreviewData } | { ok: false; errors: string[]; paths: CandidatePreviewPaths };

/* eslint-disable @typescript-eslint/no-explicit-any -- research JSON is validated field by field below */
type Json = any;

const HOLD_REASON: Record<string, string> = {
  NOT_APPLIED_PENDING_EVIDENCE: "Pending evidence: source material the review marks as decisive is not available, so the classification is unconfirmed.",
  NOT_APPLIED_PENDING_REVIEW: "Pending human review: plausible requirement mappings give different primary topics, and the AI review did not choose between them.",
  NOT_APPLIED_CONFLICT: "Decision not applied: it conflicts with the confidence rule (no confidence increase on an AI acceptance alone) and needs a human decision.",
};

function readJson(path: string, what: string, errors: string[]): { text: string; json: Json } | null {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    errors.push(`${what} could not be read at ${path} (${(e as NodeJS.ErrnoException).code ?? "read error"}).`);
    return null;
  }
  try {
    return { text, json: JSON.parse(text) };
  } catch {
    errors.push(`${what} at ${path} is not valid JSON.`);
    return null;
  }
}

/** Website taxonomy shape from the research taxonomy, with the same field mapping as scripts/export-taxonomy.mjs. */
export function webTaxonomy(tax: Json): Taxonomy {
  const nodes: Json[] = tax.nodes;
  const kids = (id: string) => nodes.filter((n) => n.parent_id === id);
  const keep = (n: Json) => ({
    id: n.taxonomy_id,
    name: n.name,
    status: n.status,
    classificationUse: n.classification_use,
    currentPriorityEligible: n.current_priority_eligible,
    historicalAnalyticsEligible: n.historical_analytics_eligible,
    ...(n.classify_to ? { classifyTo: n.classify_to } : {}),
    ...(n.lesson_by_syllabus_version ? { lessonBySyllabusVersion: n.lesson_by_syllabus_version } : {}),
  });
  const chapters = kids("CLP")
    .filter((c) => c.classification_use === "STRUCTURAL")
    .map(
      (c): Chapter => ({
        ...keep(c),
        number: c.syllabus_lesson_number,
        part: c.paper_part,
        studyMaterialLesson: c.study_material_lesson,
        topics: kids(c.taxonomy_id).map((t): Topic => ({ ...keep(t), subtopics: kids(t.taxonomy_id).map(keep) })),
      }),
    );
  return { subject: "clp", taxonomyVersion: tax.meta.taxonomy_version, chapters };
}

export function loadCandidatePreview(paths: CandidatePreviewPaths): CandidatePreviewResult {
  const errors: string[] = [];
  const fail = () => ({ ok: false as const, errors, paths });
  const ds = readJson(paths.dataset, "Candidate dataset", errors);
  const ov = readJson(paths.overlay, "Review-status overlay", errors);
  const tx = readJson(paths.taxonomy, "Taxonomy v0.3", errors);
  const rw = readJson(paths.raw, "Raw extraction", errors);
  if (!ds || !ov || !tx || !rw) return fail();

  const meta = ds.json?.meta;
  const recs: Json[] = ds.json?.records;
  if (!meta || !Array.isArray(recs) || recs.length === 0) return (errors.push("Candidate dataset has no meta or no records."), fail());
  if (typeof meta.label !== "string" || !meta.label.includes("NOT PROFESSIONALLY VERIFIED")) errors.push("Candidate dataset is not labelled NOT PROFESSIONALLY VERIFIED.");
  if (typeof meta.classification_version !== "string" || !meta.classification_version.startsWith("v0.2")) errors.push(`Unexpected classification_version ${String(meta.classification_version)}.`);
  if (!Array.isArray(tx.json?.nodes) || tx.json?.meta?.taxonomy_version !== "0.3") errors.push("Taxonomy file is not taxonomy v0.3.");
  if (typeof ov.json?.label !== "string" || !ov.json.label.includes("NOT PROFESSIONALLY VERIFIED")) errors.push("Review overlay is not labelled NOT PROFESSIONALLY VERIFIED.");
  if (!Array.isArray(ov.json?.records) || !Array.isArray(ov.json?.current_priority_holds)) errors.push("Review overlay has no records or holds list.");
  const raw: Json[] | undefined = rw.json?.questions;
  if (!Array.isArray(raw)) errors.push("Raw extraction has no questions list.");
  if (errors.length) return fail();

  const datasetSha256 = createHash("sha256").update(ds.text).digest("hex");
  if (ov.json.candidate_sha256 !== datasetSha256) errors.push("Review overlay was built for a different candidate file (candidate_sha256 mismatch).");

  const N = new Map<string, Json>(tx.json.nodes.map((n: Json) => [n.taxonomy_id, n]));
  const R = new Map<string, Json>(raw!.map((q) => [q.question_id, q]));
  const attemptByLabel = new Map(ATTEMPTS.map((a) => [a.label, a.id]));
  const ids = new Set<string>();
  for (const r of recs) {
    const id = r?.question_id;
    const at = `record ${String(id)}`;
    if (typeof id !== "string" || !id) {
      errors.push("A record has no question_id.");
      continue;
    }
    if (ids.has(id)) errors.push(`${at}: duplicate question_id.`);
    ids.add(id);
    if (!attemptByLabel.has(r.attempt)) errors.push(`${at}: attempt ${String(r.attempt)} is not a known attempt.`);
    if (!(r.marks === null || typeof r.marks === "number")) errors.push(`${at}: marks must be a number or null.`);
    if (typeof r.is_alternative !== "boolean") errors.push(`${at}: is_alternative must be boolean.`);
    if (typeof r.concept_key !== "string" || !r.concept_key) errors.push(`${at}: concept_key missing.`);
    if (!QUESTION_TYPES.includes(r.question_type)) errors.push(`${at}: question_type ${String(r.question_type)} not recognised.`);
    if (!SYLLABUS_VERSIONS.includes(r.exam_syllabus_version)) errors.push(`${at}: exam_syllabus_version ${String(r.exam_syllabus_version)} not recognised.`);
    if (!CANDIDATE_STATUSES.includes(r.verification_status)) errors.push(`${at}: verification_status ${String(r.verification_status)} is not allowed in an unreviewed candidate.`);
    if (!Array.isArray(r.uncertainty_flags)) errors.push(`${at}: uncertainty_flags must be a list.`);
    if (!R.has(id)) errors.push(`${at}: not found in the raw extraction.`);
    const node = N.get(r.canonical_taxonomy_location);
    if (!node) {
      errors.push(`${at}: node ${String(r.canonical_taxonomy_location)} is not in taxonomy v0.3.`);
      continue;
    }
    if (node.classification_use !== "CLASSIFIABLE" && node.classification_use !== "CONTROL") errors.push(`${at}: node ${node.taxonomy_id} is ${node.classification_use}.`);
    const control = node.classification_use === "CONTROL";
    if (!control && (N.get(r.topic)?.level !== "topic" || N.get(r.chapter)?.level !== "chapter")) errors.push(`${at}: topic/chapter fields do not resolve in taxonomy v0.3.`);
    // the record's stored eligibility must agree with its own node; the preview recomputes from the taxonomy, never trusts a mismatch
    if (r.current_priority_eligible !== (Boolean(node.current_priority_eligible) && !control)) errors.push(`${at}: current_priority_eligible disagrees with taxonomy v0.3.`);
  }
  const ovIds = new Set<string>(ov.json.records.map((o: Json) => o.record_id));
  for (const o of ov.json.records as Json[]) {
    if (!ids.has(o.record_id)) errors.push(`Overlay record ${String(o.record_id)} is not in the candidate dataset.`);
    if (o.current_priority_hold === true && !String(o.implementation_status).startsWith("NOT_APPLIED")) errors.push(`Overlay record ${o.record_id}: a hold must belong to an unapplied decision.`);
  }
  const holdIds = new Set<string>(ov.json.current_priority_holds);
  const flagged = new Set<string>((ov.json.records as Json[]).filter((o) => o.current_priority_hold === true).map((o) => o.record_id));
  if (holdIds.size !== flagged.size || [...holdIds].some((h) => !flagged.has(h) || !ovIds.has(h))) errors.push("Overlay holds list does not match its per-record hold flags.");
  if (errors.length) return fail();

  const taxonomy = webTaxonomy(tx.json);
  const chapterPart = new Map(taxonomy.chapters.map((c) => [c.id, c.part]));
  const records: QuestionRecord[] = [];
  for (const r of recs) {
    const rawQ = R.get(r.question_id);
    const part = chapterPart.get(r.chapter) ?? rawQ.paper_part_printed;
    if (part !== "I" && part !== "II") {
      errors.push(`record ${r.question_id}: paper part is unknown (no chapter and none printed).`);
      continue;
    }
    records.push({
      id: r.question_id,
      isDemo: false,
      subject: "clp",
      paperCode: "522",
      attempt: attemptByLabel.get(r.attempt)! as AttemptId,
      syllabusVersion: r.exam_syllabus_version,
      questionNumber: Number.parseInt(r.question_number, 10),
      subQuestion: r.question_path,
      paperPart: part,
      marks: r.marks,
      questionText: "", // never loaded: the preview shows aggregates only
      questionType: r.question_type,
      // control-node records carry no chapter/topic; their node ID keeps them out of every topic metric (counted as unmapped)
      chapterId: r.chapter ?? r.canonical_taxonomy_location,
      topicId: r.topic ?? r.canonical_taxonomy_location,
      subtopicId: r.subtopic,
      conceptKey: r.concept_key,
      canonicalTaxonomyLocation: r.canonical_taxonomy_location,
      historicalLessonAtExamTime: r.historical_lesson_at_exam_time,
      historicalNodeAtExamTime: r.historical_node_at_exam_time,
      syllabusStatus: r.syllabus_status,
      verificationStatus: r.verification_status,
      classificationConfidence: r.classification_confidence,
      choiceGroupId: r.alternative_group,
      isAlternative: r.is_alternative,
      // repeat_status is null on every record (not yet assessed); the preview does not display repeat analysis
      repeatStatus: r.repeat_status ?? "UNRESOLVED",
      relatedQuestionIds: [],
      sourceUrl: rawQ.source_url ?? null,
      sourcePage: rawQ.pdf_page_start ?? null,
      currentPriorityHold: holdIds.has(r.question_id),
    });
  }
  if (errors.length) return fail();

  const env: AnalyticsEnvelope = {
    provenance: "CANDIDATE",
    acceptedVerificationStatuses: CANDIDATE_STATUSES,
    subject: "clp",
    attemptsInWindow: ATTEMPTS.map((a) => a.id),
    taxonomyVersion: taxonomy.taxonomyVersion,
    generatedFrom: relative(paths.root, paths.dataset),
  };
  const idx = indexTaxonomy(taxonomy);
  const summary = computeSummary(env, records, idx);
  const analytics = computeAnalytics(env, records, idx, ATTEMPTS);
  const byId = new Map(recs.map((r: Json) => [r.question_id, r]));
  const held: HeldRecord[] = (ov.json.records as Json[])
    .filter((o) => o.current_priority_hold === true)
    .map((o) => {
      const r = byId.get(o.record_id);
      const node = N.get(r.canonical_taxonomy_location);
      return {
        id: o.record_id,
        shortId: o.record_id.replace("EP-2022-522-", ""),
        attempt: r.attempt,
        status: o.implementation_status,
        reviewerDecision: o.reviewer_decision,
        reason: HOLD_REASON[o.implementation_status] ?? "Unresolved review decision.",
        primaryNode: r.canonical_taxonomy_location,
        marks: r.marks,
        isAlternative: r.is_alternative,
        onCurrentNode: Boolean(node.current_priority_eligible) && node.classification_use !== "CONTROL",
        historicallyEligible: Boolean(node.historical_analytics_eligible) && node.classification_use !== "CONTROL",
      };
    });
  const count = (xs: string[]) => xs.reduce<Record<string, number>>((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {});
  return {
    ok: true,
    data: {
      label: CANDIDATE_LABEL,
      source: {
        dataset: relative(paths.root, paths.dataset),
        datasetSha256,
        overlay: relative(paths.root, paths.overlay),
        taxonomy: relative(paths.root, paths.taxonomy),
        classificationVersion: meta.classification_version,
        taxonomyVersion: taxonomy.taxonomyVersion,
        stage: meta.stage,
      },
      recordCount: recs.length,
      verificationStatusCounts: count(recs.map((r: Json) => r.verification_status)),
      reviewCounts: ov.json.counts ?? {},
      changedRecordIds: meta.changed_record_ids ?? [],
      held,
      records,
      taxonomy,
      summary,
      analytics,
      current: {
        questionCount: analytics.currentTopics.reduce((s, t) => s + t.questionCount, 0),
        marks: analytics.currentTopics.reduce((s, t) => s + t.marks, 0),
        topicCount: analytics.currentTopics.length,
        chapterCount: analytics.chapters.filter((c) => c.currentQuestionCount > 0).length,
      },
    },
  };
}
