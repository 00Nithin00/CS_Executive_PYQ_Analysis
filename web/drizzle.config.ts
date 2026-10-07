import { defineConfig } from "drizzle-kit";

// Used only when the Postgres store/provider is introduced: `npx drizzle-kit generate`.
export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost:5432/cs_executive" },
});
