// Integration tests: the real Postgres store against the migrated test database.
import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resolveEntitlements } from "@/lib/entitlements/resolve";
import type { ProviderSubscriptionState } from "@/lib/store/types";
import { resetDb, testStore } from "./db";

const { db, store, close } = testStore();
beforeEach(() => resetDb(db));
afterAll(() => close());

const newUser = (email = "a@example.com") => store.createUser({ email, name: "Test User", passwordHash: "scrypt$00$00", role: "USER" });

const providerState = (userId: string, o: Partial<ProviderSubscriptionState> = {}): ProviderSubscriptionState => ({
  source: "RAZORPAY",
  providerReference: "sub_TEST1",
  userId,
  qualification: "cs",
  providerPlanId: "plan_TEST",
  providerStatus: "active",
  status: "ACTIVE",
  startedAt: "2026-10-23T00:00:00Z",
  expiresAt: "2099-01-01T00:00:00Z",
  cancelAtPeriodEnd: false,
  ...o,
});

describe("accounts", () => {
  it("creates users with normalised email and finds them by email and id", async () => {
    const u = await newUser("  Mixed@Example.COM ");
    expect(u.email).toBe("mixed@example.com");
    expect((await store.findUserByEmail("MIXED@example.com"))?.id).toBe(u.id);
    expect((await store.findUserById(u.id))?.email).toBe("mixed@example.com");
  });

  it("rejects a duplicate email regardless of case", async () => {
    await newUser("dup@example.com");
    await expect(newUser("DUP@example.com")).rejects.toThrow("EMAIL_TAKEN");
  });

  it("treats malformed ids as not found instead of erroring", async () => {
    expect(await store.findUserById("not-a-uuid'; drop table users;--")).toBeNull();
  });

  it("records session revocation as unix seconds", async () => {
    const u = await newUser();
    await store.revokeSessions(u.id, 1_800_000_000);
    expect((await store.findUserById(u.id))?.sessionsRevokedAt).toBe(1_800_000_000);
  });

  it("persists across separate connections (no per-process state)", async () => {
    const u = await newUser("persist@example.com");
    const other = testStore();
    try {
      expect((await other.store.findUserByEmail("persist@example.com"))?.id).toBe(u.id);
    } finally {
      await other.close();
    }
  });
});

describe("subscriptions", () => {
  it("admin grants are scoped to one qualification", async () => {
    const u = await newUser();
    await store.addSubscription({ userId: u.id, qualification: "ca", plan: "PRO", status: "ACTIVE", source: "ADMIN_GRANT", startedAt: new Date().toISOString(), expiresAt: null, providerReference: null });
    const subs = await store.listSubscriptions(u.id);
    expect(resolveEntitlements(subs, "ca").plan).toBe("PRO");
    expect(resolveEntitlements(subs, "cs").plan).toBe("FREE");
  });

  it("upserting the same provider state twice keeps exactly one row", async () => {
    const u = await newUser();
    await store.upsertProviderSubscription(providerState(u.id));
    await store.upsertProviderSubscription(providerState(u.id));
    expect(await store.listSubscriptions(u.id)).toHaveLength(1);
  });

  it("concurrent upserts of one provider subscription cannot create duplicates", async () => {
    const u = await newUser();
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => store.upsertProviderSubscription(providerState(u.id))));
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
    expect(await store.listSubscriptions(u.id)).toHaveLength(1);
  });

  it("status transitions update the row (active → cancelled → expired)", async () => {
    const u = await newUser();
    await store.upsertProviderSubscription(providerState(u.id));
    await store.upsertProviderSubscription(providerState(u.id, { status: "CANCELLED", providerStatus: "cancelled", cancelAtPeriodEnd: true }));
    let [s] = await store.listSubscriptions(u.id);
    expect(s.status).toBe("CANCELLED");
    expect(s.cancelAtPeriodEnd).toBe(true);
    await store.upsertProviderSubscription(providerState(u.id, { status: "EXPIRED", providerStatus: "completed", expiresAt: "2020-01-01T00:00:00Z" }));
    [s] = await store.listSubscriptions(u.id);
    expect(resolveEntitlements([s], "cs").plan).toBe("FREE");
  });

  it("a provider subscription can never be moved to another user or qualification", async () => {
    const a = await newUser("a@example.com");
    const b = await newUser("b@example.com");
    await store.upsertProviderSubscription(providerState(a.id));
    await expect(store.upsertProviderSubscription(providerState(b.id))).rejects.toThrow("PROVIDER_REFERENCE_OWNER_MISMATCH");
    await expect(store.upsertProviderSubscription(providerState(a.id, { qualification: "ca" }))).rejects.toThrow("PROVIDER_REFERENCE_OWNER_MISMATCH");
    expect(await store.listSubscriptions(b.id)).toHaveLength(0);
  });
});

