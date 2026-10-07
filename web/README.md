# CS Executive Intelligence — web app (working name "Atlas")

Next.js 16 (App Router, Cache Components, Partial Prefetching) · TypeScript · Tailwind CSS 4 · motion · lucide-react · jose · Drizzle (schema only).

## Run locally

```bash
cd web
npm install
cp .env.example .env.local        # set AUTH_SECRET (required for `npm start`; dev falls back to an insecure key)
npm run dev                       # http://localhost:3000
# production build
npm run build && npm start
```

Checks: `npm run typecheck` · `npm run lint` · `npm run build` · `npm run validate:data` (dataset vs frozen taxonomy + methodology rules)

Security audit (against a running production build with an isolated store):
```bash
npm run build
FILE_STORE_PATH=/tmp/audit-store.json AUTH_SECRET=<32+ chars> PORT=3311 npm start &
FILE_STORE_PATH=/tmp/audit-store.json AUTH_SECRET=<same> BASE=http://localhost:3311 npm run audit:security
```

## Giving someone Pro (admin grant)

1. They sign up at `/signup` (creates a Free account).
2. Grant Pro — creates `plan=PRO, status=ACTIVE, source=ADMIN_GRANT, expires_at=NULL`:
   ```bash
   npm run admin -- grant-pro their@email.com --note "personal use"
   npm run admin -- make-admin you@email.com   # optional: enables /dashboard/admin
   npm run admin -- list
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
lib/entitlements/             capabilities.ts → plans.ts (plan→capabilities) → resolve.ts (subscriptions→plan)
lib/auth/                     scrypt passwords, signed httpOnly session cookie, getViewer() DAL, server actions
lib/store/                    UserStore interface; file-store.ts (.data/store.json) now, Postgres later
lib/db/schema.ts              PostgreSQL schema (Drizzle) mirroring PROJECT_METHODOLOGY v0.3 §5
proxy.ts                      optimistic /dashboard redirect only — real checks are server-side
```

### Data integrity
- `content/` holds **real** data: subject catalogue and lessons (ICSI Syllabus 2022), the frozen CLP taxonomy v0.2
  (`npm run data:taxonomy` re-exports it from `../taxonomy/`), and 83 official ICSI resource links (links only, nothing re-hosted).
- `mock/questions/clp.json` holds **synthetic demo** records (`isDemo: true`, `provenance: "DEMO"`, text prefixed `[Demo]`),
  regenerated deterministically with `npm run data:demo`. Every surface showing them carries a "Demo data" label.
- Subjects without data show "being prepared" states, never placeholder numbers.

### Configuration that matters
- `AUTH_SECRET` (required in production) · `NEXT_PUBLIC_SITE_URL` (canonical URLs, sitemap)
- `COOKIE_SECURE=false` only to test the production build over plain http on a LAN (e.g. a phone); never in deployment.
- Demo disclosure text and provenance-aware labels: `lib/config/disclosure.ts`. Public homepage preview policy: `lib/config/public-preview.ts`.
- Product name: `PRODUCT_NAME` in `lib/config/site.ts` (placeholder "Atlas").

### Limits of the current version
- The file store is for local / single-server use. Vercel's filesystem is not persistent: deploying there needs the Postgres
  store (`USER_STORE=postgres`, not yet implemented) and a `DATABASE_URL`.
- Login throttling and the file store are per-process (fine for one server; use a shared store for several instances).
- No payments yet (subscription `source` already supports RAZORPAY / STRIPE / COUPON).
