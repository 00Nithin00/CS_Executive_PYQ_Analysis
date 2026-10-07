// Validates a question dataset against the frozen taxonomy and methodology v0.3 rules.
// Works for the demo set today and the approved web_export later (pass --real for APPROVED records).
//
//   node scripts/validate-dataset.mjs                                   # mock/questions/clp.json, demo rules
//   node scripts/validate-dataset.mjs path/to/clp.json --real           # approved dataset rules
//
// Exit code 1 on any error. Writes a JSON report next to the dataset (<file>.validation.json).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const real = args.includes("--real");
const file = resolve(args.find((a) => !a.startsWith("--")) ?? resolve(here, "../mock/questions/clp.json"));
const data = JSON.parse(readFileSync(file, "utf8"));
const tax = JSON.parse(readFileSync(resolve(here, "../content/taxonomy/clp.json"), "utf8"));
const ATT = JSON.parse(readFileSync(resolve(here, "../content/attempts.json"), "utf8")).attempts;

const chapters = new Map(tax.chapters.map((c) => [c.id, c]));
const topics = new Map(tax.chapters.flatMap((c) => c.topics.map((t) => [t.id, { ...t, chapterId: c.id }])));
const subtopics = new Map(tax.chapters.flatMap((c) => c.topics.flatMap((t) => t.subtopics.map((s) => [s.id, { ...s, topicId: t.id }]))));
const attempts = new Map(ATT.map((a, i) => [a.id, { ...a, index: i }]));
const TYPES = new Set(["mcq", "descriptive_theory", "short_note", "comment_true_false", "practical_application", "case_based", "numerical", "drafting"]);
const REPEATS = new Set(["FIRST_SEEN", "EXACT_REPEAT", "CONCEPTUAL_REPEAT", "TOPIC_REPEAT", "CHAPTER_REPEAT", "UNRESOLVED"]);
const ID_RE = /^EP-2022-522-(\d{4})(06|12)-Q(\d+)(?:-([a-z]+))?(?:-([ivx]+))?$/;

const errors = [];
const warn = [];
const err = (id, msg) => errors.push(`${id}: ${msg}`);
const qs = data.questions;
const byId = new Map();

if (data.meta?.taxonomyVersion !== tax.meta.taxonomyVersion) errors.push(`dataset taxonomyVersion ${data.meta?.taxonomyVersion} != taxonomy ${tax.meta.taxonomyVersion}`);
if (!real && data.meta?.provenance !== "DEMO") errors.push("demo dataset must declare meta.provenance = DEMO");

