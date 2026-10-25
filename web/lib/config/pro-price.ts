// Single source of truth for the Pro price (owner decision 2026-10-24: ₹349 per user per month).
// Used by the pricing page and by billing; safe to import from client and server code (no secrets).

export const PRO_PRICE = { amountPaise: 34900, currency: "INR", interval: "monthly", unit: "user" } as const;

/** Rupees, without paise when the price is a whole number. */
export const proPriceRupees = PRO_PRICE.amountPaise / 100;

/** "₹349" in Indian number formatting. */
export const PRO_PRICE_DISPLAY = `₹${proPriceRupees.toLocaleString("en-IN")}`;

/** "₹349 per user per month" — the wording used wherever the Pro price is stated. */
export const PRO_PRICE_LABEL = `${PRO_PRICE_DISPLAY} per user per month`;
