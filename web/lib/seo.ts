import type { Metadata } from "next";
import { SITE } from "@/lib/config/site";

/** Absolute URL on the public host. Metadata URLs are emitted absolute so no render path depends on metadataBase resolution. */
export const absoluteUrl = (path: string) => `${SITE.url}${path === "/" ? "" : path}`;

const OG_IMAGE = { url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` };

/**
 * Per-page metadata with matching Open Graph fields (child pages otherwise inherit the home page's
 * og:title/description) and a canonical URL. `index: false` keeps a public page out of search
 * results — used for pages whose content is demonstration data or still in preparation.
 */
export function pageMetadata({ title, description, path, index = true }: { title: string; description: string; path: string; index?: boolean }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    // Setting openGraph here replaces the inherited one, so the brand card (app/opengraph-image.tsx) is re-attached.
    openGraph: { title: `${title} · ${SITE.name}`, description, url: absoluteUrl(path), siteName: SITE.fullName, type: "website", locale: "en_IN", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [OG_IMAGE.url] },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
