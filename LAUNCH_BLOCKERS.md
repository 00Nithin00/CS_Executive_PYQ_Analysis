# Launch blockers

The status column changes as work happens. **Owner:** E = engineering (Claude), O = product owner (you).

| ID | Pri | Blocker | Owner | Depends on | Acceptance criteria | Status |
|---|---|---|---|---|---|---|
| B-01 | P0 | Next.js 16.4.0 has critical RCE advisories | E | none | `next` and `eslint-config-next` at 16.4.2 or later. `npm audit --omit=dev` shows no critical findings. Typecheck, lint and build pass | In progress |
| B-02 | P0 | Accounts and user data go to a local JSON file, which doesn't persist on Vercel | E + O | Neon database (O) | Postgres `UserStore` behind the existing interface. Migrations are versioned SQL with written rollback steps. `USER_STORE=postgres` in production. Accounts, bookmarks, progress, study plans and subscriptions survive redeploys and work across instances (tested against real Postgres) | In progress |
| B-03 | P0 | No automated tests | E | none | Test runner added. Unit tests cover entitlements, the store and webhooks. Integration tests run against Postgres. The security audit is ported to Postgres and passes | In progress |
| B-04 | P0 | Login throttle is in memory, and sign-up has no rate limit | E | B-02 | Login and sign-up limits are stored in Postgres and shared across instances. Lockout is tested | Open |
| B-05 | P0 | No CA or CMA sections | E + O | Official-source research; your review of the catalogues | Each has its own entry point, levels, groups and papers, syllabus links, and official study-material and paper links. Every link has HTTP-verified provenance. Coverage is labelled honestly. Validation report passes | Research running |
| B-06 | P0 | Entitlements and subscriptions aren't qualification-aware | E | B-02 | Subscriptions carry a `qualification`. CS Pro never unlocks CA or CMA data. Tested on server paths | Open |
| B-07 | P0 | No payment integration | E + O | Razorpay test keys (O) | Razorpay Subscriptions flow: plan → subscription → checkout → server-side signature verification → signed webhooks (idempotent) → entitlement. All nine sandbox scenarios in the brief pass | Open |
| B-08 | P0 (paid launch) | Razorpay live activation: KYC and website review | **O** | Legal pages (B-09), business details | Live keys issued and Subscriptions enabled in live mode. Until then, live checkout stays off and the site doesn't claim payments are live | **External** |
| B-09 | P0 (paid launch) | No terms, privacy, refund/cancellation or contact pages; no support email | E + **O** | Your legal name, address, support email and refund policy | Pages are published with your real details. Razorpay requires these for activation. I won't invent an email or address | **Waiting on you** |
| B-10 | P0 (paid launch) | Pro analytics run only on demo data; CLP classifications aren't approved | **O** (review) + E | Human review of `CLP_HUMAN_REVIEW_QUEUE_v0.1.md` (26 A, 64 B, 15% sample of C) | Either the verified CLP release is published with traceable analytics, or Pro is sold only for features that work on real data, with that limit disclosed. No payment for demo-backed features | **Decision needed** |
| B-11 | P1 | Pricing page shows "To be announced" and a waitlist that does nothing | E | B-06, B-07, B-10 | Clear Free/Pro comparison per qualification at ₹320/month. Renewal, cancellation, refund and tax disclosures. Checkout only where enabled | Open |
| B-12 | P1 | Product name is hard-coded in some places | E | none | All visible uses come from `SITE`. No stray "Atlas" or "CS Executive" in metadata or emails | Open |
| B-13 | P1 | Admin CLI writes to the file store | E | B-02 | Admin CLI uses the same Postgres store. Grants are qualification-scoped and recorded as `ADMIN_GRANT`, never as payments | Open |
| B-14 | P1 | No backup, restore, rollback or monitoring runbook | E + O | B-02 | `RUNBOOK.md` covers Neon backups and point-in-time restore, the rollback steps for each migration, the deploy rollback (Vercel instant rollback), and monitoring of payment and webhook errors | Open |
| B-15 | P2 | GST treatment of ₹320 isn't decided (inclusive or exclusive) | **O** | your accountant | The pricing page states it explicitly | **Decision needed** |

## Decisions recorded

- 2026-10-23: Database is **Neon (Vercel Marketplace)**. Payments are **Razorpay**. Pro is **₹320/month per qualification**. Launch name is **"Atlas" (temporary)**.

## What I need from you, in order of urgency

1. **Razorpay:** create the account and start KYC today (live approval is usually the longest pole). Turn on Subscriptions. Send me the **test** Key ID; put the Key Secret and webhook secret straight into Vercel environment variables, never in chat or Git.
2. **Neon:** Vercel → Storage → Neon → connect it to the project for Preview and Production. That injects `DATABASE_URL`.
3. **Legal and support:** your support email, the legal entity or individual name, a postal address, and your refund policy. Razorpay checks these pages before activation.
4. **B-10:** decide whether to (a) review the CLP queue so CS analytics can launch on verified data, or (b) launch with Pro checkout off until that's done.
5. **B-15:** is ₹320 inclusive or exclusive of GST?
