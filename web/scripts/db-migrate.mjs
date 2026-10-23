// Applies pending SQL migrations from lib/db/migrations to DATABASE_URL, in order, each in a transaction.
// Run explicitly (never from the Vercel build):  DATABASE_URL=... npm run db:migrate
// Applied migrations are recorded in drizzle.__drizzle_migrations, so re-running is a no-op.
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const host = (() => { try { return new URL(url).host; } catch { return "(unparseable url)"; } })();
const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
try {
  console.log(`Applying migrations to ${host} ...`);
  await migrate(drizzle(client), { migrationsFolder: new URL("../lib/db/migrations", import.meta.url).pathname });
  const rows = await client`select id, hash, created_at from drizzle.__drizzle_migrations order by id`;
  console.log(`Done. ${rows.length} migration(s) recorded.`);
} catch (e) {
  console.error("Migration failed; the failing migration was rolled back.", e.message);
  process.exitCode = 1;
} finally {
  await client.end({ timeout: 5 });
}
