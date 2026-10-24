// Exports the frozen research taxonomy into the website's content folder.
// Source of truth: ../taxonomy/clp_taxonomy_v0.3.json (FROZEN_FOR_PAPER_ANALYSIS; nodes identical to v0.2, CR-001 note only).
// Only the fields the website needs are kept; IDs, names and statuses are copied verbatim.
// Usage: node scripts/export-taxonomy.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../taxonomy/clp_taxonomy_v0.3.json");
const out = resolve(here, "../content/taxonomy/clp.json");

const tax = JSON.parse(readFileSync(src, "utf8"));
if (tax.meta.status !== "FROZEN_FOR_PAPER_ANALYSIS") {
  throw new Error(`Refusing to export a non-frozen taxonomy (status ${tax.meta.status})`);
}

const nodes = tax.nodes;
const kids = (id) => nodes.filter((n) => n.parent_id === id);
const keep = (n) => ({
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
  .map((c) => ({
    ...keep(c),
    number: c.syllabus_lesson_number,
    part: c.paper_part,
    studyMaterialLesson: c.study_material_lesson,
    topics: kids(c.taxonomy_id).map((t) => ({
      ...keep(t),
      subtopics: kids(t.taxonomy_id).map(keep),
    })),
  }));

mkdirSync(dirname(out), { recursive: true });
writeFileSync(
  out,
  JSON.stringify(
    {
      meta: {
        subject: "clp",
        taxonomyVersion: tax.meta.taxonomy_version,
        methodologyVersionAtBuild: tax.meta.methodology_version_at_build,
        status: tax.meta.status,
        exportedFrom: "taxonomy/clp_taxonomy_v0.3.json",
      },
      chapters,
    },
    null,
    1,
  ) + "\n",
);
console.log(`exported ${chapters.length} chapters, ${chapters.reduce((a, c) => a + c.topics.length, 0)} topics -> ${out}`);