describe("webhook events and payments", () => {
  it("records an event once; duplicates are reported", async () => {
    expect(await store.recordWebhookEvent("RAZORPAY", "evt_1", "subscription.charged", { a: 1 })).toBe(true);
    expect(await store.recordWebhookEvent("RAZORPAY", "evt_1", "subscription.charged", { a: 1 })).toBe(false);
  });

  it("concurrent deliveries of one event: exactly one wins", async () => {
    const wins = await Promise.all(Array.from({ length: 10 }, () => store.recordWebhookEvent("RAZORPAY", "evt_race", "x", {})));
    expect(wins.filter(Boolean)).toHaveLength(1);
  });

  it("payments upsert by provider id and link to the subscription", async () => {
    const u = await newUser();
    await store.upsertProviderSubscription(providerState(u.id));
    const p = { provider: "RAZORPAY" as const, providerPaymentId: "pay_1", providerSubscriptionReference: "sub_TEST1", amountPaise: 32000, currency: "INR", status: "captured", amountRefundedPaise: 0 };
    await store.upsertPayment(p);
    await store.upsertPayment({ ...p, status: "refunded", amountRefundedPaise: 32000 });
    const rows = await db.execute<{ status: string; user_id: string; amount_refunded_paise: number }>(sql.raw("select status, user_id, amount_refunded_paise from payments"));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ status: "refunded", user_id: u.id, amount_refunded_paise: 32000 });
  });
});

describe("rate limits", () => {
  it("allows up to the limit then blocks within the window", async () => {
    const r = [];
    for (let i = 0; i < 4; i++) r.push(await store.hitRateLimit("k", 3, 60));
    expect(r.map((x) => x.allowed)).toEqual([true, true, true, false]);
    expect(r[3].retryAfterSeconds).toBeGreaterThan(0);
  });

  it("counts concurrent hits exactly (shared across instances)", async () => {
    await Promise.all(Array.from({ length: 25 }, () => store.hitRateLimit("burst", 100, 60)));
    expect((await store.hitRateLimit("burst", 100, 60)).count).toBe(26);
  });

  it("starts a new window after it elapses, and reset clears it", async () => {
    await store.hitRateLimit("w", 1, 1);
    expect((await store.hitRateLimit("w", 1, 1)).allowed).toBe(false);
    await new Promise((r) => setTimeout(r, 1100));
    expect((await store.hitRateLimit("w", 1, 1)).allowed).toBe(true);
    await store.hitRateLimit("w", 1, 60);
    await store.resetRateLimit("w");
    expect((await store.hitRateLimit("w", 1, 60)).allowed).toBe(true);
  });
});

describe("personal data is isolated per user", () => {
  it("bookmarks toggle and never leak between users", async () => {
    const a = await newUser("a@example.com");
    const b = await newUser("b@example.com");
    expect(await store.toggleBookmark(a.id, "Q1")).toBe(true);
    expect(await store.listBookmarks(b.id)).toHaveLength(0);
    expect(await store.toggleBookmark(a.id, "Q1")).toBe(false);
    expect(await store.listBookmarks(a.id)).toHaveLength(0);
  });

  it("progress upserts per (user, chapter)", async () => {
    const a = await newUser("a@example.com");
    const b = await newUser("b@example.com");
    await store.setProgress(a.id, "CLP.L14", "IN_PROGRESS");
    await store.setProgress(a.id, "CLP.L14", "COVERED");
    expect(await store.listProgress(a.id)).toMatchObject([{ chapterId: "CLP.L14", status: "COVERED" }]);
    expect(await store.listProgress(b.id)).toHaveLength(0);
  });

  it("study plan saves and replaces", async () => {
    const a = await newUser();
    const plan = { userId: a.id, examAttempt: "2026-12", subjects: ["clp"], hoursPerWeek: 10, updatedAt: new Date().toISOString() };
    await store.saveStudyPlan(plan);
    await store.saveStudyPlan({ ...plan, hoursPerWeek: 12, subjects: ["clp", "jigl"] });
    expect(await store.getStudyPlan(a.id)).toMatchObject({ hoursPerWeek: 12, subjects: ["clp", "jigl"] });
  });
});
