// Published CA / CMA content invariants. These guard against shipping an untraced, broken or fabricated record.
import { describe, expect, it } from "vitest";
import { getCatalogue, paperCoverage, papersOf, paperSlug, RESOURCE_QUALIFICATIONS } from "@/lib/qualifications/catalogue";

const HOSTS = {
  ca: ["icai.org", "www.icai.org", "boslive.icai.org", "resource.cdn.icai.org"],
  cma: ["icmai.in", "www.icmai.in", "dwpivt501gtb6.cloudfront.net"],
} as const;
const OFFICIAL_PAGES = { ca: /(^|\.)icai\.org$/, cma: /(^|\.)icmai\.in$/ } as const;

describe.each(RESOURCE_QUALIFICATIONS)("%s catalogue", (q) => {
  const c = getCatalogue(q);

  it("has levels, papers and resources", () => {
    expect(c.levels.map((l) => l.id)).toEqual(["foundation", "intermediate", "final"]);
    expect(c.papers.length).toBeGreaterThan(10);
    expect(c.resources.length).toBeGreaterThan(100);
  });

  it("every resource is https, on an allowed official host, listed on an official page, with provenance", () => {
    for (const r of c.resources) {
      const u = new URL(r.officialUrl);
      expect(u.protocol, r.id).toBe("https:");
      expect(HOSTS[q] as readonly string[], r.id).toContain(u.host);
      expect(OFFICIAL_PAGES[q].test(new URL(r.sourcePage).host), r.id).toBe(true);
      expect(["OFFICIAL_DOMAIN", "LINKED_FROM_OFFICIAL_PAGE"], r.id).toContain(r.provenance?.method);
      if (!OFFICIAL_PAGES[q].test(u.host) && !u.host.endsWith(".icai.org")) expect(r.provenance.method, r.id).toBe("LINKED_FROM_OFFICIAL_PAGE");
    }
  });

  it("ids are unique and every reference resolves", () => {
    const ids = c.resources.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const paperIds = new Set(c.papers.map((p) => p.id));
    for (const r of c.resources) if (r.paperId) expect(paperIds.has(r.paperId), r.id).toBe(true);
    for (const l of c.levels) for (const g of l.groups) for (const id of g.paperIds) expect(paperIds.has(id), `${l.id}/${g.id}`).toBe(true);
    for (const r of c.resources) if (r.attempt) expect(r.attempt).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
  });

  it("paper URL slugs are unique within each level", () => {
    for (const l of c.levels) {
      const slugs = papersOf(q, l.id).map(paperSlug);
      expect(new Set(slugs).size, l.id).toBe(slugs.length);
    }
  });

  it("marks shown are only those with an official basis", () => {
    for (const p of c.papers) {
      if (p.marks === null) continue;
      expect(p.marks, p.id).toBe(100);
      // CMA marks were entered by hand from the syllabus, so each must carry its citation.
      if (q === "cma") expect(p.factsCitation?.url, p.id).toMatch(/^https:\/\//);
    }
  });

  it("coverage rows are derived from records (no empty rows)", () => {
    for (const p of c.papers) for (const row of paperCoverage(q, p)) expect(row.paper || row.answers, `${p.id} ${row.attempt}`).toBeTruthy();
  });
});

it("CMA publishes no suggested answers (ICMAI provides them only behind a student login)", () => {
  expect(getCatalogue("cma").resources.filter((r) => r.resourceType === "SUGGESTED_ANSWER")).toHaveLength(0);
});
