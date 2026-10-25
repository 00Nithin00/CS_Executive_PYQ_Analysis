# Release readiness: pricing, real data and launch checks

| Item | Value |
|---|---|
| Date | 2026-10-24 |
| Branch | `launch/preview-test` (HEAD `603ffd5`, unchanged). Nothing staged, committed, pushed or deployed. `launch/platform` was not checked out or touched |
| Databases / env | Not touched (no migration, no Production or Preview database access, no environment variables changed) |
| Pre-existing work | The 52 uncommitted research entries at the start (`.gitignore`, `01_Source_Papers/manifest.csv`, `SOURCE_REGISTRY.md`, untracked research folders and scripts) were left as they were |

## 1. Pricing: ₹349 per user per month

**Single source of truth.** `web/lib/config/pro-price.ts` sets `PRO_PRICE = { amountPaise: 34900, currency: "INR", interval: "monthly", unit: "user" }` and exports `PRO_PRICE_LABEL` ("₹349 per user per month").
- **Billing:** `web/lib/billing/config.ts` now re-exports this value. It previously had its own `32000` (₹320 per month, per qualification).
- **Pricing cards:** `web/lib/config/pricing.ts` takes the Pro amount from it.

**Where the price shows:**
- the pricing card ("₹349 per user per month")
- the pricing page header, metadata and FAQ
- the homepage closing call-to-action

The "To be announced" placeholder and the "no price has been set" note are gone. A test fails if `To be announced`, `₹320` or `32000` paise reappears in the website source.

**Not purchasable.** Every plan carries `purchasable: false`, and the copy states that Pro is "not yet available to buy: checkout is not open and no payment can be made on this site".
- No UI calls the checkout server actions.
- `startCheckoutAction` stays blocked unless Razorpay keys, a plan ID and an enabled qualification are all configured (`checkoutBlock` returns `NOT_CONFIGURED` without them). This is tested.
- The Privacy and Terms statements ("Paid plans are not open… no payment details collected") remain accurate.

**Owner decision needed: "per user" vs "per qualification".** The billing backend and entitlements sell Pro **per qualification**: a CS subscription never unlocks CA or CMA (`lib/entitlements/resolve.ts`, `subscriptions.qualification`).
- The public copy now says "per user per month", as instructed.
- Before checkout opens, decide whether ₹349 covers one qualification or all three, and align the backend and the copy.
- The Razorpay plan amounts must also be created at 34900 paise.
- `LAUNCH_BLOCKERS.md` (B-11 "₹320/month", decisions log) still records ₹320. It was not edited because it is a research/planning record. Update it when you confirm.

## 2. Inventory of the question-paper evidence (from the repository)

| Layer | Evidence | Count / status |
|---|---|---|
| Official question papers | `01_Source_Papers/CLP_PAPER_MANIFEST.csv`, `04_Verification/CLP_SOURCE_VERIFICATION.md` (Phase 2A, 2026-10-08), raw ICSI archive API responses in `04_Verification/clp_source_evidence/` | **6** Paper 522 papers, December 2023 – June 2026, all from the ICSI previous-sessions archive. Identity, syllabus, completeness and source authority recorded YES for all 6. These flags come from the project's acquisition and verification pipeline, not from a named human reviewer |
| Guideline answers | `SOURCE_REGISTRY.md` §5 (Group 1, Syllabus 2022) | **6 of 6** attempts have official Group 1 guideline-answer URLs, all present in the site's resource catalogue |
| Extraction | `02_Raw_Extraction/CLP_atomic_questions_raw.json` (extractor 1.0.0, methodology v0.3 §5), `CLP_extraction_validation.json` | **200** atomic question parts (+60 context nodes; **45** alternative parts). Each paper passes **17/17** automated checks: question count, numbering, unique IDs, marks present, sub-totals, attemptable marks = printed 100, alternative groups, page provenance. Status for all 200: `EXTRACTED` (not human-verified). Extraction confidence: 147 HIGH, 53 MEDIUM |
| Classification v0.1 | `03_Classified_Questions/CLP_classified_questions_v0.1.json` (methodology 0.3, taxonomy 0.2) | **200** records classified (153 `NEEDS_REVIEW`, 47 `CLASSIFIED`). **0** human-reviewed, verified or approved |
| Classification v0.2 candidate | `03_Classified_Questions/CLP_classified_questions_v0.2_ai_desk_review_candidate.json` + overlay | AI desk review of the 26 Priority-A records: 10 changed, 9 held. **Not professional or human review.** Kept out of the public provider; `/preview/candidate` returns 404 unless explicitly enabled |
| Taxonomy | `taxonomy/clp_taxonomy_v0.3.json` (validation ALL_PASS) | v0.3 = v0.2 nodes plus the CR-001 note. The website export (`web/content/taxonomy/clp.json`) is v0.3 |

