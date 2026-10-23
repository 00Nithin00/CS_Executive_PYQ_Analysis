# Launch audit: CA + CMA + CS and Pro

Audit date: 2026-10-23 (Day 1). Branch: `launch/platform`, from `main` at `974c275`.
Method: I read the full source of `web/` (about 6.9k lines), ran every package script, fetched the live site and ran `npm audit`. I did not print secret values. `.env*` files are not in Git; only `.env.example` is tracked.

## 0. Baseline results (actual commands)

| Command | Result |
|---|---|
| `npm run typecheck` | Pass, exit 0 |
| `npm run lint` | Pass, no findings |
| `npm run validate:data` | Pass. Validates 114 **demo** records with 0 errors and 0 warnings |
| `npm run build` | First run: compiled all 45 pages, then Next.js exited 1 with a "known security vulnerability" notice. Retry: exit 0 |
| `npm audit --omit=dev` | **1 critical issue: `next` 16.0.0–16.4.0.** GHSA-2464-fhr4-w9xw (RCE in the image optimiser via SVG), GHSA-673q-mjm6-r5xr (RCE in `use cache`) and GHSA-p3m5-59mp-jv5r (Server Actions DoS). Fixed in 16.4.2 |
| Automated tests | **None exist.** The only check is `scripts/audit-security.mjs`, a black-box audit run by hand against a local build. It reads the JSON file store directly |
| Live site | `https://cs-executive-pyq-analysis.vercel.app`. Last deployment is about 16 days old and runs Next 16.4.0 (vulnerable) |

## 1. Functionality status

| Area | Status | Evidence |
|---|---|---|
| CS Executive official resource index (83 ICSI links) | **Implemented** | `content/official-resources.json` (links last checked 2026-10-07), `/resources`, `/resources/[section]` |
| CS paper finder (6 attempts × 7 papers + guideline answers) | **Implemented** | `/papers` |
| CS subject pages (7) with syllabus lessons and deletion status | **Implemented** | `content/subjects.ts`, `/subjects/[slug]` |
| CS PYQ explorer | **Mocked** | Only CLP has records. All 114 are synthetic (`isDemo: true`, `provenance: DEMO`). The other 6 subjects show "soon" |
| CS analytics (frequency, marks weight, repeats, priorities) | **Mocked** | Computed correctly by `lib/analytics/compute.ts`, but only from demo records. `05_Approved_Dataset/` is **empty** |
| CLP research dataset | **Partial** | 200 atomic questions have been extracted and classified (v0.1). `CLP_HUMAN_REVIEW_QUEUE_v0.1.md` says "classifications are NOT approved": 26 records are mandatory (priority A), 64 recommended (B) and 110 routine (C). No repeat status or analytics have been run |
| Sign-up, login, logout, sessions | **Implemented (local only)** | scrypt hashes, HS256 JWT in an httpOnly cookie, logout revokes all sessions via `sessionsRevokedAt`, open-redirect protection, per-account throttle |
| Account persistence | **Broken in production** | `USER_STORE=file` writes to `.data/store.json`. Vercel's filesystem is read-only and ephemeral, so sign-ups on the live site fail or vanish. The Postgres store throws "not implemented yet" |
| Login rate limiting | **Partial** | In-memory and per process. It doesn't work across serverless instances |
| Dashboard: bookmarks, progress, study plan | **Implemented (local only)** | Server actions check capabilities on the server. Depends on the file store |
| Admin: grant or revoke Pro | **Implemented (local only)** | `/dashboard/admin` and `scripts/admin.mjs` (file store) |
| Entitlements (plan → capabilities) | **Implemented** | `lib/entitlements/*`. Pure, server-side. **Not qualification-aware** |
| Pricing page | **Implemented, but out of date for launch** | Shows Pro as "To be announced" with a "Join the Pro waitlist" button linking to `/signup?plan=pro`. No real waitlist exists; the `plan` parameter is ignored |
| Payments | **Missing** | No provider code. The schema reserves `RAZORPAY` and `STRIPE` as subscription sources |
| CA qualification | **Missing** | No routes, data or navigation |
| CMA qualification | **Missing** | No routes, data or navigation |
| Qualification switching | **Missing** | The header, metadata and types are all CS Executive-specific (`SubjectSlug` is a hard-coded CS union) |
| Legal and support pages (terms, privacy, refunds, contact) | **Missing** | Razorpay needs all four before it activates live payments |
| Mock tests, AI assistant, advanced analytics | **Missing** (labelled "coming soon") | `FEATURES` in `lib/entitlements/capabilities.ts` |

## 2. Production architecture and how data is stored

- **Hosting:** Next.js 16.4.0 (App Router, Cache Components, PPR) on Vercel, deployed from GitHub `00Nithin00/CS_Executive_PYQ_Analysis`. There is no `vercel.json`; the Vercel CLI isn't installed here.
- **Content:** version-controlled JSON and TS in `web/content/` and `web/mock/`, bundled at build time. It's read-only at runtime, which is the right model for official link catalogues.
- **User data:** `lib/store/file-store.ts`. **On Vercel it does not persist.** The code comment and README both say this; I didn't create an account on the live site to prove it. Anything the product promises to save (accounts, bookmarks, progress, study plans, subscriptions) currently has nowhere durable to go in production.
- **Database:** `lib/db/schema.ts` is a Drizzle schema that has never been migrated or connected. It mixes account tables with research tables tied to CS. There are no migrations and no `DATABASE_URL` is configured.
- **Sessions:** stateless JWTs, revoked by a per-user timestamp. They expire after 30 days. Production throws if `AUTH_SECRET` is missing.

