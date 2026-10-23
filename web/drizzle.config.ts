import { defineConfig } from "drizzle-kit";

// Migrations cover the account/billing schema only (lib/db/schema.ts). research-schema.ts is intentionally excluded.
//   npm run db:generate   write a new SQL migration from schema changes (review it, add a rollback file, commit both)
//   npm run db:migrate    apply pending migrations to DATABASE_URL
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost:5432/atlas_dev" },
  strict: true,
});