**Unresolved:**
- the human review queue (`04_Verification/CLP_HUMAN_REVIEW_QUEUE_v0.1.md` and the v0.4 review queue of 103 records)
- the 9 held Priority-A records
- the missing pre-December-2025 study material for 6 records
- legal-version checks for each Act, Rule and SS at each exam date
- independent verification of all 26 Priority-A records

## 3. What is published, and why

**Authoritative public dataset: the question-paper inventory.** `web/content/papers/clp-paper-inventory.json` is generated by `web/scripts/export-paper-inventory.mjs` from:
- the paper manifest
- the raw extraction
- the extraction validation
- `SOURCE_REGISTRY.md` §5
- the v0.1 classification file (used only for the count of human-reviewed records)

It publishes, per attempt:
- the official paper and guideline-answer links
- the printed header (maximum marks, number of questions, time)
- the question numbers, with parts and marks per question and the either/or groups
- totals, and the automated check results

The export **refuses to write** if a paper's attemptable marks don't equal its printed maximum, or if its question numbering doesn't match the printed total. It publishes **no question text** (that stays in ICSI's papers) and **no classification**.

**Shown on `/subjects/clp`:** a new "Question papers in the dataset" section above the demo analysis:
- 6 attempts, 200 question parts, 6 of 6 guideline answers linked
- "0 of 200" topic classifications reviewed, with the statement that no topic frequency, marks weight or priority is published until review

**Methodology and versions in use:**
- extraction: methodology v0.3 §5 atomic units
- classification: none published
- taxonomy shown: v0.3
- incompatible versions are not mixed: no v0.1 (taxonomy 0.2) or v0.2 (taxonomy 0.3) classification is used anywhere public

**Not published: topic frequencies, marks weight, recurrence and priorities from real papers.** The publication condition isn't met: 0 of 200 classifications have completed human review. These views still run on the **114 synthetic demonstration records** (`web/mock/questions/clp.json`) through the unchanged public provider. They are computed from records, not constants (tested).

**Kept labelled as demo:** the subject page analysis ("Demonstration analysis (synthetic questions)"), the PYQ explorer ("demo"), and "Example:" priority labels. The demo warnings were **not removed**, because synthetic records remain behind those views. Removing them would disguise synthetic data as real.

## 4. Copy changes (Objective 3)

- **Pricing:** price stated; "not yet available to buy" with the reason.
- **Homepage closing call-to-action:** states the Pro price and that it is not yet purchasable.
- **About:** the status note now reports the six papers and 200 question parts as published, and the topic classifications as not yet reviewed.
- **Subject badge:** "Question dataset not yet verified" became the more precise "Topic classifications not yet reviewed", since the paper inventory is now real and published.
- **Unchanged on purpose:** demo labels on analysis views and the not-affiliated and not-a-prediction notices.

## 5. Checks (actual runs)

| Command (in `web/`) | Result |
|---|---|
| `npm run lint` | pass (exit 0) |
| `npm run typecheck` | pass (exit 0, 0 errors) |
| `npm test` | **118 / 118 passed**, 8 files: analytics 7, billing 21, candidate-preview 20, catalogues 13, entitlements 17, pg-store 19, public-site 10, **release 11 (new)**. The pg-store suite uses the existing local test database only |
| `npm run validate:data` | 0 errors, 0 warnings |
| `npm run build` | pass, 107 pages, in place (preview switch unset) |
| `node scripts/export-paper-inventory.mjs --check` | current (also run inside the release tests) |

**New tests (`web/test/release.test.ts`):**
- one price (billing value is the pricing value; ₹349, per user, monthly)
- no stale price strings
- nothing purchasable; checkout blocked without configuration
- the inventory covers exactly the six attempts in the analysis window
- each paper reconciles to its printed maximum and numbering
- totals of 200 parts and 45 alternatives
- links only to catalogued official ICSI URLs
- no question text or classification fields in the inventory
- the inventory is current with the research files, and its reviewed-count matches v0.1
- analytics derived from records
- public provider still DEMO while 0 records are reviewed
- no candidate imports or paths in the providers

**Local production server** (`next start`, preview switch off):

| Route | Status |
|---|---|
| `/`, `/about`, `/pricing`, `/privacy`, `/terms`, `/contact`, `/subjects`, `/subjects/clp`, `/pyq`, `/sitemap.xml`, `/robots.txt`, `/login`, `/signup` | 200 |
| `/dashboard` (signed out) | 307 redirect to login |
| `/preview/candidate` | **404** |