## 3. What content exists per qualification

| Qualification | Syllabus structure | Official resources | Question data | Analytics |
|---|---|---|---|---|
| CS Executive | 7 papers, Syllabus 2022 (as modified Dec 2025) | 83 links, verified 2026-10-07 | CLP: 200 extracted and classified, **not approved**. Other papers: none | None publishable |
| CA | None | None (research running on Day 1) | None | None |
| CMA | None | None (research running on Day 1) | None | None |

Within 7 days, CA and CMA can realistically launch as **official-source navigation**: levels, groups, papers, syllabus and official study material and paper links, with an honest label on each that question analysis isn't available yet. Classifying CA or CMA questions to the CS standard (extraction, taxonomy, classification, human review) isn't achievable in 7 days, so I won't claim it.

## 4. Pro payments and entitlements

- **No payment integration exists.** Pro can only be granted by an admin, with no expiry.
- **Product decisions (owner, 2026-10-23):** Razorpay; ₹320/month **per qualification**; temporary name "Atlas".
- **Required changes:** subscriptions and entitlements need a `qualification` dimension, so that CS Pro doesn't unlock CA. They also need provider IDs, webhook event storage for idempotency, and a lifecycle covering created, authenticated, active, pending, halted, cancelled, completed and expired, with refunds recorded.
- **Value problem (needs an owner decision):** every Pro analytics feature currently runs on demo data. Today, the only Pro features that work on real data are the study planner, progress tracking and bookmarks (bookmarks currently only point at demo questions). This applies to CS only; CA and CMA have none. Under the brief's own rule ("Do not enable payment for features that do not actually work"), live checkout should stay **off** for a qualification until it has Pro features that work on verified data. See B-10.

## 5. Security and data-integrity issues

| # | Severity | Issue |
|---|---|---|
| S1 | Critical | Next.js 16.4.0 is affected by two unauthenticated RCE advisories. Production is exposed now |
| S2 | Critical | Production accounts can't persist. Sign-ups are lost, and an attacker could rely on ephemeral state |
| S3 | High | The login throttle is in memory, so on serverless each instance has its own counter and it's easy to get around |
| S4 | Medium | There's no rate limit on sign-up, so account creation can be spammed |
| S5 | Medium | Session cookies last 30 days with no rotation. That's acceptable, but logout must keep revoking server-side once data moves to Postgres |
| S6 | Medium | The security audit isn't automated or run in CI |
| D1 | High | Demo analytics appear on public pages. They're labelled consistently; keep it that way and don't let paid features depend on them |
| D2 | Medium | The homepage preview policy allows DEMO provenance only. That's correct, but keep it checked when the verified data is connected |
| D3 | Low | `validate:data` only checks the demo set. There's no validation for resource catalogues (duplicates, dead links, provenance) |

Positives: capability checks are enforced on the server in the service layer and server actions; the RSC payload is checked for Pro-field leaks; redirects are validated; inputs are bounded; there's a cross-origin action check; and logout revokes all sessions.

## 6. Blockers

See `LAUNCH_BLOCKERS.md` for the prioritised list with owners, dependencies and acceptance criteria.

## 7. Seven-day schedule (Day 1 = Fri 2026-10-23, Day 7 = Thu 2026-10-29)

| Day | Engineering | You (external) |
|---|---|---|
| 1 | Audit. Next 16.4.2 patch. Postgres store, migrations and test harness. Start CA/CMA source research | Create Neon through Vercel Marketplace. Sign up for Razorpay and start KYC. Send support contact and business details for legal pages |
| 2 | Postgres in every code path, a DB-backed rate limiter, the security audit ported to Postgres, backup and rollback docs | Add `DATABASE_URL` to Vercel Preview and Production. Send Razorpay **test** keys |
| 3 | Qualification-aware model, CA and CMA journeys, qualification switcher, resource validation pipeline | Review the CA and CMA catalogues |
| 4 | Per-qualification entitlements. Razorpay subscriptions: checkout, verification, webhooks, idempotency | CLP human review (priority A), if you want CS analytics live at launch |
| 5 | Payment lifecycle tests in sandbox, billing disclosures, legal pages, account and billing page | Razorpay live activation (depends on KYC) |
| 6 | Feature freeze, preview deploy, full regression on desktop and mobile, security audit, persistence tests | Approve the release candidate |
| 7 | Neon backup branch, migrations, production deploy, smoke tests, a controlled live payment (if Razorpay is live), monitoring | Final go/no-go |

**Realistic outcome by Day 7:** a secure platform with persistent accounts, working CA, CMA and CS resource journeys, and a Pro subscription tested end to end in Razorpay test mode. Two things I can't do and won't fake: a **paid live launch** depends on Razorpay live approval (B-08), and **launching Pro analytics on real data** depends on human review of the CLP dataset (B-10).
