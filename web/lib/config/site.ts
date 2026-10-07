// Placeholder product name. Change PRODUCT_NAME only; every visible use derives from SITE.
const PRODUCT_NAME = "Atlas";

const DESCRIPTOR = "CS Executive";

export const SITE = {
  name: PRODUCT_NAME,
  /** Shown under the name in logo lockups. */
  descriptor: DESCRIPTOR,
  fullName: `${PRODUCT_NAME} — CS Executive Intelligence`,
  tagline: "Prepare with evidence, not guesswork.",
  description:
    "Official ICSI CS Executive resources and structured historical examination intelligence — organised by syllabus, chapter, topic and concept.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const PRIMARY_NAV = [
  { href: "/subjects", label: "Subjects" },
  { href: "/pyq", label: "PYQ Intelligence" },
  { href: "/resources", label: "Resources" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
] as const;

export const RESOURCE_SECTIONS = [
  { slug: "study-material", type: "STUDY_MATERIAL", label: "Study Material", blurb: "Current ICSI study material for each paper." },
  { slug: "previous-papers", type: "QUESTION_PAPER", label: "Previous Papers", blurb: "Official question papers from every Syllabus 2022 attempt." },
  { slug: "guideline-answers", type: "GUIDELINE_ANSWER", label: "Guideline Answers", blurb: "ICSI's suggested answers, by group and attempt." },
  { slug: "supplements", type: "SUPPLEMENT", label: "Supplements", blurb: "Amendments to read alongside the study material." },
  { slug: "syllabus", type: "SYLLABUS", label: "Syllabus & Notices", blurb: "Syllabus 2022 and the notices that change what is examined." },
] as const;

export type ResourceSectionSlug = (typeof RESOURCE_SECTIONS)[number]["slug"];
