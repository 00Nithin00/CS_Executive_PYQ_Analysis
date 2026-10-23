// Placeholder product name. Change PRODUCT_NAME only; every visible use derives from SITE.
const PRODUCT_NAME = "Atlas";

const DESCRIPTOR = "CA · CMA · CS";

export const SITE = {
  name: PRODUCT_NAME,
  /** Shown under the name in logo lockups. */
  descriptor: DESCRIPTOR,
  fullName: `${PRODUCT_NAME} — CA, CMA & CS preparation`,
  tagline: "Prepare with evidence, not guesswork.",
  description:
    "Official CA, CMA and CS resources in one place, organised by level and paper — plus structured CS Executive question history, organised by syllabus, chapter, topic and concept.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** `match`: extra path prefixes that mark the item active (CS Executive owns the original CS routes). */
export const PRIMARY_NAV: readonly { href: string; label: string; match?: readonly string[] }[] = [
  { href: "/cs", label: "CS Executive", match: ["/subjects", "/papers", "/resources"] },
  { href: "/ca", label: "CA" },
  { href: "/cma", label: "CMA" },
  { href: "/pyq", label: "PYQ Intelligence" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export const isNavActive = (item: (typeof PRIMARY_NAV)[number], pathname: string) =>
  [item.href, ...(item.match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));

export const RESOURCE_SECTIONS = [
  { slug: "study-material", type: "STUDY_MATERIAL", label: "Study Material", blurb: "Current ICSI study material for each paper." },
  { slug: "previous-papers", type: "QUESTION_PAPER", label: "Previous Papers", blurb: "Official question papers from every Syllabus 2022 attempt." },
  { slug: "guideline-answers", type: "GUIDELINE_ANSWER", label: "Guideline Answers", blurb: "ICSI's suggested answers, by group and attempt." },
  { slug: "supplements", type: "SUPPLEMENT", label: "Supplements", blurb: "Amendments to read alongside the study material." },
  { slug: "syllabus", type: "SYLLABUS", label: "Syllabus & Notices", blurb: "Syllabus 2022 and the notices that change what is examined." },
] as const;

export type ResourceSectionSlug = (typeof RESOURCE_SECTIONS)[number]["slug"];
