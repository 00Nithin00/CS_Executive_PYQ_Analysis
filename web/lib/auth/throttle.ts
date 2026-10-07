import "server-only";

// Per-account login throttle (in-memory, per server process). Enough to stop online password guessing
// against one account on a single-server MVP; replace with a shared store (e.g. Postgres/Redis) when
// running more than one instance.
const MAX_FAILURES = 10;
const WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; first: number }>();

export const loginThrottle = {
  isLocked(key: string, now = Date.now()) {
    const f = failures.get(key);
    if (!f) return false;
    if (now - f.first > WINDOW_MS) {
      failures.delete(key);
      return false;
    }
    return f.count >= MAX_FAILURES;
  },
  fail(key: string, now = Date.now()) {
    const f = failures.get(key);
    if (!f || now - f.first > WINDOW_MS) failures.set(key, { count: 1, first: now });
    else f.count++;
  },
  reset(key: string) {
    failures.delete(key);
  },
};
