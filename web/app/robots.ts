import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/dashboard/", "/login", "/signup"] }],
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
