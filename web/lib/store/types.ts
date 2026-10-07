import type { Role, Subscription } from "@/lib/entitlements/resolve";

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

/**
 * Persistence boundary for accounts and personal data.
 * Implementations: file store (local/dev, now) and Postgres via Drizzle (lib/db/schema.ts, later).
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
  updateSubscription(id: string, patch: Partial<Omit<Subscription, "id" | "userId">>): Promise<void>;

  listBookmarks(userId: string): Promise<BookmarkRecord[]>;
  toggleBookmark(userId: string, questionId: string): Promise<boolean>; // returns new state

  listProgress(userId: string): Promise<ProgressRecord[]>;
  setProgress(userId: string, chapterId: string, status: ProgressRecord["status"]): Promise<void>;

  getStudyPlan(userId: string): Promise<StudyPlanRecord | null>;
  saveStudyPlan(plan: StudyPlanRecord): Promise<void>;
}
