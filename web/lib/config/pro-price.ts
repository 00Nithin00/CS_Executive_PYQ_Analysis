// Single source of truth for the Pro price (owner decision 2026-10-24: ₹349 per user per month).
// Used by the pricing page and by billing; safe to import from client and server code (no secrets).

export const PRO_PRICE = { amountPaise: 34900, currency: "INR", interval: "monthly", unit: "user" } as const;

/**
 * The only product on sale: CS Executive Pro. A subscription is per user and per qualification ("cs"); it never unlocks
 * CA or CMA (lib/entitlements/resolve.ts). Checkout refuses every other qualification, whatever the environment says.
 */
export const PRO_PRODUCT = { name: "CS Executive Pro", qualification: "cs" } as const;

/** Rupees, without paise when the price is a whole number. */
export const proPriceRupees = PRO_PRICE.amountPaise / 100;

/** "₹349" in Indian number formatting. */
export const PRO_PRICE_DISPLAY = `₹${proPriceRupees.toLocaleString("en-IN")}`;

/** "₹349 per user per month" — the wording used wherever the Pro price is stated. */
export const PRO_PRICE_LABEL = `${PRO_PRICE_DISPLAY} per user per month`;

/** True when a Razorpay plan bills exactly PRO_PRICE: same amount and currency, every 1 month. */
export function planMatchesProPrice(plan: { period?: string; interval?: number; item?: { amount?: number; currency?: string } } | null | undefined): boolean {
  return Boolean(
    plan && plan.period === "monthly" && plan.interval === 1 && plan.item?.amount === PRO_PRICE.amountPaise && plan.item?.currency === PRO_PRICE.currency,
  );
}