for (const q of qs) {
  const id = q.id;
  if (byId.has(id)) err(id, "duplicate id");
  byId.set(id, q);
  const m = ID_RE.exec(id);
  if (!m) err(id, "id does not match EP-2022-522-YYYYMM-Q<n>[-sub]");
  else {
    if (`${m[1]}-${m[2]}` !== q.attempt) err(id, `id attempt ${m[1]}-${m[2]} != attempt ${q.attempt}`);
    if (Number(m[3]) !== q.questionNumber) err(id, "id question number mismatch");
    if ((m[4] ?? null) !== (q.subQuestion ?? null)) err(id, "id sub-question mismatch");
  }
  // attempt metadata
  const a = attempts.get(q.attempt);
  if (!a) err(id, `unknown attempt ${q.attempt}`);
  else if (a.syllabusVersion !== q.syllabusVersion) err(id, `syllabusVersion ${q.syllabusVersion} != attempt's ${a.syllabusVersion}`);
  if (q.subject !== "clp" || q.paperCode !== "522") err(id, "subject/paperCode must be clp/522");
  // marks
  if (q.marks !== null && (!Number.isInteger(q.marks) || q.marks <= 0 || q.marks > 20)) err(id, `invalid marks ${q.marks}`);
  if (q.marks === null) warn.push(`${id}: marks null (excluded from marks weight)`);
  if (typeof q.isAlternative !== "boolean") err(id, "isAlternative must be boolean");
  if (q.isAlternative && !q.choiceGroupId) err(id, "alternative without choiceGroupId");
  // taxonomy
  const ch = chapters.get(q.chapterId);
  const t = topics.get(q.topicId);
  if (!ch) err(id, `unknown chapter ${q.chapterId}`);
  if (!t) err(id, `unknown topic ${q.topicId}`);
  else {
    if (t.chapterId !== q.chapterId) err(id, `topic ${q.topicId} not in chapter ${q.chapterId}`);
    if (t.classificationUse !== "CLASSIFIABLE") err(id, `topic ${q.topicId} is ${t.classificationUse} (alias/control nodes cannot be classified to)`);
    if (t.status !== q.syllabusStatus) err(id, `syllabusStatus ${q.syllabusStatus} != taxonomy ${t.status}`);
    const lesson = t.lessonBySyllabusVersion?.[q.syllabusVersion] ?? null;
    if (lesson === null && !real) err(id, `topic ${q.topicId} not examinable in ${q.syllabusVersion} (deleted content in a later attempt)`);
    if (lesson !== null && q.historicalLessonAtExamTime !== lesson) err(id, `historicalLessonAtExamTime ${q.historicalLessonAtExamTime} != ${lesson}`);
    const alias = [...topics.values()].find((x) => x.classifyTo === q.topicId);
    const expectedNode = alias && lesson === alias.chapterId ? alias.id : null;
    if ((q.historicalNodeAtExamTime ?? null) !== expectedNode) err(id, `historicalNodeAtExamTime ${q.historicalNodeAtExamTime} != ${expectedNode}`);
  }
  if (q.subtopicId !== null) {
    const s = subtopics.get(q.subtopicId);
    if (!s) err(id, `unknown subtopic ${q.subtopicId}`);
    else {
      if (s.topicId !== q.topicId) err(id, `subtopic ${q.subtopicId} not under topic ${q.topicId}`);
      if (s.classificationUse !== "CLASSIFIABLE") err(id, `subtopic ${q.subtopicId} is ${s.classificationUse}`);
    }
  }
  const canonical = q.subtopicId ?? q.topicId;
  if (q.canonicalTaxonomyLocation !== canonical) err(id, `canonicalTaxonomyLocation ${q.canonicalTaxonomyLocation} != ${canonical}`);
  if (!TYPES.has(q.questionType)) err(id, `invalid questionType ${q.questionType}`);
  if (!REPEATS.has(q.repeatStatus)) err(id, `invalid repeatStatus ${q.repeatStatus}`);
  // demo-labelling rules
  if (!real) {
    if (q.isDemo !== true) err(id, "isDemo must be true");
    if (q.verificationStatus !== "DEMO") err(id, "verificationStatus must be DEMO");
    if (!q.questionText.startsWith("[Demo] ")) err(id, "questionText must start with '[Demo] '");
    if (q.sourceUrl !== null || q.sourcePage !== null) err(id, "demo record must not cite an official source URL/page");
  } else if (q.verificationStatus === "APPROVED" && (!q.sourceUrl || q.sourcePage === null)) err(id, "approved record without source URL/page");
}

// per-paper structure: atomic units, marks sum (compulsory only), question count
const papers = new Map();
for (const q of qs) papers.set(q.attempt, [...(papers.get(q.attempt) ?? []), q]);
for (const [att, list] of papers) {
  const groups = new Map();
  let compulsory = 0;
  for (const q of list) {
    if (q.isAlternative) groups.set(q.choiceGroupId, Math.max(groups.get(q.choiceGroupId) ?? 0, q.marks ?? 0));
    else compulsory += q.marks ?? 0;
  }
  const total = compulsory + [...groups.values()].reduce((s, v) => s + v, 0);
  if (total !== 100) errors.push(`paper ${att}: compulsory marks sum to ${total}, expected 100`);
  const qnos = new Set(list.map((q) => q.questionNumber));
  if (qnos.size !== 6) errors.push(`paper ${att}: ${qnos.size} top-level questions, expected 6`);
  const parts = { I: 0, II: 0 };
  for (const q of list) if (!q.isAlternative) parts[q.paperPart] += q.marks ?? 0;
  const partByChapter = list.filter((q) => chapters.get(q.chapterId)?.part !== q.paperPart);
  if (partByChapter.length) errors.push(`paper ${att}: ${partByChapter.length} records whose paperPart differs from their chapter's part`);
}

