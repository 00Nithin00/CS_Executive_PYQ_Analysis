# Website v1 — adversarial audit & hardening

**Date:** 2026-10-07 · **Scope:** `web/` (Next.js app), first version · **Result:** `READY_TO_FREEZE`
**Not changed:** frozen CLP taxonomy v0.2; methodology v0.3; no new features, no UI redesign, no PostgreSQL / payments / real dataset.

## Test evidence (final run, production build)

| Suite | Tool | Result |
|---|---|---|
| Entitlement / auth / admin security | `web/scripts/audit-security.mjs` | **83/83 pass** (baseline before fixes: 68/71, plus issues found by code review) |
| Demo dataset integrity | `web/scripts/validate-dataset.mjs` | **114/114 records, 0 errors, 0 warnings**; validator mutation-tested (8/8 corruptions caught) |
| Responsive / a11y regression | headless Chrome, 16 routes × 6 widths | **96 combos: 0 overflow, 0 console errors, 0 unnamed controls, 0 low-contrast informative text** |
| Keyboard / focus / reduced motion | headless Chrome | **11/11 pass** |
| Wording & metadata scan | headless Chrome, 15 page states | **0 banned claims; every demo-number surface disclosed** |
| Real-browser flows | headless Chrome | signup validation, signup → Free, logout, wrong password, `next` redirect, Pro bookmark, progress, admin grant/revoke messages — all correct |
| Static checks | `tsc`, `eslint`, `next build` | clean |

## Findings and fixes

| Sev. | Finding | Fix |
|---|---|---|
| High | Homepage "marks by chapter" read analytics straight from the provider, bypassing entitlements. With real data it would have published Pro marks-weight analysis to everyone. | Provider no longer exported. Homepage uses `getPublicChapterPreview()` under `lib/config/public-preview.ts` (DEMO only by default; verified data is hidden unless the policy is changed). |
| High | Demo analytics were titled "Historical intelligence", "Historical topic coverage", "Most recurring concepts", "Priority topics". | Shared disclosure + provenance-aware copy (`lib/config/disclosure.ts`): "Sample PYQ analysis", "Example priorities", "(sample)" titles. Full disclosure on every demo surface; priority explanations prefixed "In the demonstration data…". |
| High | Analytics counted every record regardless of verification status or choice alternatives (methodology §8, §10). | Engine accepts only the provider's accepted status (APPROVED / DEMO) and attempts inside the window. Alternatives add no marks. Excluded counts are reported. |
| Medium | Open redirect through `next`: `/\evil.com`, `/..//evil.com`. | `lib/auth/redirect.ts` (origin check + post-normalisation re-check), used by the login/signup actions and the form. |
| Medium | Logout only deleted the cookie; previously issued tokens stayed valid for 30 days. | Per-user `sessionsRevokedAt`; tokens issued before logout are rejected (schema column added). |
| Medium | No brute-force protection on login. | Per-account throttle: 10 failures in 15 min locks that account temporarily (in-memory, single process). |
| Medium | UI hard-coded 6 attempts (coverage grid columns, `ATTEMPTS` constant). | Window taken from the analytics envelope; grid columns are dynamic. |
| Medium | Deleted chapters/concepts appeared unmarked in marks and recurring lists. | Chapters flagged "(removed Dec 2025)" and muted. The recurring list shows current-syllabus concepts only. |
| Medium | Demo PYQ pages were indexable and in the sitemap; Open Graph titles inherited the home page on every page. | `/pyq*` is `noindex` until a subject is AVAILABLE and excluded from the sitemap. `lib/seo.ts` sets per-page OG/Twitter/canonical; home canonical added. |
| Medium | Mobile menu and filter sheet had no focus trap. | `useFocusTrap`. Escape and focus return verified. |
| Medium | Admin grant/revoke gave no result and allowed stacked grants. | `useActionState` results ("Pro granted…", "already has Pro", "User not found", "Invalid user id"). UUID and existence validation; no duplicate grants. CLI validates email. |
| Low | Server actions accepted unknown question/chapter IDs and arbitrary attempts. | Validated against the provider/taxonomy (current chapters only; plannable attempts only). |
| Low | No password/name length limits (scrypt work unbounded). | Limits: name 80, email 254, password 8–128. |
| Low | Informative text in `ink-4` (2.5:1). | Moved to `ink-3` (4.8:1). |
| Low | 72 coverage cells were tab stops; bar rows had no visible focus ring. | Cells not focusable (table view is the alternative); bar rows show a focus ring. |
| Low | Secure cookie blocks testing the prod build on a phone over LAN http. | `COOKIE_SECURE=false` override (documented; never for deployment). |
| Low | Analytics recomputed per request. | Memoised per subject in the mock provider. |
| Low | Placeholder name duplicated (`fullName`). | Single `PRODUCT_NAME` constant. |
| Low | Hero specimen could read as a real finding. | Caption: "Illustrative example of the layout — not a real ICSI question or finding." |
| Low (not changed) | Animation runtime ≈ 42 KB gz on every page (home JS ≈ 209 KB gz total). | Recommend lazy-loading `domAnimation` later; not premature now. |
| Low (not changed) | File store and login throttle are per-process. | Known; Postgres store needed for multi-instance / Vercel. |

**No issue found:** Pro fields in anonymous/Free HTML or RSC payloads (none, including spoofed query params); forged, expired, alg-none, tampered and ghost-user tokens; CSRF on server actions (cross-origin rejected); admin route and admin actions (server-side); revoke takes effect on the next request; no question data or secrets in client bundles; dashboard, login and signup are `noindex`.

## Methodology (v0.3) compliance of `lib/analytics/compute.ts`

Compliant after fixes:
- atomic records;
- canonical-topic aggregation;
- holding/alias nodes excluded;
- deleted content kept for history but excluded from priority;
- marks weight compulsory-only;
- coverage, recency, streaks and repeat clusters as defined in §8;
- priority points and labels exactly as §9.2–9.3;
- no probabilities.

No methodology change was made. Two clarifications are suggested for the next methodology revision:
1. §9.2 does not say which topics form the "marks rank within subject" population. The implementation ranks current-eligible topics that appeared at least once.
2. Repeat status is a record field produced by the research pipeline (§7). The demo generator's exact/conceptual split is synthetic and ignores the "law changed" rule. That is demo-only.

## Architecture

Every UI module gets data from `lib/data/service.ts`. The service uses the `DataProvider` interface, and analytics are computed from question records. No component imports `mock/`. Replacing the demo set therefore needs four things:
- a provider that reads the approved `web_export` with provenance `VERIFIED`;
- accepted status `["APPROVED"]`;
- the subject's `intelligenceStatus` set to `AVAILABLE`;
- a pass of `validate-dataset.mjs --real`.

No UI or analytics rewrite is required.
