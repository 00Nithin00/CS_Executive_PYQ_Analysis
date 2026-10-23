// Billing lifecycle tests: webhook verification, idempotency, state transitions and entitlements,
// against the real Postgres test database with an in-memory fake of the Razorpay API.
import { createHmac } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { checkoutBlock, readBillingConfig } from "@/lib/billing/config";
import { verifyCheckoutSignature, verifyWebhookSignature, type RazorpayApi, type RazorpaySubscription } from "@/lib/billing/razorpay";
import { handleRazorpayWebhook } from "@/lib/billing/webhook";
import { resolveEntitlements } from "@/lib/entitlements/resolve";
import { resetDb, testStore } from "./db";

const { db, store, close } = testStore();
afterAll(() => close());

const SECRET = "whsec_test_0123456789abcdef";
const NOW = Math.floor(Date.now() / 1000);
const DAY = 86400;

// ---- fake Razorpay
let remote: Map<string, RazorpaySubscription>;
let cancelled: { id: string; atCycleEnd: boolean }[];
let fetchFails = false;
const api: RazorpayApi = {
  async createSubscription() {
    throw new Error("not used");
  },
  async fetchSubscription(id) {
    if (fetchFails) throw new Error("razorpay timeout");
    const s = remote.get(id);
    if (!s) throw new Error("404");
    return structuredClone(s);
  },
  async cancelSubscription(id, atCycleEnd) {
    cancelled.push({ id, atCycleEnd });
    const s = remote.get(id)!;
    if (!atCycleEnd) Object.assign(s, { status: "cancelled", ended_at: NOW });
    return s;
  },
};
const remoteSub = (id: string, o: Partial<RazorpaySubscription> = {}): RazorpaySubscription => {
  const s: RazorpaySubscription = {
    id, plan_id: "plan_CS", status: "active", current_start: NOW - DAY, current_end: NOW + 29 * DAY,
    ended_at: null, start_at: NOW - DAY, charge_at: NOW + 29 * DAY, notes: {}, ...o,
  };
  remote.set(id, s);
  return s;
};

// ---- helpers
let seq = 0;
async function deliver(event: string, payload: object, { secret = SECRET, eventId }: { secret?: string; eventId?: string } = {}) {
  const rawBody = JSON.stringify({ entity: "event", event, payload, created_at: NOW });
  const signature = createHmac("sha256", secret).update(rawBody).digest("hex");
  return handleRazorpayWebhook({ rawBody, signature, eventId: eventId ?? `evt_${++seq}` }, { store, api, webhookSecret: SECRET });
}
const subEvent = (id: string, payment?: object) => ({ subscription: { entity: { id } }, ...(payment ? { payment: { entity: payment } } : {}) });
const payment = (id: string, o: object = {}) => ({ id, amount: 32000, currency: "INR", status: "captured", amount_refunded: 0, ...o });

async function userWithCheckout(email: string, subId: string, qualification: "cs" | "ca" | "cma" = "cs") {
  const u = await store.createUser({ email, name: "Buyer", passwordHash: "scrypt$00$00", role: "USER" });
  // What startCheckoutAction records before the browser sees the subscription id.
  await store.upsertProviderSubscription({
    source: "RAZORPAY", providerReference: subId, userId: u.id, qualification, providerPlanId: "plan_CS",
    providerStatus: "created", status: "PENDING", startedAt: null, expiresAt: null, cancelAtPeriodEnd: false,
  });
  remote.get(subId) ?? remoteSub(subId, { status: "created", current_start: null, current_end: null, notes: { user_id: u.id, qualification } });
  const r = remote.get(subId)!;
  r.notes = { user_id: u.id, qualification };
  return u;
}
const plan = async (userId: string, q: "cs" | "ca" | "cma" = "cs") => resolveEntitlements(await store.listSubscriptions(userId), q).plan;

beforeEach(async () => {
  await resetDb(db);
  remote = new Map();
  cancelled = [];
  fetchFails = false;
});

