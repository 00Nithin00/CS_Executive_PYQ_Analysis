// Qualification content import pipeline (CA / CMA). Reads a research catalogue, validates it, traces the provenance
// of every document link to an official page, and writes the publishable catalogue plus a machine-readable report.
//
//   node scripts/import-qualification.mjs ca  [--offline]
//   node scripts/import-qualification.mjs cma [--offline]
//
// Input:  ../research/<q>/<q>_catalogue.json          (raw research output, provenance per record)
//         content/<q>/overrides.json  (optional)      (human-entered facts with their official citation, e.g. CMA marks)
// Output: content/<q>/catalogue.json                  (only PUBLISHABLE resources; consumed by the app)
//         content/<q>/catalogue.validation.json       (every check, every excluded record and why)
//
// A resource is PUBLISHABLE only if: schema-valid, unique, on an allowed official host, and — when the document
// itself is not on the body's own domain — its exact URL is linked from an official page of the body (traced).
// --offline skips network tracing and marks such resources UNTRACED (excluded). Never fabricates anything.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const q = process.argv[2];
const OFFLINE = process.argv.includes("--offline");
const RULES = {
  ca: {
    name: "CA",
    body: "The Institute of Chartered Accountants of India",
    officialPageHosts: ["icai.org", "www.icai.org", "boslive.icai.org"],
    documentHosts: ["icai.org", "www.icai.org", "boslive.icai.org", "resource.cdn.icai.org"],
    // Documents on these hosts are the body's own domain: provenance = the host itself.
    ownDomain: (h) => h === "icai.org" || h.endsWith(".icai.org"),
  },
  cma: {
    name: "CMA",
    body: "The Institute of Cost Accountants of India",
    officialPageHosts: ["icmai.in", "www.icmai.in"],
    documentHosts: ["icmai.in", "www.icmai.in", "dwpivt501gtb6.cloudfront.net"],
    ownDomain: (h) => h === "icmai.in" || h.endsWith(".icmai.in"),
  },
};
const rule = RULES[q];
if (!rule) {
  console.error("Usage: node scripts/import-qualification.mjs <ca|cma> [--offline]");
  process.exit(1);
}

const root = new URL("../", import.meta.url);
const src = new URL(`../research/${q}/${q}_catalogue.json`, root);
const outDir = new URL(`content/${q}/`, root);
const raw = JSON.parse(readFileSync(src, "utf8"));
const overridesPath = new URL("overrides.json", outDir);
const overrides = existsSync(overridesPath) ? JSON.parse(readFileSync(overridesPath, "utf8")) : { papers: {}, levels: {} };

const TYPES = new Set(["SYLLABUS", "STUDY_MATERIAL", "QUESTION_PAPER", "SUGGESTED_ANSWER", "RTP", "MTP", "NOTICE"]);
const LEVELS = new Set(["foundation", "intermediate", "final"]);
const ATTEMPT_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const report = { qualification: rule.name, source: `research/${q}/${q}_catalogue.json`, sourceSha256: createHash("sha256").update(readFileSync(src)).digest("hex"), importedAt: new Date().toISOString(), offline: OFFLINE, checks: [], excluded: [], counts: {} };
const check = (name, ok, detail) => report.checks.push({ name, ok, ...(detail ? { detail } : {}) });

