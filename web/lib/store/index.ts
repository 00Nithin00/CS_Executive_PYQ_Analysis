import "server-only";
import { getDb } from "@/lib/db/client";
import { createPgStore } from "./pg-store";
import type { UserStore } from "./types";

/**
 * The account/personal-data store. Postgres everywhere (development, tests, production) so that what
 * is tested is what runs on Vercel. The connection is opened lazily on first use, never at import/build time.
 */
let instance: UserStore | null = null;
const resolve = () => (instance ??= createPgStore(getDb()));

export const store: UserStore = new Proxy({} as UserStore, {
  get: (_t, prop: keyof UserStore) => resolve()[prop],
});
