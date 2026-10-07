// Generates DEMO question records for Company Law & Practice.
//
// These records are NOT real ICSI questions. Their shape matches the question schema in
// PROJECT_METHODOLOGY.md §5 so the UI can be built before the verified dataset exists.
// Taxonomy placement uses the real frozen taxonomy (content/taxonomy/clp.json);
// question text, marks and repeat links are synthetic and every record carries isDemo: true.
//
// Deterministic (seeded) so builds are reproducible.
// Usage: node scripts/generate-demo-questions.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const tax = JSON.parse(readFileSync(resolve(here, "../content/taxonomy/clp.json"), "utf8"));

let seed = 522;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// Single source of attempts shared with the app and the validator.
const ATTEMPTS = JSON.parse(readFileSync(resolve(here, "../content/attempts.json"), "utf8")).attempts.map((a) => ({ id: a.id, version: a.syllabusVersion }));

// Weights only shape the demo distribution so the charts have something to show.
const WEIGHT = { 14: 6, 13: 5, 4: 5, 15: 4, 16: 4, 9: 4, 3: 3, 8: 3, 19: 3, 18: 3, 7: 2, 2: 2, 5: 2, 6: 2, 10: 2, 1: 2, 11: 1, 12: 1, 17: 1 };

function candidates(attempt, part) {
  const out = [];
  for (const ch of tax.chapters) {
    if (ch.part !== part) continue;
    for (const t of ch.topics) {
      if (t.classificationUse !== "CLASSIFIABLE") continue;
      const versions = Object.keys(t.lessonBySyllabusVersion ?? {});
      if (!versions.includes(attempt.version)) continue; // deleted topics only in earlier attempts
      const subs = t.subtopics.filter((s) => s.classificationUse === "CLASSIFIABLE");
      const w = WEIGHT[ch.number] ?? 1;
      for (let i = 0; i < w; i++) out.push({ ch, t, subs });
    }
  }
  return out;
}

// alias topic id (classify_to = canonical) per canonical topic, for historical_node_at_exam_time
const ALIAS_OF = new Map();
for (const ch of tax.chapters) for (const t of ch.topics) if (t.classifyTo) ALIAS_OF.set(t.classifyTo, { id: t.id, lesson: ch.id });
function aliasAtExam(topicId, version) {
  const alias = ALIAS_OF.get(topicId);
  if (!alias) return null;
  const node = tax.chapters.flatMap((c) => c.topics).find((t) => t.id === topicId);
  return node?.lessonBySyllabusVersion?.[version] === alias.lesson ? alias.id : null;
}

const TYPES = ["descriptive_theory", "practical_application", "comment_true_false", "short_note", "drafting"];
const STEMS = {
  descriptive_theory: "Explain the provisions relating to",
  practical_application: "Advise the company on",
  comment_true_false: "Comment on a statement concerning",
  short_note: "Write a short note on",
  drafting: "Draft the document required for",
  case_based: "Case study: examine",
};

// Paper layout (demo): Q1 case study 4 x 5 marks; Q2–Q6 (a) 6 + (b) 5 + (c) 5 = 16 each → 100 marks.
const LAYOUT = [
  { q: 1, part: "I", subs: [["a", 5], ["b", 5], ["c", 5], ["d", 5]], type: "case_based" },
  { q: 2, part: "I", subs: [["a", 6], ["b", 5], ["c", 5]] },
  { q: 3, part: "I", subs: [["a", 6], ["b", 5], ["c", 5]] },
  { q: 4, part: "I", subs: [["a", 6], ["b", 5], ["c", 5]] },
  { q: 5, part: "II", subs: [["a", 6], ["b", 5], ["c", 5]] },
  { q: 6, part: "II", subs: [["a", 6], ["b", 5], ["c", 5]] },
];

const questions = [];
for (const attempt of ATTEMPTS) {
  for (const block of LAYOUT) {
    const pool = candidates(attempt, block.part);
    for (const [sub, marks] of block.subs) {
      const { ch, t, subs } = pick(pool);
      const st = subs.length && rand() < 0.7 ? pick(subs) : null;
      const type = block.type ?? pick(TYPES);
      const concept = st ? st.name : t.name;
      questions.push({
        id: `EP-2022-522-${attempt.id.replace("-", "")}-Q${block.q}-${sub}`,
        isDemo: true,
        subject: "clp",
        paperCode: "522",
        attempt: attempt.id,
        syllabusVersion: attempt.version,
        questionNumber: block.q,
        subQuestion: sub,
        paperPart: block.part,
        marks,
        questionText: `[Demo] ${STEMS[type]} ${concept.charAt(0).toLowerCase()}${concept.slice(1)}.`,
        questionType: type,
        chapterId: ch.id,
        topicId: t.id,
        subtopicId: st ? st.id : null,
        conceptKey: st ? st.id : t.id,
        canonicalTaxonomyLocation: st ? st.id : t.id,
        historicalLessonAtExamTime: t.lessonBySyllabusVersion[attempt.version],
        // Relocated topics (e.g. CSR L17 -> L18): the alias node the concept sat in at exam time.
        historicalNodeAtExamTime: aliasAtExam(t.id, attempt.version),
        syllabusStatus: t.status,
        verificationStatus: "DEMO",
        classificationConfidence: null,
        choiceGroupId: null,
        isAlternative: false,
        sourceUrl: null,
        sourcePage: null,
      });
    }
  }
}

// Repeat status per methodology §7, computed against EARLIER attempts only.
const order = ATTEMPTS.map((a) => a.id);
for (const q of questions) {
  const earlier = questions.filter((o) => order.indexOf(o.attempt) < order.indexOf(q.attempt));
  const sameConcept = earlier.filter((o) => o.conceptKey === q.conceptKey);
  const sameTopic = earlier.filter((o) => o.topicId === q.topicId);
  const sameChapter = earlier.filter((o) => o.chapterId === q.chapterId);
  let status = "FIRST_SEEN";
  let related = [];
  if (sameConcept.length) {
    status = sameConcept.some((o) => o.questionType === q.questionType) && rand() < 0.5 ? "EXACT_REPEAT" : "CONCEPTUAL_REPEAT";
    related = sameConcept;
  } else if (sameTopic.length) {
    status = "TOPIC_REPEAT";
    related = sameTopic;
  } else if (sameChapter.length) {
    status = "CHAPTER_REPEAT";
    related = sameChapter;
  }
  q.repeatStatus = status;
  q.relatedQuestionIds = related.slice(-3).map((o) => o.id);
}

writeFileSync(
  resolve(here, "../mock/questions/clp.json"),
  JSON.stringify(
    {
      meta: {
        provenance: "DEMO",
        subject: "clp",
        taxonomyVersion: tax.meta.taxonomyVersion,
        note: "Synthetic demo records. Not ICSI questions. Replace with the approved dataset (web_export) when available.",
        generator: "scripts/generate-demo-questions.mjs",
      },
      questions,
    },
    null,
    1,
  ) + "\n",
);
console.log(`generated ${questions.length} demo questions`);
