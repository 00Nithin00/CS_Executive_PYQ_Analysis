// PostgreSQL schema for accounts, entitlements, billing and personal data (Drizzle).
// This is the migrated schema: `npm run db:generate` writes SQL to lib/db/migrations, `npm run db:migrate` applies it.
// Research/academic tables live in ./research-schema.ts and are deliberately not migrated yet.
import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------- enums
export const qualificationEnum = pgEnum("qualification", ["cs", "ca", "cma"]);
export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);
export const planEnum = pgEnum("plan", ["FREE", "PRO"]);
/**
 * PENDING   checkout created / mandate authenticated, not yet charged — no access
 * ACTIVE    paid for the current period — access until expires_at
 * PAST_DUE  renewal charge failing, provider retrying — access until expires_at
 * HALTED    retries exhausted — no access
 * CANCELLED cancelled; access only until expires_at (a revoked admin grant has expires_at NULL → no access)
 * EXPIRED   ended (completed / expired) — no access
 * REFUNDED  refunded — no access
 */
export const subscriptionStatusEnum = pgEnum("subscription_status", ["PENDING", "ACTIVE", "PAST_DUE", "HALTED", "CANCELLED", "EXPIRED", "REFUNDED"]);
export const subscriptionSourceEnum = pgEnum("subscription_source", ["ADMIN_GRANT", "RAZORPAY", "STRIPE", "COUPON"]);
export const progressStatusEnum = pgEnum("progress_status", ["NOT_STARTED", "IN_PROGRESS", "COVERED"]);

// ---------------------------------------------------------------- accounts
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(), // stored normalised (trimmed, lower-case)
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  /** Session tokens issued before this instant are rejected (set on logout). */
  sessionsRevokedAt: timestamp("sessions_revoked_at", { withTimezone: true }),
});

// ---------------------------------------------------------------- entitlements & billing
/** One row per subscription per qualification. Pro is sold per qualification: a CS row never unlocks CA. */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    qualification: qualificationEnum("qualification").notNull(),
    plan: planEnum("plan").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    source: subscriptionSourceEnum("source").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    /** Access ends at this instant. NULL = no expiry (admin grant). For paid plans: the provider's current_end. */
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    /** Provider subscription id (e.g. Razorpay sub_…). Unique so webhook replays cannot create duplicates. */
    providerReference: text("provider_reference"),
    providerPlanId: text("provider_plan_id"),
    /** Raw provider status, kept for support/debugging. */
    providerStatus: text("provider_status"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    note: text("note"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("subscriptions_user_idx").on(t.userId),
    uniqueIndex("subscriptions_provider_ref_idx").on(t.source, t.providerReference),
  ],
);

/** Individual charges/refunds reported by the payment provider. */
export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    subscriptionId: uuid("subscription_id").references(() => subscriptions.id, { onDelete: "set null" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    provider: subscriptionSourceEnum("provider").notNull(),
    providerPaymentId: text("provider_payment_id").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    currency: text("currency").notNull(),
    status: text("status").notNull(), // captured | failed | refunded | partially_refunded
    amountRefundedPaise: integer("amount_refunded_paise").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("payments_provider_id_idx").on(t.provider, t.providerPaymentId), index("payments_subscription_idx").on(t.subscriptionId)],
);

/** Every webhook delivery we accepted. The primary key makes processing idempotent across retries. */
export const webhookEvents = pgTable("webhook_events", {
  provider: subscriptionSourceEnum("provider").notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  outcome: text("outcome"), // applied | ignored:<reason> | error:<message>
  payload: jsonb("payload").notNull(),
}, (t) => [primaryKey({ columns: [t.provider, t.eventId] })]);

// ---------------------------------------------------------------- abuse protection
/** Fixed-window counters shared by every server instance (login/sign-up throttling). */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
});

// ---------------------------------------------------------------- personal data
/** chapter_id is a taxonomy id from the repository content (validated by the server action before writing). */
export const userProgress = pgTable("user_progress", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  chapterId: text("chapter_id").notNull(),
  status: progressStatusEnum("status").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.chapterId] })]);

export const bookmarks = pgTable("bookmarks", {
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [primaryKey({ columns: [t.userId, t.questionId] })]);

export const studyPlans = pgTable("study_plans", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  examAttempt: text("exam_attempt").notNull(),
  subjects: jsonb("subjects").notNull().default(sql`'[]'::jsonb`),
  hoursPerWeek: integer("hours_per_week").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
