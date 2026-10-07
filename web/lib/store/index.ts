import "server-only";
import { createFileStore } from "./file-store";
import type { UserStore } from "./types";

/**
 * Store selection. USER_STORE=file (default) uses .data/store.json.
 * USER_STORE=postgres is reserved for the Drizzle implementation (schema in lib/db/schema.ts).
 */
function select(): UserStore {
  const kind = process.env.USER_STORE ?? "file";
  if (kind === "file") return createFileStore();
  throw new Error(`USER_STORE="${kind}" is not implemented yet. Use "file" or add the Postgres store.`);
}

const globalForStore = globalThis as unknown as { __userStore?: UserStore };
export const store: UserStore = globalForStore.__userStore ?? (globalForStore.__userStore = select());
