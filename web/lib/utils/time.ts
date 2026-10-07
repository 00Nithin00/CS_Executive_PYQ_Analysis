/** Whole weeks from now until an ISO date (never negative). Request-time only (dynamic routes). */
export function weeksUntil(iso: string, now: number = Date.now()) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / (7 * 24 * 3600 * 1000)));
}
