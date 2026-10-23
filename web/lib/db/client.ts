// Postgres connection (postgres-js + Drizzle). One pool per server instance.
// Neon: use the *pooled* connection string; prepare=false keeps it compatible with PgBouncer transaction mode.
import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

export function createDb(url: string, options: { max?: number } = {}): { db: Db; close: () => Promise<void> } {
  const client = postgres(url, {
    max: options.max ?? Number(process.env.DB_POOL_MAX ?? 5),
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  return { db: drizzle(client, { schema }), close: () => client.end({ timeout: 5 }) };
}

const globalForDb = globalThis as unknown as { __db?: Db };

/** Shared database handle. Throws a clear error if DATABASE_URL is missing (never falls back silently). */
export function getDb(): Db {
  if (globalForDb.__db) return globalForDb.__db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Accounts and personal data require Postgres (see web/README.md).");
  globalForDb.__db = createDb(url).db;
  return globalForDb.__db;
}