describe("signatures", () => {
  it("webhook signature: valid accepted; wrong secret, tampered body, junk and missing rejected", () => {
    const body = '{"event":"x"}';
    const sig = createHmac("sha256", SECRET).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig, SECRET)).toBe(true);
    expect(verifyWebhookSignature(body, createHmac("sha256", "other").update(body).digest("hex"), SECRET)).toBe(false);
    expect(verifyWebhookSignature(body + " ", sig, SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, "zz" + sig.slice(2), SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, sig.slice(0, 10), SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, null, SECRET)).toBe(false);
  });

  it("checkout signature is HMAC(payment_id|subscription_id) with the key secret", () => {
    const sig = createHmac("sha256", "key_secret").update("pay_1|sub_1").digest("hex");
    expect(verifyCheckoutSignature("pay_1", "sub_1", sig, "key_secret")).toBe(true);
    expect(verifyCheckoutSignature("pay_1", "sub_2", sig, "key_secret")).toBe(false);
    expect(verifyCheckoutSignature("pay_2", "sub_1", sig, "key_secret")).toBe(false);
  });
});

describe("checkout availability guards", () => {
  const env = (o: Record<string, string>) => readBillingConfig({ RAZORPAY_KEY_ID: "rzp_test_abc", RAZORPAY_KEY_SECRET: "s", RAZORPAY_WEBHOOK_SECRET: "w", RAZORPAY_PLAN_ID_CS: "plan_CS", BILLING_CHECKOUT_QUALIFICATIONS: "cs", ...o });
  it("off unless configured, listed and planned", () => {
    expect(checkoutBlock(readBillingConfig({}), "cs")).toBe("NOT_CONFIGURED");
    expect(checkoutBlock(env({}), "ca")).toBe("QUALIFICATION_DISABLED");
    expect(checkoutBlock(env({ BILLING_CHECKOUT_QUALIFICATIONS: "cs,ca" }), "ca")).toBe("NO_PLAN");
    expect(checkoutBlock(env({}), "cs")).toBeNull();
  });
  it("test keys are refused on the production deployment", () => {
    expect(checkoutBlock(env({ VERCEL_ENV: "production" }), "cs")).toBe("TEST_KEYS_IN_PRODUCTION");
    expect(checkoutBlock(env({ VERCEL_ENV: "preview" }), "cs")).toBeNull();
  });
  it("live keys are refused until explicitly approved", () => {
    expect(checkoutBlock(env({ RAZORPAY_KEY_ID: "rzp_live_x", VERCEL_ENV: "production" }), "cs")).toBe("LIVE_NOT_APPROVED");
    expect(checkoutBlock(env({ RAZORPAY_KEY_ID: "rzp_live_x", VERCEL_ENV: "production", BILLING_LIVE_APPROVED: "true" }), "cs")).toBeNull();
  });
});

