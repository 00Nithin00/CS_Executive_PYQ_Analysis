// Exports the CLP (Paper 522) question-paper inventory from the research files into the website's content folder.
// Publishes only facts that reconcile against the official papers: attempts, printed headers, question structure,
// marks, alternatives, automated check results and official links. It never exports question text or any
// syllabus classification (no classification has completed human review).
// Sources (read-only): ../01_Source_Papers/CLP_PAPER_MANIFEST.csv, ../02_Raw_Extraction/CLP_atomic_questions_raw.json,
//                      ../02_Raw_Extraction/CLP_extraction_validation.json, ../03_Classified_Questions/CLP_classified_questions_v0.1.json,
//                      ../SOURCE_REGISTRY.md (§5 guideline answers)
// Usage: node scripts/export-paper-inventory.mjs [--check]   (--check: verify the committed file is current, write nothing)
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const out = resolve(here, "../content/papers/clp-paper-inventory.json");
const SRC = {
  manifest: "01_Source_Papers/CLP_PAPER_MANIFEST.csv",
  raw: "02_Raw_Extraction/CLP_atomic_questions_raw.json",
  validation: "02_Raw_Extraction/CLP_extraction_validation.json",
  classification: "03_Classified_Questions/CLP_classified_questions_v0.1.json",
  registry: "SOURCE_REGISTRY.md",
  release: "05_Approved_Dataset/CLP_approved_release.json",
};
const text = Object.fromEntries(Object.entries(SRC).map(([k, p]) => [k, readFileSync(resolve(root, p), "utf8")]));
const sha = (s) => createHash("sha256").update(s).digest("hex");
const fail = (m) => {
  console.error(`export-paper-inventory: ${m}`);
  process.exit(1);
};

// --- minimal CSV parser (quoted fields, commas inside quotes)
function parseCsv(s) {
  const rows = [];
  let row = [], f = "", q = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') (f += '"'), i++;
      else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") row.push(f), (f = "");
    else if (c === "\n") row.push(f), rows.push(row), (row = []), (f = "");
    else if (c !== "\r") f += c;
  }
  if (f || row.length) row.push(f), rows.push(row);
  const [head, ...body] = rows.filter((r) => r.length > 1);
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const attempts = JSON.parse(readFileSync(resolve(here, "../content/attempts.json"), "utf8")).attempts;
const attemptId = new Map(attempts.map((a) => [a.label, a.id]));
const manifest = parseCsv(text.manifest);
const raw = JSON.parse(text.raw);
const validation = JSON.parse(text.validation);
const cls = JSON.parse(text.classification).records;