// ---------------------------------------------------------------- papers / levels (with cited overrides)
const papers = raw.papers.map((p) => {
  const o = overrides.papers?.[p.id] ?? {};
  for (const k of Object.keys(o)) if (k !== "citation" && !o.citation) throw new Error(`Override for ${p.id} has no citation`);
  return { ...p, ...Object.fromEntries(Object.entries(o).filter(([k]) => k !== "citation")), ...(o.citation ? { factsCitation: o.citation } : {}) };
});
const paperIds = new Set(papers.map((p) => p.id));
check("paper ids unique", paperIds.size === papers.length);
check("every paper has a level", papers.every((p) => LEVELS.has(p.levelId)), papers.filter((p) => !LEVELS.has(p.levelId)).map((p) => p.id));
check("every paper has an official sourceUrl", papers.every((p) => rule.officialPageHosts.includes(new URL(p.sourceUrl).host) || rule.ownDomain(new URL(p.sourceUrl).host)));
const levels = raw.levels.map((l) => ({ ...l, ...(overrides.levels?.[l.id] ?? {}) }));
for (const l of levels) for (const g of l.groups ?? []) for (const id of g.paperIds) if (!paperIds.has(id)) throw new Error(`Group ${l.id}/${g.id} references unknown paper ${id}`);

// ---------------------------------------------------------------- resources: schema + duplicates
const seenIds = new Set();
const seenUrls = new Map();
const candidates = [];
for (const r of raw.resources) {
  const problems = [];
  if (!r.id || seenIds.has(r.id)) problems.push("missing or duplicate id");
  if (!TYPES.has(r.resourceType)) problems.push(`unknown type ${r.resourceType}`);
  if (!LEVELS.has(r.levelId)) problems.push(`unknown level ${r.levelId}`);
  if (r.paperId && !paperIds.has(r.paperId)) problems.push(`unknown paper ${r.paperId}`);
  if (r.attempt && !ATTEMPT_RE.test(r.attempt)) problems.push(`bad attempt ${r.attempt}`);
  if (!r.title?.trim()) problems.push("missing title");
  let docHost, pageHost;
  try {
    docHost = new URL(r.officialUrl).host;
    pageHost = new URL(r.sourcePage).host;
    if (new URL(r.officialUrl).protocol !== "https:") problems.push("document not https");
  } catch {
    problems.push("invalid URL");
  }
  if (docHost && !rule.documentHosts.includes(docHost)) problems.push(`document host not allowed: ${docHost}`);
  if (pageHost && !rule.officialPageHosts.includes(pageHost)) problems.push(`source page host not official: ${pageHost}`);
  if (!(r.http && [200, 206].includes(r.http.status))) problems.push(`research HTTP check not OK (${r.http?.status})`);
  // The same official document may legitimately appear under several levels (e.g. the full syllabus).
  const key = r.officialUrl && `${r.levelId}|${decodeURI(r.officialUrl)}`;
  if (key && seenUrls.has(key)) problems.push(`duplicate document URL (also ${seenUrls.get(key)})`);
  seenIds.add(r.id);
  if (key) seenUrls.set(key, r.id);
  if (problems.length) report.excluded.push({ id: r.id, reason: problems.join("; ") });
  else candidates.push(r);
}

