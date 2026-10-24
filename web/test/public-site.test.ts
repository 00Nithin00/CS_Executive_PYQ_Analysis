// Public launch invariants: canonical host, sitemap/robots scope, policy pages, demo labelling and honest copy.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("plan=pro"), redirect: () => undefined, notFound: () => undefined }));
vi.mock("@/lib/auth/actions", () => ({ loginAction: async () => ({}), signupAction: async () => ({}) }));

import ContactPage from "@/app/(site)/contact/page";
import PrivacyPage from "@/app/(site)/privacy/page";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import TermsPage from "@/app/(site)/terms/page";
import { PriorityBadge, PriorityList } from "@/components/analytics/priority-list";
import { AuthForm } from "@/components/auth/auth-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { PLAN_PRESENTATION } from "@/lib/config/pricing";
import { LEGAL_LINKS, PRIMARY_NAV, SITE, SUPPORT, siteUrl } from "@/lib/config/site";
import { FEATURES } from "@/lib/entitlements/capabilities";
import { mockProvider } from "@/lib/data/mock-provider";

const WEB = fileURLToPath(new URL("..", import.meta.url));
const src = (f: string) => readFileSync(resolve(WEB, f), "utf8");
const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

describe("canonical host", () => {
  it("never falls back to localhost on a Vercel build", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.org/" })).toBe("https://example.org");
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "cs-executive-pyq-analysis.vercel.app" })).toBe("https://cs-executive-pyq-analysis.vercel.app");
    expect(siteUrl({ NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "a.vercel.app", VERCEL_PROJECT_PRODUCTION_URL: "b.vercel.app" })).toBe("https://a.vercel.app");
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.org", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe("https://example.org");
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe("https://x.vercel.app");
    expect(siteUrl({})).toBe("http://localhost:3000");
  });
});

describe("sitemap and robots", () => {
  const paths = sitemap().map((e) => new URL(e.url).pathname);

  it("lists the policy pages and only public, indexable routes", () => {
    for (const p of ["/privacy", "/terms", "/contact", "/about", "/pricing", "/subjects/clp", "/resources/previous-papers", "/cs", "/ca", "/cma"]) expect(paths).toContain(p);
    for (const p of paths) expect(p, p).not.toMatch(/^\/(login|signup|dashboard|preview|pyq)(\/|$)/);
    expect(new Set(paths).size).toBe(paths.length);
    for (const e of sitemap()) expect(e.url.startsWith(SITE.url)).toBe(true);
  });

  it("keeps account pages out of crawling and points at the sitemap", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule.disallow).toEqual(expect.arrayContaining(["/dashboard", "/login", "/signup"]));
    expect(r.sitemap).toBe(`${SITE.url}/sitemap.xml`);
  });
});

describe("policy pages", () => {
  it("are linked from the footer and the sign-up form", () => {
    const footer = html(createElement(SiteFooter));
    for (const l of LEGAL_LINKS) expect(footer).toContain(`href="${l.href}"`);
    const signup = html(createElement(AuthForm, { mode: "signup" }));
    expect(signup).toContain('href="/terms"');
    expect(signup).toContain('href="/privacy"');
    expect(signup).toContain('for="f-email"'); // labels are associated with their inputs
    expect(signup).toContain('autoComplete="new-password"');
  });

  it("describe what the code actually stores, without an invented contact address", () => {
    const privacy = html(createElement(PrivacyPage));
    expect(privacy).toContain(SESSION_COOKIE);
    expect(privacy).toContain("scrypt");
    expect(privacy).toContain("IP address");
    const all = [privacy, html(createElement(TermsPage)), html(createElement(ContactPage))].join("\n");
    if (!SUPPORT.email) {
      expect(all).not.toMatch(/mailto:/);
      expect(all).toContain("support email address has not been published yet");
    }
    expect(all).not.toMatch(/GDPR|DPDP|ISO 27001|SOC ?2|end-to-end encrypt|we never sell/i); // no unsupported compliance claims
  });
});

describe("demonstration data is never presented as findings", () => {
  it("qualifies demo and candidate priority labels in the label text itself", () => {
    expect(html(createElement(PriorityBadge, { label: "HIGH", provenance: "DEMO" }))).toContain("Example: high priority");
    expect(html(createElement(PriorityBadge, { label: "HIGH", provenance: "CANDIDATE" }))).toContain("Unverified: high priority");
    expect(html(createElement(PriorityBadge, { label: "HIGH" }))).toContain("High priority");
  });

  it("the demo priority list carries its disclosure", async () => {
    const a = (await mockProvider.getAnalytics("clp"))!;
    expect(a.provenance).toBe("DEMO");
    const out = html(createElement(PriorityList, { entries: a.priority.slice(0, 3), provenance: a.provenance }));
    expect(out).toContain("synthetic demonstration questions");
    expect(out).not.toMatch(/>(High|Medium|Low) priority</);
  });

  it("pricing marks analysis features as demo-only and offers no fake waitlist", () => {
    for (const c of ["PYQ_ANALYTICS", "TOPIC_FREQUENCY", "MARKS_ANALYSIS", "REPEAT_ANALYSIS", "PRIORITY_TOPICS"] as const) expect(FEATURES[c].availability).toBe("DEMO_DATA_ONLY");
    for (const p of PLAN_PRESENTATION) expect(p.cta.label.toLowerCase()).not.toContain("waitlist");
    expect(PLAN_PRESENTATION.find((p) => p.id === "PRO")!.price).toBeNull();
  });

  it("keeps PYQ demo out of the primary navigation", () => {
    expect(PRIMARY_NAV.map((n) => n.href)).not.toContain("/pyq");
  });

  it("public copy states the real verification status and the current taxonomy", () => {
    const about = src("app/(site)/about/page.tsx");
    expect(about).toContain("frozen at version 0.3");
    expect(about).not.toMatch(/version 0\.2/);
    expect(about).toContain("no record has yet been reviewed and approved by a person");
    const home = src("components/home/sections.tsx") + src("components/home/hero.tsx");
    expect(home).not.toContain("Nothing is shown that can't be traced");
    expect(home).not.toMatch(/are checked by a person before release\./);
    expect(src("content/taxonomy/clp.json")).toContain('"taxonomyVersion": "0.3"');
  });
});
