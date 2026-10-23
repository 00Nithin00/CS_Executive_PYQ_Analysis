// Test database helper. Uses TEST_DATABASE_URL (default: local atlas_test, migrated with `npm run db:migrate`).
// Refuses to run against anything that does not look like a test database.
import { sql } from "drizzle-orm";
import { createDb } from "@/lib/db/client";
import { createPgStore } from "@/lib/store/pg-store";

export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgres://localhost:5432/atlas_test";
if (!/test/i.test(new URL(TEST_DATABASE_URL).pathname)) {
  throw new Error(`Refusing to run tests against ${new URL(TEST_DATABASE_URL).pathname}: database name must contain "test".`);
}

export function testStore() {
  const { db, close } = createDb(TEST_DATABASE_URL, { max: 10 });
  return { db, store: createPgStore(db), close };
}

export async function resetDb(db: ReturnType<typeof createDb>["db"]) {
  // Never touches drizzle.__drizzle_migrations.
  await db.execute(sql.raw("truncate table webhook_events, payments, bookmarks, user_progress, study_plans, rate_limits, subscriptions, users cascade"));
}