describe("webhook lifecycle", () => {
  it("1. successful payment grants Pro for that qualification only", async () => {
    const u = await userWithCheckout("buyer@example.com", "sub_A");
    remoteSub("sub_A", { notes: { user_id: u.id, qualification: "cs" } });
    const r = await deliver("subscription.charged", subEvent("sub_A", payment("pay_1")));
    expect(r).toMatchObject({ status: 200, outcome: "applied:active" });
    expect(await plan(u.id, "cs")).toBe("PRO");
    expect(await plan(u.id, "ca")).toBe("FREE");
  });

  it("2a. abandoned checkout (created, never paid) grants nothing", async () => {
    const u = await userWithCheckout("abandon@example.com", "sub_B");
    await deliver("subscription.authenticated", subEvent("sub_B"));
    expect(await plan(u.id)).toBe("FREE");
  });

  it("2b. failed payment grants nothing and is recorded", async () => {
    const u = await userWithCheckout("fail@example.com", "sub_C");
    const r = await deliver("payment.failed", { payment: { entity: payment("pay_fail", { status: "failed", subscription_id: "sub_C" }) } });
    expect(r.outcome).toBe("applied:payment-failed");
    expect(await plan(u.id)).toBe("FREE");
  });

  it("3. duplicate deliveries are processed once", async () => {
    const u = await userWithCheckout("dup@example.com", "sub_D");
    remoteSub("sub_D", { notes: { user_id: u.id, qualification: "cs" } });
    const first = await deliver("subscription.charged", subEvent("sub_D", payment("pay_D")), { eventId: "evt_same" });
    const again = await Promise.all([1, 2, 3].map(() => deliver("subscription.charged", subEvent("sub_D", payment("pay_D")), { eventId: "evt_same" })));
    expect(first.outcome).toBe("applied:active");
    expect(again.every((r) => r.outcome === "duplicate" || r.outcome === "applied:active")).toBe(true);
    expect(await store.listSubscriptions(u.id)).toHaveLength(1);
    const pays = await db.execute<{ n: number }>(sql.raw("select count(*)::int as n from payments"));
    expect(pays[0].n).toBe(1);
  });

  it("4. invalid signature is rejected and nothing is stored", async () => {
    const u = await userWithCheckout("forge@example.com", "sub_E");
    remoteSub("sub_E", { notes: { user_id: u.id, qualification: "cs" } });
    const r = await deliver("subscription.activated", subEvent("sub_E"), { secret: "attacker-secret" });
    expect(r).toMatchObject({ status: 400, outcome: "rejected:bad-signature" });
    expect(await plan(u.id)).toBe("FREE");
    expect((await db.execute<{ n: number }>(sql.raw("select count(*)::int as n from webhook_events")))[0].n).toBe(0);
  });

  it("5. delayed confirmation: authenticated first (no access), activated later (access)", async () => {
    const u = await userWithCheckout("slow@example.com", "sub_F");
    remoteSub("sub_F", { status: "authenticated", current_end: null, notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.authenticated", subEvent("sub_F"));
    expect(await plan(u.id)).toBe("FREE");
    remoteSub("sub_F", { notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.activated", subEvent("sub_F"));
    expect(await plan(u.id)).toBe("PRO");
  });

  it("5b. out-of-order: a stale 'activated' after cancellation cannot re-open access", async () => {
    const u = await userWithCheckout("order@example.com", "sub_G");
    remoteSub("sub_G", { status: "cancelled", ended_at: NOW - 60, current_end: NOW - 60, notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.activated", subEvent("sub_G")); // old event delivered late; API says cancelled
    expect(await plan(u.id)).toBe("FREE");
  });

  it("6a. cancel at cycle end keeps access until the paid period ends", async () => {
    const u = await userWithCheckout("cancel@example.com", "sub_H");
    remoteSub("sub_H", { status: "cancelled", ended_at: null, current_end: NOW + 10 * DAY, notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.cancelled", subEvent("sub_H"));
    const [s] = await store.listSubscriptions(u.id);
    expect(s.status).toBe("CANCELLED");
    expect(await plan(u.id)).toBe("PRO");
    expect(resolveEntitlements([s], "cs", new Date((NOW + 11 * DAY) * 1000)).plan).toBe("FREE");
  });

  it("6b. completed/expired and halted subscriptions lose access", async () => {
    const u = await userWithCheckout("end@example.com", "sub_I");
    remoteSub("sub_I", { notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.activated", subEvent("sub_I"));
    expect(await plan(u.id)).toBe("PRO");
    remoteSub("sub_I", { status: "halted", notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.halted", subEvent("sub_I"));
    expect(await plan(u.id)).toBe("FREE");
    remoteSub("sub_I", { status: "completed", ended_at: NOW, notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.completed", subEvent("sub_I"));
    expect(await plan(u.id)).toBe("FREE");
  });

  it("6c. pending renewal keeps access only until the paid period ends", async () => {
    const u = await userWithCheckout("pastdue@example.com", "sub_J");
    remoteSub("sub_J", { status: "pending", current_end: NOW + DAY, notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.pending", subEvent("sub_J"));
    const [s] = await store.listSubscriptions(u.id);
    expect(s.status).toBe("PAST_DUE");
    expect(await plan(u.id)).toBe("PRO");
    expect(resolveEntitlements([s], "cs", new Date((NOW + 2 * DAY) * 1000)).plan).toBe("FREE");
  });

  it("7. full refund removes access, cancels renewal, and later events cannot re-open it", async () => {
    const u = await userWithCheckout("refund@example.com", "sub_K");
    remoteSub("sub_K", { notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.charged", subEvent("sub_K", payment("pay_K")));
    expect(await plan(u.id)).toBe("PRO");
    const r = await deliver("refund.processed", { refund: { entity: { id: "rfnd_1", payment_id: "pay_K", amount: 32000 } }, payment: { entity: payment("pay_K", { status: "refunded", amount_refunded: 32000 }) } });
    expect(r.outcome).toBe("applied:refunded");
    expect(await plan(u.id)).toBe("FREE");
    expect(cancelled).toEqual([{ id: "sub_K", atCycleEnd: false }]);
    remoteSub("sub_K", { notes: { user_id: u.id, qualification: "cs" } }); // provider still says active
    await deliver("subscription.charged", subEvent("sub_K", payment("pay_K2")));
    expect(await plan(u.id)).toBe("FREE");
  });

  it("7b. partial refund is recorded without changing access", async () => {
    const u = await userWithCheckout("partial@example.com", "sub_L");
    remoteSub("sub_L", { notes: { user_id: u.id, qualification: "cs" } });
    await deliver("subscription.charged", subEvent("sub_L", payment("pay_L")));
    const r = await deliver("refund.processed", { refund: { entity: { id: "rfnd_2", payment_id: "pay_L", amount: 10000 } }, payment: { entity: payment("pay_L", { amount_refunded: 10000 }) } });
    expect(r.outcome).toBe("applied:partial-refund-no-access-change");
    expect(await plan(u.id)).toBe("PRO");
  });

  it("9a. a subscription we did not create at checkout can never grant Pro to anyone", async () => {
    const victim = await store.createUser({ email: "victim@example.com", name: "V", passwordHash: "scrypt$00$00", role: "USER" });
    remoteSub("sub_ROGUE", { notes: { user_id: victim.id, qualification: "cs" } });
    const r = await deliver("subscription.activated", subEvent("sub_ROGUE"));
    expect(r.outcome).toBe("ignored:unknown-subscription");
    expect(await plan(victim.id)).toBe("FREE");
  });

  it("9b. provider notes naming another user are treated as an integrity alarm, not applied", async () => {
    const owner = await userWithCheckout("owner@example.com", "sub_M");
    const other = await store.createUser({ email: "other@example.com", name: "O", passwordHash: "scrypt$00$00", role: "USER" });
    remoteSub("sub_M", { notes: { user_id: other.id, qualification: "cs" } });
    const r = await deliver("subscription.activated", subEvent("sub_M"));
    expect(r.status).toBe(200);
    expect(r.outcome).toMatch(/^error:.*do not match/);
    expect(await plan(owner.id)).toBe("FREE");
    expect(await plan(other.id)).toBe("FREE");
  });

  it("a crashed delivery is retried and applied; then duplicates are skipped", async () => {
    const u = await userWithCheckout("retry@example.com", "sub_N");
    remoteSub("sub_N", { notes: { user_id: u.id, qualification: "cs" } });
    fetchFails = true;
    expect((await deliver("subscription.activated", subEvent("sub_N"), { eventId: "evt_retry" })).status).toBe(500);
    expect(await plan(u.id)).toBe("FREE");
    fetchFails = false;
    expect((await deliver("subscription.activated", subEvent("sub_N"), { eventId: "evt_retry" })).outcome).toBe("applied:active");
    expect((await deliver("subscription.activated", subEvent("sub_N"), { eventId: "evt_retry" })).outcome).toBe("duplicate");
    expect(await plan(u.id)).toBe("PRO");
  });

  it("rejects malformed and oversized bodies", async () => {
    const big = "x".repeat(300 * 1024);
    expect((await handleRazorpayWebhook({ rawBody: big, signature: "00", eventId: "e" }, { store, api, webhookSecret: SECRET })).status).toBe(413);
    const junk = "not json";
    const sig = createHmac("sha256", SECRET).update(junk).digest("hex");
    expect((await handleRazorpayWebhook({ rawBody: junk, signature: sig, eventId: "e2" }, { store, api, webhookSecret: SECRET })).outcome).toBe("rejected:bad-json");
  });
});
