import { describe, expect, it } from "vitest";
import { isSubscriptionLive, resolveEntitlements, type Subscription } from "@/lib/entitlements/resolve";

const NOW = new Date("2026-10-23T12:00:00Z");
const future = "2026-11-23T12:00:00Z";
const past = "2026-10-01T00:00:00Z";
const sub = (o: Partial<Subscription>): Subscription => ({
  id: "s1", userId: "u1", qualification: "cs", plan: "PRO", status: "ACTIVE", source: "RAZORPAY",
  startedAt: "2026-10-01T00:00:00Z", expiresAt: future, providerReference: "sub_1", ...o,
});

describe("isSubscriptionLive", () => {
  it.each([
    ["ACTIVE, paid period ahead", sub({}), true],
    ["ACTIVE admin grant, no expiry", sub({ source: "ADMIN_GRANT", expiresAt: null, providerReference: null }), true],
    ["ACTIVE but period ended", sub({ expiresAt: past }), false],
    ["PAST_DUE inside paid period", sub({ status: "PAST_DUE" }), true],
    ["PAST_DUE after period end", sub({ status: "PAST_DUE", expiresAt: past }), false],
    ["CANCELLED keeps access to period end", sub({ status: "CANCELLED", cancelAtPeriodEnd: true }), true],
    ["CANCELLED after period end", sub({ status: "CANCELLED", expiresAt: past }), false],
    ["revoked admin grant (CANCELLED, no expiry)", sub({ status: "CANCELLED", source: "ADMIN_GRANT", expiresAt: null }), false],
    ["PENDING (checkout not paid)", sub({ status: "PENDING" }), false],
    ["HALTED", sub({ status: "HALTED" }), false],
    ["EXPIRED", sub({ status: "EXPIRED" }), false],
    ["REFUNDED even inside period", sub({ status: "REFUNDED" }), false],
    ["starts in the future", sub({ startedAt: future, expiresAt: "2026-12-30T00:00:00Z" }), false],
  ])("%s", (_name, s, expected) => {
    expect(isSubscriptionLive(s, NOW)).toBe(expected);
  });
});

describe("resolveEntitlements", () => {
  it("anonymous viewers get only the free capabilities", () => {
    const e = resolveEntitlements(null, "cs");
    expect(e.plan).toBe("FREE");
    expect([...e.capabilities].sort()).toEqual(["BASIC_PYQ", "OFFICIAL_RESOURCES"]);
  });

  it("Pro is per qualification: CS Pro does not unlock CA or CMA", () => {
    const subs = [sub({ qualification: "cs" })];
    expect(resolveEntitlements(subs, "cs", NOW).plan).toBe("PRO");
    expect(resolveEntitlements(subs, "ca", NOW).plan).toBe("FREE");
    expect(resolveEntitlements(subs, "cma", NOW).plan).toBe("FREE");
  });

  it("picks the live subscription among several and exposes it", () => {
    const live = sub({ id: "live", qualification: "ca" });
    const e = resolveEntitlements([sub({ id: "old", qualification: "ca", status: "EXPIRED" }), live], "ca", NOW);
    expect(e.plan).toBe("PRO");
    expect(e.activeSubscription?.id).toBe("live");
    expect(e.capabilities.has("PYQ_ANALYTICS")).toBe(true);
  });

  it("signed-in user with no live subscription is Free", () => {
    const e = resolveEntitlements([sub({ status: "HALTED" })], "cs", NOW);
    expect(e.plan).toBe("FREE");
    expect(e.capabilities.has("BOOKMARKS")).toBe(false);
  });
});
