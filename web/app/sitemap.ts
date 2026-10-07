import type { MetadataRoute } from "next";
import { SUBJECTS } from "@/content/subjects";
import { RESOURCE_SECTIONS, SITE } from "@/lib/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const paths = [
    "",
    "/subjects",
    "/papers",
    "/resources",
    "/pricing",
    "/about",
    ...SUBJECTS.map((s) => `/subjects/${s.slug}`),
    // PYQ pages are listed only once a subject's dataset is verified (they are noindex until then).
    ...SUBJECTS.filter((s) => s.intelligenceStatus === "AVAILABLE").map((s) => `/pyq/${s.slug}`),
    ...RESOURCE_SECTIONS.map((r) => `/resources/${r.slug}`),
  ];
  return paths.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly", priority: p === "" ? 1 : p.startsWith("/subjects") ? 0.8 : 0.6 }));
}