// ---------------------------------------------------------------- provenance tracing
const norm = (u) => {
  try {
    const x = new URL(u);
    return `${x.host}${decodeURIComponent(x.pathname)}`.toLowerCase();
  } catch {
    return null;
  }
};
const pageCache = new Map();
async function linksOn(pageUrl) {
  if (!pageCache.has(pageUrl)) {
    pageCache.set(
      pageUrl,
      (async () => {
        // Official sites can be intermittent: retry with backoff; a page that stays unreachable excludes its documents.
        let res, lastErr;
        for (let attempt = 1; attempt <= 3 && !res; attempt++) {
          try {
            const r = await fetch(pageUrl, { redirect: "follow", signal: AbortSignal.timeout(30_000), headers: { "user-agent": "Mozilla/5.0 (provenance check)" } });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            res = r;
          } catch (e) {
            lastErr = e;
            if (attempt < 3) await new Promise((ok) => setTimeout(ok, 5_000 * attempt));
          }
        }
        if (!res) throw lastErr;
        const html = await res.text();
        const out = new Set();
        for (const m of html.matchAll(/(?:href|src|data-url|data-href)\s*=\s*["']([^"']+)["']/gi)) {
          const n = norm(new URL(m[1].trim().replace(/&amp;/g, "&"), res.url).href);
          if (n) out.add(n);
        }
        // Some pages build links in scripts; also index absolute URLs appearing anywhere in the HTML.
        for (const m of html.matchAll(/https?:\/\/[^\s"'<>()]+/gi)) {
          const n = norm(m[0].replace(/&amp;/g, "&"));
          if (n) out.add(n);
        }
        return out;
      })(),
    );
  }
  return pageCache.get(pageUrl);
}

const applicability = (notes) => /^\(((?:applicable|relevant)\b[^)]*)\)/i.exec(notes?.trim() ?? "")?.[1] ?? null;

const published = [];
for (const r of candidates) {
  const host = new URL(r.officialUrl).host;
  let provenance;
  if (rule.ownDomain(host)) provenance = { method: "OFFICIAL_DOMAIN", sourcePage: r.sourcePage };
  else if (OFFLINE) {
    report.excluded.push({ id: r.id, reason: "UNTRACED (offline run): document is not on the official domain" });
    continue;
  } else {
    try {
      const links = await linksOn(r.sourcePage);
      if (links.has(norm(r.officialUrl))) provenance = { method: "LINKED_FROM_OFFICIAL_PAGE", sourcePage: r.sourcePage, tracedAt: new Date().toISOString() };
      else {
        report.excluded.push({ id: r.id, reason: `UNTRACED: ${r.sourcePage} does not link this exact document` });
        continue;
      }
    } catch (e) {
      report.excluded.push({ id: r.id, reason: `UNTRACED: could not read ${r.sourcePage} (${e.message})` });
      continue;
    }
  }
  published.push({
    id: r.id,
    title: r.title,
    resourceType: r.resourceType,
    levelId: r.levelId,
    paperId: r.paperId ?? null,
    attempt: r.attempt ?? null,
    officialUrl: r.officialUrl,
    sourcePage: r.sourcePage,
    lastVerified: r.http.checkedAt,
    provenance,
    // Edition applicability exactly as the official page states it, e.g. "(Applicable for May 2026 Exam Onwards)".
    ...(applicability(r.notes) ? { applicability: applicability(r.notes) } : {}),
    ...(r.notes ? { notes: r.notes } : {}),
  });
}

// ---------------------------------------------------------------- outputs
const byType = {};
for (const r of published) byType[r.resourceType] = (byType[r.resourceType] ?? 0) + 1;
report.counts = { papers: papers.length, researchResources: raw.resources.length, published: published.length, excluded: report.excluded.length, publishedByType: byType, researchUnverified: raw.unverified?.length ?? 0 };
report.unverifiedFromResearch = raw.unverified ?? [];
check("every published resource has provenance", published.every((r) => r.provenance));
check("no excluded record is published", !published.some((r) => report.excluded.some((x) => x.id === r.id)));
report.ok = report.checks.every((c) => c.ok);

mkdirSync(outDir, { recursive: true });
const catalogue = {
  qualification: rule.name,
  body: raw.body,
  schemes: raw.schemes,
  levels,
  papers,
  resources: published,
  meta: { importedAt: report.importedAt, sourceSha256: report.sourceSha256, publishedCount: published.length, excludedCount: report.excluded.length },
};
writeFileSync(new URL("catalogue.json", outDir), JSON.stringify(catalogue, null, 1) + "\n");
writeFileSync(new URL("catalogue.validation.json", outDir), JSON.stringify(report, null, 1) + "\n");
console.log(JSON.stringify({ ok: report.ok, ...report.counts }, null, 1));
const reasons = {};
for (const x of report.excluded) {
  const k = x.reason.replace(/\(also .*\)|: .*$/, "").slice(0, 70);
  reasons[k] = (reasons[k] ?? 0) + 1;
}
console.log("excluded by reason:", reasons);
process.exit(report.ok ? 0 : 1);