// repeat status consistency (methodology §7): recomputed against EARLIER attempts only
const order = (a) => attempts.get(a)?.index ?? -1;
let repeatChecked = 0;
for (const q of qs) {
  const earlier = qs.filter((o) => order(o.attempt) < order(q.attempt));
  const sameConcept = earlier.filter((o) => o.conceptKey === q.conceptKey);
  const sameTopic = earlier.filter((o) => o.topicId === q.topicId);
  const sameChapter = earlier.filter((o) => o.chapterId === q.chapterId);
  const expected = sameConcept.length ? ["EXACT_REPEAT", "CONCEPTUAL_REPEAT"] : sameTopic.length ? ["TOPIC_REPEAT"] : sameChapter.length ? ["CHAPTER_REPEAT"] : ["FIRST_SEEN"];
  if (!expected.includes(q.repeatStatus)) err(q.id, `repeatStatus ${q.repeatStatus}, expected ${expected.join("/")}`);
  if (q.repeatStatus === "EXACT_REPEAT" && !sameConcept.some((o) => o.questionType === q.questionType)) err(q.id, "EXACT_REPEAT requires an earlier same-concept question of the same task type");
  for (const rid of q.relatedQuestionIds) {
    const r = byId.get(rid);
    if (!r) err(q.id, `related id ${rid} does not exist`);
    else {
      if (order(r.attempt) >= order(q.attempt)) err(q.id, `related ${rid} is not from an earlier attempt`);
      const rel = q.repeatStatus;
      if ((rel === "EXACT_REPEAT" || rel === "CONCEPTUAL_REPEAT") && r.conceptKey !== q.conceptKey) err(q.id, `related ${rid} has a different concept`);
      if (rel === "TOPIC_REPEAT" && r.topicId !== q.topicId) err(q.id, `related ${rid} has a different topic`);
      if (rel === "CHAPTER_REPEAT" && r.chapterId !== q.chapterId) err(q.id, `related ${rid} has a different chapter`);
    }
  }
  if (q.repeatStatus === "FIRST_SEEN" && q.relatedQuestionIds.length) err(q.id, "FIRST_SEEN must have no related questions");
  repeatChecked++;
}

// analytics exclusion sanity: nothing on control/alias nodes; every record counted by analytics
const excluded = qs.filter((q) => !topics.get(q.topicId) || topics.get(q.topicId).historicalAnalyticsEligible !== true);

const counts = (k) => Object.fromEntries([...qs.reduce((m, q) => m.set(q[k], (m.get(q[k]) ?? 0) + 1), new Map())].sort());
const report = {
  file,
  mode: real ? "real" : "demo",
  records: qs.length,
  errors: errors.length,
  warnings: warn.length,
  repeatStatusChecked: repeatChecked,
  excludedFromAnalytics: excluded.length,
  byAttempt: counts("attempt"),
  byRepeatStatus: counts("repeatStatus"),
  bySyllabusStatus: counts("syllabusStatus"),
  marksByAttempt: Object.fromEntries([...papers].map(([a, l]) => [a, l.reduce((s, q) => s + (q.isAlternative ? 0 : (q.marks ?? 0)), 0)])),
  distinctTopics: new Set(qs.map((q) => q.topicId)).size,
  distinctChapters: new Set(qs.map((q) => q.chapterId)).size,
  errorList: errors,
  warningList: warn,
};
writeFileSync(`${file}.validation.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ ...report, errorList: errors.slice(0, 20), warningList: warn.slice(0, 5) }, null, 2));
process.exit(errors.length ? 1 : 0);
