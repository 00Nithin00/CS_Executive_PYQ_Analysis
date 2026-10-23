// Billing configuration and the rules for when checkout may be offered. Server-only: reads secrets.
import "server-only";
import { isQualification, QUALIFICATIONS, type Qualification } from "@/lib/entitlements/resolve";

/** Pro price (owner decision 2026-10-23): ₹320 per month, per qualification. */
export const PRO_PRICE = { amountPaise: 32000, currency: "INR", interval: "monthly" } as const;

export type BillingMode = "test" | "live";

export interface BillingConfig {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  mode: BillingMode;
  planIds: Partial<Record<Qualification, string>>;
  checkoutQualifications: ReadonlySet<Qualification>;
  liveApproved: boolean;
  isProductionDeployment: boolean;
}

/** Reads billing env vars. Returns null when Razorpay is not configured at all (checkout off, webhooks rejected). */
export function readBillingConfig(env: Record<string, string | undefined> = process.env): BillingConfig | null {
  const keyId = env.RAZORPAY_KEY_ID?.trim();
  const keySecret = env.RAZORPAY_KEY_SECRET?.trim();
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!keyId || !keySecret || !webhookSecret) return null;
  const mode: BillingMode = keyId.startsWith("rzp_live_") ? "live" : "test";
  const planIds: Partial<Record<Qualification, string>> = {};
  for (const q of QUALIFICATIONS) {
    const id = env[`RAZORPAY_PLAN_ID_${q.toUpperCase()}`]?.trim();
    if (id) planIds[q] = id;
  }
  const checkoutQualifications = new Set(
    (env.BILLING_CHECKOUT_QUALIFICATIONS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(isQualification),
  );
  return {
    keyId,
    keySecret,
    webhookSecret,
    mode,
    planIds,
    checkoutQualifications,
    liveApproved: env.BILLING_LIVE_APPROVED === "true",
    isProductionDeployment: env.VERCEL_ENV === "production",
  };
}

export type CheckoutBlock =
  | "NOT_CONFIGURED"
  | "QUALIFICATION_DISABLED"
  | "NO_PLAN"
  | "TEST_KEYS_IN_PRODUCTION"
  | "LIVE_NOT_APPROVED";

/**
 * Whether checkout may be offered for a qualification, and if not, why.
 * - Test keys never take money but would grant Pro, so they are refused on the production deployment.
 * - Live keys are refused until the owner sets BILLING_LIVE_APPROVED=true (after provider approval and a controlled live test).
 * - A qualification must be explicitly listed in BILLING_CHECKOUT_QUALIFICATIONS (default: none).
 */
export function checkoutBlock(cfg: BillingConfig | null, q: Qualification): CheckoutBlock | null {
  if (!cfg) return "NOT_CONFIGURED";
  if (!cfg.checkoutQualifications.has(q)) return "QUALIFICATION_DISABLED";
  if (!cfg.planIds[q]) return "NO_PLAN";
  if (cfg.mode === "test" && cfg.isProductionDeployment) return "TEST_KEYS_IN_PRODUCTION";
  if (cfg.mode === "live" && !cfg.liveApproved) return "LIVE_NOT_APPROVED";
  return null;
}
