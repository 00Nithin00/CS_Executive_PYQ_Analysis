import type { Qualification, Role, Subscription, SubscriptionSource } from "@/lib/entitlements/resolve";

export interface UserRecord {
  id: string;
  email: string; // normalised lower-case
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  /** Unix seconds. Session tokens issued before this are rejected (set on logout = "log out everywhere"). */
  sessionsRevokedAt?: number;
}

export interface BookmarkRecord {
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface ProgressRecord {
  userId: string;
  chapterId: string; // taxonomy chapter id, e.g. CLP.L14
  status: "NOT_STARTED" | "IN_PROGRESS" | "COVERED";
  updatedAt: string;
}

export interface StudyPlanRecord {
  userId: string;
  examAttempt: string; // e.g. "2026-12"
  subjects: string[];
  hoursPerWeek: number;
  updatedAt: string;
}

/** Provider-side state of a paid subscription, as reported by a verified API call or webhook. */
export interface ProviderSubscriptionState {
  source: Exclude<SubscriptionSource, "ADMIN_GRANT" | "COUPON">;
  providerReference: string;
  userId: string;
  qualification: Qualification;
  providerPlanId: string | null;
  providerStatus: string;
  status: Subscription["status"];
  startedAt: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentRecordInput {
  provider: Exclude<SubscriptionSource, "ADMIN_GRANT" | "COUPON">;
  providerPaymentId: string;
  providerSubscriptionReference: string | null;
  amountPaise: number;
  currency: string;
  status: string;
  amountRefundedPaise: number;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
}

/**
 * Persistence boundary for accounts, entitlements, billing and personal data.
 * Implementation: Postgres via Drizzle (./pg-store.ts). Every method is scoped by user id where the data is personal.
 */
export interface UserStore {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(input: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord>;
  listUsers(): Promise<UserRecord[]>;
  setRole(userId: string, role: Role): Promise<void>;
  revokeSessions(userId: string, atUnixSeconds: number): Promise<void>;

  listSubscriptions(userId: string): Promise<Subscription[]>;
  addSubscription(input: Omit<Subscription, "id">): Promise<Subscription>;
  updateSubscription(id: string, patch: Partial<Omit<Subscription, "id" | "userId" | "qualification">>): Promise<void>;
  findSubscriptionByProviderReference(source: Subscription["source"], providerReference: string): Promise<Subscription | null>;
  /** Insert or update the row for a provider subscription. Safe to call repeatedly with the same state. */
  upsertProviderSubscription(state: ProviderSubscriptionState): Promise<Subscription>;

  /** Records a webhook delivery. Returns false when this event id was already recorded (duplicate delivery). */
  recordWebhookEvent(provider: Subscription["source"], eventId: string, eventType: string, payload: unknown): Promise<boolean>;
  /** Outcome of a previously recorded event (null outcome = recorded but not finished, e.g. the handler crashed). */
  getWebhookEvent(provider: Subscription["source"], eventId: string): Promise<{ outcome: string | null } | null>;
  markWebhookEvent(provider: Subscription["source"], eventId: string, outcome: string): Promise<void>;
  upsertPayment(input: PaymentRecordInput): Promise<void>;
  /** The provider subscription reference a recorded payment belongs to, if known. */
  findPaymentSubscriptionReference(provider: PaymentRecordInput["provider"], providerPaymentId: string): Promise<string | null>;

  /** Fixed-window counter shared by all instances. Counts this hit and reports whether it is within `limit`. */
  hitRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
  resetRateLimit(key: string): Promise<void>;

  listBookmarks(userId: string): Promise<BookmarkRecord[]>;
  toggleBookmark(userId: string, questionId: string): Promise<boolean>; // returns new state

  listProgress(userId: string): Promise<ProgressRecord[]>;
  setProgress(userId: string, chapterId: string, status: ProgressRecord["status"]): Promise<void>;

  getStudyPlan(userId: string): Promise<StudyPlanRecord | null>;
  saveStudyPlan(plan: StudyPlanRecord): Promise<void>;
}
