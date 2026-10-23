# CS Executive Intelligence — web app (working name "Atlas")

Next.js 16 (App Router, Cache Components, Partial Prefetching) · TypeScript · Tailwind CSS 4 · motion · lucide-react · jose · Drizzle + Postgres (accounts, subscriptions, personal data).

## Run locally

```bash
cd web
npm install
cp .env.example .env.local        # set AUTH_SECRET (required for `npm start`; dev falls back to an insecure key)
createdb atlas_dev                # any Postgres 14+ (Homebrew, Docker or a Neon dev branch)
DATABASE_URL=postgres://localhost:5432/atlas_dev npm run db:migrate
npm run dev                       # http://localhost:3000
# production build
npm run build && npm start
```

Checks: `npm run build` (run before `typecheck`; it regenerates route types) · `npm run typecheck` · `npm run lint` · `npm run validate:data` · `npm test`

Tests (`npm test`): unit tests plus integration tests against a real Postgres test database:
```bash
createdb atlas_test && DATABASE_URL=postgres://localhost:5432/atlas_test npm run db:migrate
npm test                          # TEST_DATABASE_URL overrides the default postgres://localhost:5432/atlas_test
```

Security audit and end-to-end account journey (against a running production build with an ISOLATED database):
```bash
createdb atlas_audit && DATABASE_URL=postgres://localhost:5432/atlas_audit npm run db:migrate
npm run build
export DATABASE_URL=postgres://localhost:5432/atlas_audit AUTH_SECRET=<32+ chars>
PORT=3311 npm start &
BASE=http://localhost:3311 npm run audit:security
PHASE=1 BASE=http://localhost:3311 npm run e2e:auth   # then restart the server…
PHASE=2 BASE=http://localhost:3311 npm run e2e:auth   # …to prove persistence
```

Database migrations: `npm run db:generate` creates a SQL migration from `lib/db/schema.ts` (review it and add a matching
`lib/db/rollback/<name>.down.sql`); `npm run db:migrate` applies pending migrations to `DATABASE_URL`. Migrations are never run
by the Vercel build — apply them explicitly before deploying (see ../RUNBOOK.md).

## Giving someone Pro (admin grant)

1. They sign up at `/signup` (creates a Free account).
2. Grant Pro for one qualification — creates `plan=PRO, status=ACTIVE, source=ADMIN_GRANT, expires_at=NULL`:
   ```bash
   DATABASE_URL=... npm run admin -- grant-pro their@email.com cs --note "personal use"   # cs | ca | cma
   DATABASE_URL=... npm run admin -- make-admin you@email.com   # optional: enables /dashboard/admin
   DATABASE_URL=... npm run admin -- list
   ```
No email is hard-coded anywhere; access always flows from subscriptions → plan → capabilities.

## Architecture

```
UI (app/, components/)
  └─ lib/data/service.ts      viewer-aware service layer — capability checks happen here, server-side
       └─ DataProvider        lib/data/provider.ts (interface)
            ├─ mockProvider   content/ (real, verified reference data) + mock/ (DEMO question records)
            └─ (next) Postgres provider fed by the approved web_export   ← same interface, no UI rewrite
lib/analytics/compute.ts      every chart number is computed here from question records (methodology §8–§9)
lib/entitlements/             capabilities.ts → plans.ts (plan→capabilities) → resolve.ts (subscriptions→plan, per qualification)
lib/auth/                     scrypt passwords, signed httpOnly session cookie, getViewer() DAL, server actions
lib/store/                    UserStore interface; pg-store.ts (Postgres via Drizzle) — dev, tests and production
lib/db/schema.ts              migrated account/billing schema · lib/db/migrations (SQL) · lib/db/rollback (down SQL)
lib/db/research-schema.ts     research tables (PROJECT_METHODOLOGY v0.3 §5) — not migrated until verified data exists
proxy.ts                      optimistic /dashboard redirect only — real checks are server-side
```

### Data integrity
- `content/` holds **real** data: subject catalogue and lessons (ICSI Syllabus 2022), the frozen CLP taxonomy v0.2
  (`npm run data:taxonomy` re-exports it from `../taxonomy/`), and 83 official ICSI resource links (links only, nothing re-hosted).
- `mock/questions/clp.json` holds **synthetic demo** records (`isDemo: true`, `provenance: "DEMO"`, text prefixed `[Demo]`),
  regenerated deterministically with `npm run data:demo`. Every surface showing them carries a "Demo data" label.
- Subjects without data show "being prepared" states, never placeholder numbers.

### Configuration that matters
- `AUTH_SECRET` (required in production) · `DATABASE_URL` (required; Neon pooled URL on Vercel) · `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap)
- `COOKIE_SECURE=false` only to test the production build over plain http on a LAN (e.g. a phone); never in deployment.
- Demo disclosure text and provenance-aware labels: `lib/config/disclosure.ts`. Public homepage preview policy: `lib/config/public-preview.ts`.
- Product name: `PRODUCT_NAME` in `lib/config/site.ts` (placeholder "Atlas").

### Limits of the current version
- No payments yet (subscription `source` already supports RAZORPAY / STRIPE / COUPON). See ../LAUNCH_BLOCKERS.md.
- If Postgres is unreachable, public pages keep working for everyone as the anonymous (free) view; dashboards and
  account actions fail closed with an error instead of granting or silently dropping anything.
