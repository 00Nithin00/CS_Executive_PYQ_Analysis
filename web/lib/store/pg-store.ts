// Postgres implementation of UserStore (Drizzle). The only store used in development, tests and production.
import "server-only";
import { and, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { bookmarks, payments, rateLimits, studyPlans, subscriptions, userProgress, users, webhookEvents } from "@/lib/db/schema";
import type { Role, Subscription } from "@/lib/entitlements/resolve";
import type { UserRecord, UserStore } from "./types";

const iso = (d: Date | null) => (d ? d.toISOString() : null);
const date = (s: string | null | undefined) => (s ? new Date(s) : null);

type UserRow = typeof users.$inferSelect;
type SubRow = typeof subscriptions.$inferSelect;

const toUser = (r: UserRow): UserRecord => ({
  id: r.id,
  email: r.email,
  name: r.name,
  passwordHash: r.passwordHash,
  role: r.role,
  createdAt: r.createdAt.toISOString(),
  ...(r.sessionsRevokedAt ? { sessionsRevokedAt: Math.floor(r.sessionsRevokedAt.getTime() / 1000) } : {}),
});

const toSub = (r: SubRow): Subscription => ({
  id: r.id,
  userId: r.userId,
  qualification: r.qualification,
  plan: r.plan,
  status: r.status,
  source: r.source,
  startedAt: r.startedAt.toISOString(),
  expiresAt: iso(r.expiresAt),
  providerReference: r.providerReference,
  providerPlanId: r.providerPlanId,
  providerStatus: r.providerStatus,
  cancelAtPeriodEnd: r.cancelAtPeriodEnd,
  note: r.note,
});

const isUniqueViolation = (e: unknown) => {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
};

export function createPgStore(db: Db): UserStore {
  const store: UserStore = {
    async findUserByEmail(email) {
      const [r] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
      return r ? toUser(r) : null;
    },
    async findUserById(id) {
      // Session payloads are attacker-controlled input until verified; reject non-UUIDs before they reach Postgres.
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      const [r] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return r ? toUser(r) : null;
    },
    async createUser(input) {
      try {
        const [r] = await db
          .insert(users)
          .values({ email: input.email.trim().toLowerCase(), name: input.name, passwordHash: input.passwordHash, role: input.role })
          .returning();
        return toUser(r);
      } catch (e) {
        if (isUniqueViolation(e)) throw new Error("EMAIL_TAKEN");
        throw e;
      }
    },
    async listUsers() {
      return (await db.select().from(users).orderBy(users.createdAt)).map(toUser);
    },
    async setRole(userId, role: Role) {
      const r = await db.update(users).set({ role }).where(eq(users.id, userId)).returning({ id: users.id });
      if (!r.length) throw new Error("USER_NOT_FOUND");
    },
    async revokeSessions(userId, atUnixSeconds) {
      await db.update(users).set({ sessionsRevokedAt: new Date(atUnixSeconds * 1000) }).where(eq(users.id, userId));
    },

    async listSubscriptions(userId) {
      return (await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(subscriptions.startedAt)).map(toSub);
    },
    async addSubscription(input) {
      const [r] = await db
        .insert(subscriptions)
        .values({
          userId: input.userId,
          qualification: input.qualification,
          plan: input.plan,
          status: input.status,
          source: input.source,
          startedAt: new Date(input.startedAt),
          expiresAt: date(input.expiresAt),
          providerReference: input.providerReference,
          providerPlanId: input.providerPlanId ?? null,
          providerStatus: input.providerStatus ?? null,
          cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
          note: input.note ?? null,
        })
        .returning();
      return toSub(r);
    },
    async updateSubscription(id, patch) {
      const set: Partial<typeof subscriptions.$inferInsert> = { updatedAt: new Date() };
      if (patch.plan) set.plan = patch.plan;
      if (patch.status) set.status = patch.status;
      if (patch.source) set.source = patch.source;
      if (patch.startedAt) set.startedAt = new Date(patch.startedAt);
      if (patch.expiresAt !== undefined) set.expiresAt = date(patch.expiresAt);
      if (patch.providerReference !== undefined) set.providerReference = patch.providerReference;
      if (patch.providerPlanId !== undefined) set.providerPlanId = patch.providerPlanId;
      if (patch.providerStatus !== undefined) set.providerStatus = patch.providerStatus;
      if (patch.cancelAtPeriodEnd !== undefined) set.cancelAtPeriodEnd = patch.cancelAtPeriodEnd;
      if (patch.note !== undefined) set.note = patch.note;
      const r = await db.update(subscriptions).set(set).where(eq(subscriptions.id, id)).returning({ id: subscriptions.id });
      if (!r.length) throw new Error("SUBSCRIPTION_NOT_FOUND");
    },
    async findSubscriptionByProviderReference(source, providerReference) {
      const [r] = await db
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.source, source), eq(subscriptions.providerReference, providerReference)))
        .limit(1);
      return r ? toSub(r) : null;
    },
    async upsertProviderSubscription(s) {
      return db.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(subscriptions)
          .where(and(eq(subscriptions.source, s.source), eq(subscriptions.providerReference, s.providerReference)))
          .for("update")
          .limit(1);
        // A provider subscription belongs to exactly one user and qualification, forever.
        if (existing && (existing.userId !== s.userId || existing.qualification !== s.qualification)) {
          throw new Error("PROVIDER_REFERENCE_OWNER_MISMATCH");
        }
        const values = {
          status: s.status,
          providerStatus: s.providerStatus,
          providerPlanId: s.providerPlanId,
          expiresAt: date(s.expiresAt),
          cancelAtPeriodEnd: s.cancelAtPeriodEnd,
          updatedAt: new Date(),
          ...(s.startedAt ? { startedAt: new Date(s.startedAt) } : {}),
        };
        if (existing) {
          const [r] = await tx.update(subscriptions).set(values).where(eq(subscriptions.id, existing.id)).returning();
          return toSub(r);
        }
        const [r] = await tx
          .insert(subscriptions)
          .values({ ...values, userId: s.userId, qualification: s.qualification, plan: "PRO", source: s.source, providerReference: s.providerReference })
          .returning();
        return toSub(r);
      });
    },

    async recordWebhookEvent(provider, eventId, eventType, payload) {
      const r = await db
        .insert(webhookEvents)
        .values({ provider, eventId, eventType, payload: payload as object })
        .onConflictDoNothing()
        .returning({ eventId: webhookEvents.eventId });
      return r.length === 1;
    },
    async getWebhookEvent(provider, eventId) {
      const [r] = await db
        .select({ outcome: webhookEvents.outcome })
        .from(webhookEvents)
        .where(and(eq(webhookEvents.provider, provider), eq(webhookEvents.eventId, eventId)))
        .limit(1);
      return r ?? null;
    },
    async markWebhookEvent(provider, eventId, outcome) {
      await db
        .update(webhookEvents)
        .set({ processedAt: new Date(), outcome: outcome.slice(0, 500) })
        .where(and(eq(webhookEvents.provider, provider), eq(webhookEvents.eventId, eventId)));
    },
    async upsertPayment(p) {
      const sub = p.providerSubscriptionReference ? await store.findSubscriptionByProviderReference(p.provider, p.providerSubscriptionReference) : null;
      await db
        .insert(payments)
        .values({
          provider: p.provider,
          providerPaymentId: p.providerPaymentId,
          subscriptionId: sub?.id ?? null,
          userId: sub?.userId ?? null,
          amountPaise: p.amountPaise,
          currency: p.currency,
          status: p.status,
          amountRefundedPaise: p.amountRefundedPaise,
        })
        .onConflictDoUpdate({
          target: [payments.provider, payments.providerPaymentId],
          set: { status: p.status, amountRefundedPaise: p.amountRefundedPaise, updatedAt: new Date(), ...(sub ? { subscriptionId: sub.id, userId: sub.userId } : {}) },
        });
    },

    async findPaymentSubscriptionReference(provider, providerPaymentId) {
      const [r] = await db
        .select({ ref: subscriptions.providerReference })
        .from(payments)
        .innerJoin(subscriptions, eq(payments.subscriptionId, subscriptions.id))
        .where(and(eq(payments.provider, provider), eq(payments.providerPaymentId, providerPaymentId)))
        .limit(1);
      return r?.ref ?? null;
    },

    async hitRateLimit(key, limit, windowSeconds) {
      const rows = await db.execute<{ count: number; window_started_at: Date }>(sql`
        insert into ${rateLimits} (key, count, window_started_at) values (${key}, 1, now())
        on conflict (key) do update set
          count = case when ${rateLimits.windowStartedAt} <= now() - make_interval(secs => ${windowSeconds}) then 1 else ${rateLimits.count} + 1 end,
          window_started_at = case when ${rateLimits.windowStartedAt} <= now() - make_interval(secs => ${windowSeconds}) then now() else ${rateLimits.windowStartedAt} end
        returning count, window_started_at`);
      const row = rows[0];
      const started = new Date(row.window_started_at).getTime();
      const retryAfterSeconds = Math.max(0, Math.ceil((started + windowSeconds * 1000 - Date.now()) / 1000));
      return { allowed: row.count <= limit, count: row.count, retryAfterSeconds };
    },
    async resetRateLimit(key) {
      await db.delete(rateLimits).where(eq(rateLimits.key, key));
    },

    async listBookmarks(userId) {
      const rows = await db.select().from(bookmarks).where(eq(bookmarks.userId, userId)).orderBy(bookmarks.createdAt);
      return rows.map((r) => ({ userId: r.userId, questionId: r.questionId, createdAt: r.createdAt.toISOString() }));
    },
    async toggleBookmark(userId, questionId) {
      const removed = await db
        .delete(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.questionId, questionId)))
        .returning({ q: bookmarks.questionId });
      if (removed.length) return false;
      await db.insert(bookmarks).values({ userId, questionId }).onConflictDoNothing();
      return true;
    },

    async listProgress(userId) {
      const rows = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
      return rows.map((r) => ({ userId: r.userId, chapterId: r.chapterId, status: r.status, updatedAt: r.updatedAt.toISOString() }));
    },
    async setProgress(userId, chapterId, status) {
      await db
        .insert(userProgress)
        .values({ userId, chapterId, status })
        .onConflictDoUpdate({ target: [userProgress.userId, userProgress.chapterId], set: { status, updatedAt: new Date() } });
    },

    async getStudyPlan(userId) {
      const [r] = await db.select().from(studyPlans).where(eq(studyPlans.userId, userId)).limit(1);
      return r
        ? { userId: r.userId, examAttempt: r.examAttempt, subjects: r.subjects as string[], hoursPerWeek: r.hoursPerWeek, updatedAt: r.updatedAt.toISOString() }
        : null;
    },
    async saveStudyPlan(plan) {
      const values = { examAttempt: plan.examAttempt, subjects: plan.subjects, hoursPerWeek: plan.hoursPerWeek, updatedAt: new Date(plan.updatedAt) };
      await db
        .insert(studyPlans)
        .values({ userId: plan.userId, ...values })
        .onConflictDoUpdate({ target: studyPlans.userId, set: values });
    },
  };
  return store;
}