// --- guideline answers for Syllabus 2022 (Group 1 file carries Paper 522), from SOURCE_REGISTRY.md §5
const base = text.registry.match(/## 5\. Guideline Answers[\s\S]*?Base URL: `([^`]+)`/)?.[1];
if (!base) fail("guideline-answer base URL not found in SOURCE_REGISTRY.md §5");
const SESSION = { Dec: "December", June: "June" };
const ga = new Map();
for (const m of text.registry.matchAll(/^\| (Dec|June) (\d{4}) \| Syllabus 2022 \| `([^`]+)`/gm)) ga.set(`${SESSION[m[1]]} ${m[2]}`, base + m[3]);

const papers = raw.papers.map((p) => {
  const man = manifest.find((m) => m.paper_id === p.paper_id);
  const val = validation.find((v) => v.paper_id === p.paper_id);
  if (!man || !val) fail(`${p.paper_id}: missing manifest or validation entry`);
  const id = attemptId.get(p.attempt);
  if (!id) fail(`${p.paper_id}: attempt ${p.attempt} is not in content/attempts.json`);
  const qs = raw.questions.filter((q) => q.paper_id === p.paper_id);
  const top = [...new Set(qs.map((q) => q.question_number))];
  // marks a candidate can attempt: compulsory units + one option of each alternative group
  // the first option of a choice group is not flagged is_alternative, but every option carries alternative_group
  const compulsory = qs.filter((q) => !q.alternative_group).reduce((s, q) => s + q.marks, 0);
  const groups = {};
  for (const q of qs.filter((q) => q.alternative_group)) {
    groups[q.alternative_group] ??= {};
    groups[q.alternative_group][q.alternative_option] = (groups[q.alternative_group][q.alternative_option] ?? 0) + q.marks;
  }
  const altMarks = Object.values(groups).reduce((s, opts) => s + Math.max(...Object.values(opts)), 0);
  const maxPrinted = Number(p.printed_header.maximum_marks);
  if (compulsory + altMarks !== maxPrinted) fail(`${p.paper_id}: attemptable marks ${compulsory + altMarks} != printed maximum ${maxPrinted}`);
  if (top.length !== Number(p.printed_header.total_questions) + Object.values(groups).reduce((s, o) => s + Object.keys(o).length - 1, 0))
    fail(`${p.paper_id}: question numbers ${top.join(",")} do not match ${p.printed_header.total_questions} printed questions plus alternatives`);
  const passed = val.checks.filter((c) => c.result === "PASS").length;
  const sourceVerified = ["paper_identity_verified", "syllabus_verified", "completeness_verified", "source_authority_verified"].every((k) => man[k] === "YES");
  return {
    paperId: p.paper_id,
    attempt: id,
    attemptLabel: p.attempt,
    paperCode: "522",
    officialPaperUrl: man.official_pdf_url,
    officialArchive: "https://www.icsi.edu/examination/previous-sessions-qps",
    guidelineAnswerUrl: ga.get(p.attempt) ?? null,
    sourceSha256: p.source_file_sha256,
    pages: p.pdf_pages,
    printed: { maximumMarks: maxPrinted, totalQuestions: Number(p.printed_header.total_questions), timeAllowed: p.printed_header.time_allowed },
    questions: top.map((n) => {
      const parts = qs.filter((q) => q.question_number === n);
      return { number: n, parts: parts.length, marks: parts.reduce((s, q) => s + q.marks, 0), alternativeGroup: parts[0].alternative_group ?? null };
    }),
    totals: { atomicParts: qs.length, alternativeParts: qs.filter((q) => q.is_alternative).length, attemptableMarks: compulsory + altMarks },
    checks: { source: sourceVerified ? "VERIFIED" : "NOT_VERIFIED", sourceVerifiedOn: man.verification_date, extraction: { passed, total: val.checks.length } },
  };
});

// Human review is recorded only in the approved release (named reviewer and date per record).
const release = JSON.parse(text.release).meta;
const reviewed = release.reviewedRecords;
const doc = {
  meta: {
    subject: "clp",
    paper: "Executive Programme, Syllabus 2022, Group 1, Paper 2 — Company Law & Practice (522)",
    generatedFrom: SRC,
    sourceSha256: Object.fromEntries(Object.entries(text).map(([k, v]) => [k, sha(v)])),
    extractionStage: raw.stage,
    status: {
      papers: "Official ICSI question papers; identity, syllabus, completeness and source authority recorded as verified in the paper manifest.",
      extraction: `All ${raw.questions.length} question parts extracted; every paper passes the automated structure and marks checks. Extraction status: ${[...new Set(raw.questions.map((q) => q.verification_status))].join(", ")} (not human-verified).`,
      classification:
        reviewed === cls.length
          ? `All ${cls.length} classifications reviewed (release ${release.release}). ${release.reviewBasis}`
          : `${reviewed} of ${cls.length} classifications reviewed; topic analytics are published only for fully reviewed attempts.`,
    },
    classificationRecords: cls.length,
    classificationHumanReviewed: reviewed,
    note: "No question text and no syllabus classification is exported. Question text stays in the official ICSI papers.",
  },
  papers,
};
const json = JSON.stringify(doc, null, 1) + "\n";
if (process.argv.includes("--check")) {
  const current = readFileSync(out, "utf8");
  if (current !== json) fail(`${out} is out of date; run node scripts/export-paper-inventory.mjs`);
  console.log("paper inventory is current");
} else {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, json);
  console.log(`exported ${papers.length} papers, ${papers.reduce((s, p) => s + p.totals.atomicParts, 0)} question parts -> ${out}`);
}