`/subjects/clp` renders 6 paper rows, "0 of 200" and "6 of 6". `/pricing` shows ₹349 per user per month and no "To be announced".

**Preview deployment** (`https://cs-executive-pyq-analysis-ol2zn7axd-cs-executive-pyq-analysis.vercel.app`, commit `603ffd5`): **not checked.** Every route returns a 302 redirect to Vercel's sign-in (Deployment Protection), so it can't be read without a bypass token. It also predates these uncommitted changes. Your own checks of authentication, sessions, the database and `/preview/candidate` on that deployment stand. Re-check after the next Preview build.

**Not run:** `npm run audit:security`. As instructed, it was not run against either Neon database; it needs the isolated local audit database.

**Observation, no action taken:** GitHub's deployment list shows a **Production** deployment of `0609729` (the `launch/platform` commit), created after the earlier Production deployment of `main` (`66228c1`). Confirm this is intended.

## 6. Changed files (all in `web/`, uncommitted)

| File | Reason |
|---|---|
| `lib/config/pro-price.ts` (new) | Single Pro price |
| `lib/billing/config.ts` | Re-exports the single price (was ₹320) |
| `lib/config/pricing.ts`, `components/pricing/plans.tsx` | Price and per-user period display; `purchasable: false` |
| `app/(site)/pricing/page.tsx` | Header, metadata and FAQ state the price and that it is not purchasable |
| `components/home/sections.tsx` | Closing call-to-action states the price, not purchasable |
| `scripts/export-paper-inventory.mjs` (new) | Generates the real paper inventory from research sources, with reconciliation guards |
| `content/papers/clp-paper-inventory.json` (new, generated) | Public inventory: no question text, no classification |
| `types/papers.ts`, `lib/data/paper-inventory.ts`, `components/subjects/paper-inventory.tsx` (new) | Types, loader and UI for the inventory (separate from the analytics provider) |
| `app/(site)/subjects/[slug]/page.tsx` | Shows the inventory; badge "Topic classifications not yet reviewed" |
| `app/(site)/about/page.tsx` | Status note reflects the published inventory and pending review |
| `test/release.test.ts` (new), `test/public-site.test.ts` | New release tests; two assertions updated to the new price and About wording |

**Suggested staging** (only these paths; do not use `git add .`):
```
git add web/lib/config/pro-price.ts web/lib/billing/config.ts web/lib/config/pricing.ts web/components/pricing/plans.tsx \
  "web/app/(site)/pricing/page.tsx" web/components/home/sections.tsx web/scripts/export-paper-inventory.mjs \
  web/content/papers/clp-paper-inventory.json web/types/papers.ts web/lib/data/paper-inventory.ts \
  web/components/subjects/paper-inventory.tsx "web/app/(site)/subjects/[slug]/page.tsx" "web/app/(site)/about/page.tsx" \
  web/test/release.test.ts web/test/public-site.test.ts
```

## 7. Human review required before real analytics replace the demo
1. Human review of the CLP classification queue: 26 Priority-A, 64 Priority-B, and a 15% sample of Priority-C, per methodology §10.4. Each record must reach `REVIEWED` or `VERIFIED` with a named reviewer.
2. Resolve the 9 held Priority-A records. 6 need the pre-December-2025 study material, 2 need a reviewer decision, and 1 needs a confidence decision.
3. Independent verification of the Priority-A records.
4. Legal-version checks (Acts, Rules and SS in force at each exam date) where the review package flags them.
5. A versioned approved release (`05_Approved_Dataset/`) and a provider that reads it with `APPROVED` status. Only then switch the analytics off demo data and remove the demo labels.

## 8. Issues preventing a safe release
- **Pricing model conflict:** "per user" (copy) vs per-qualification subscriptions (backend). Decide before checkout.
- **Checkout not implemented end-to-end in the UI.** Payments must stay off (B-07 and B-08 in `LAUNCH_BLOCKERS.md`).
- **Real topic analytics cannot be published** until the review in §7 is done. The site honestly shows the real paper inventory plus labelled demo analytics.
- **Preview not re-verified** after these changes (Deployment Protection). Owner check needed after commit and Preview build.
- **Earlier owner items still open:** support email (`NEXT_PUBLIC_SUPPORT_EMAIL`), operator identity, data retention, `NEXT_PUBLIC_SITE_URL` (see `04_Verification/public_launch_audit_2026-10-24/LAUNCH_READINESS_REPORT.md` §6–7).
