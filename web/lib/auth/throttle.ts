import "server-only";
import { headers } from "next/headers";
import { store } from "@/lib/store";

// Rate limits are stored in Postgres, so every server instance shares the same counters.
// Per account: stops online password guessing against one email. Per IP: bounds sign-up spam and credential stuffing.
export const LIMITS = {
  loginPerAccount: { limit: 10, windowSeconds: 15 * 60 },
  loginPerIp: { limit: 50, windowSeconds: 15 * 60 },
  // Generous: a campus session can put many students behind one college NAT address.
  signupPerIp: { limit: 20, windowSeconds: 60 * 60 },
} as const;

/** Client IP as set by the hosting proxy (Vercel overwrites these headers). Falls back to a shared bucket. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip")?.trim() || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function hit(key: string, rule: { limit: number; windowSeconds: number }) {
  return store.hitRateLimit(key, rule.limit, rule.windowSeconds);
}

export const loginThrottle = {
  /** Counts one login attempt. Returns false when the account or IP is over its limit. */
  async attempt(email: string, ip: string) {
    const [account, address] = await Promise.all([hit(`login:acct:${email}`, LIMITS.loginPerAccount), hit(`login:ip:${ip}`, LIMITS.loginPerIp)]);
    return account.allowed && address.allowed;
  },
  /** A successful login clears the per-account counter. */
  reset(email: string) {
    return store.resetRateLimit(`login:acct:${email}`);
  },
};

export const signupThrottle = {
  async attempt(ip: string) {
    return (await hit(`signup:ip:${ip}`, LIMITS.signupPerIp)).allowed;
  },
};
