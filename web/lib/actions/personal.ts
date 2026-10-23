"use server";

// Every action re-resolves the viewer and checks capabilities itself — never trusts the client.
import { revalidatePath } from "next/cache";
import { assertCapability, EntitlementError, getViewer, requireAdmin } from "@/lib/auth/viewer";
import { isCurrentChapter, knownSubjectSlugs, questionExists } from "@/lib/data/service";
import { store } from "@/lib/store";
import type { ProgressRecord } from "@/lib/store/types";
import { isQualification, resolveEntitlements } from "@/lib/entitlements/resolve";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: "SIGNED_OUT" | "NOT_ENTITLED" | "INVALID" | "UNAVAILABLE" };

async function guard(capability: Parameters<typeof assertCapability>[1]) {
  const viewer = await getViewer();
  if (viewer.degraded) return { error: "UNAVAILABLE" as const };
  if (!viewer.user) return { error: "SIGNED_OUT" as const };
  try {
    assertCapability(viewer, capability);
  } catch (e) {
    if (e instanceof EntitlementError) return { error: "NOT_ENTITLED" as const };
    throw e;
  }
  return { viewer, userId: viewer.user.id };
}

export async function toggleBookmarkAction(questionId: string): Promise<ActionResult<{ bookmarked: boolean }>> {
  const g = await guard("BOOKMARKS");
  if ("error" in g) return { ok: false, error: g.error! };
  if (typeof questionId !== "string" || questionId.length > 80 || !(await questionExists(questionId))) return { ok: false, error: "INVALID" };
  const bookmarked = await store.toggleBookmark(g.userId, questionId);
  revalidatePath("/dashboard/bookmarks");
  return { ok: true, data: { bookmarked } };
}

const PROGRESS: ProgressRecord["status"][] = ["NOT_STARTED", "IN_PROGRESS", "COVERED"];
/** Attempts a study plan may target (the study-plan form offers exactly these). */
const PLANNABLE_ATTEMPTS = ["2026-12", "2027-06"];

export async function setProgressAction(chapterId: string, status: ProgressRecord["status"]): Promise<ActionResult> {
  const g = await guard("PROGRESS_TRACKING");
  if ("error" in g) return { ok: false, error: g.error! };
  if (typeof chapterId !== "string" || !/^[A-Z]+\.L\d{2}$/.test(chapterId) || !PROGRESS.includes(status) || !(await isCurrentChapter(chapterId))) {
    return { ok: false, error: "INVALID" };
  }
  await store.setProgress(g.userId, chapterId, status);
  revalidatePath("/dashboard/progress");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function saveStudyPlanAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const g = await guard("STUDY_PLANNER");
  if ("error" in g) return { ok: false, error: g.error! };
  const known = await knownSubjectSlugs();
  const subjects = [...new Set(form.getAll("subjects").map(String))].filter((s) => known.has(s));
  const hours = Number(form.get("hoursPerWeek"));
  const examAttempt = String(form.get("examAttempt") ?? "");
  if (!subjects.length || !Number.isFinite(hours) || hours < 1 || hours > 80 || !PLANNABLE_ATTEMPTS.includes(examAttempt)) {
    return { ok: false, error: "INVALID" };
  }
  await store.saveStudyPlan({ userId: g.userId, subjects, hoursPerWeek: Math.round(hours), examAttempt, updatedAt: new Date().toISOString() });
  revalidatePath("/dashboard/study-plan");
  return { ok: true };
}

// ---------------------------------------------------------------- admin
export interface AdminActionState {
  status: "idle" | "success" | "error";
  message: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Grant Pro as an explicit ADMIN_GRANT subscription (no expiry). requireAdmin() redirects non-admins. */
export async function grantProAction(_prev: AdminActionState, form: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const userId = String(form.get("userId") ?? "");
  if (!UUID_RE.test(userId)) return { status: "error", message: "Invalid user id." };
  const user = await store.findUserById(userId);
  if (!user) return { status: "error", message: "User not found." };
  const qualification = String(form.get("qualification") ?? "cs");
  if (!isQualification(qualification)) return { status: "error", message: "Invalid qualification." };
  if (resolveEntitlements(await store.listSubscriptions(userId), qualification).plan === "PRO") {
    return { status: "error", message: `${user.email} already has ${qualification.toUpperCase()} Pro.` };
  }
  await store.addSubscription({
    userId,
    qualification,
    plan: "PRO",
    status: "ACTIVE",
    source: "ADMIN_GRANT",
    startedAt: new Date().toISOString(),
    expiresAt: null,
    providerReference: null,
    note: `Granted by ${admin.user.email}`,
  });
  revalidatePath("/dashboard/admin");
  return { status: "success", message: `${qualification.toUpperCase()} Pro granted to ${user.email}.` };
}

/** Cancels admin grants only — paid subscriptions (when they exist) are never touched from here. */
export async function revokeProAction(_prev: AdminActionState, form: FormData): Promise<AdminActionState> {
  await requireAdmin();
  const userId = String(form.get("userId") ?? "");
  if (!UUID_RE.test(userId)) return { status: "error", message: "Invalid user id." };
  const user = await store.findUserById(userId);
  if (!user) return { status: "error", message: "User not found." };
  let n = 0;
  for (const s of await store.listSubscriptions(userId)) {
    if (s.status === "ACTIVE" && s.source === "ADMIN_GRANT") {
      await store.updateSubscription(s.id, { status: "CANCELLED" });
      n++;
    }
  }
  revalidatePath("/dashboard/admin");
  return n
    ? { status: "success", message: `Pro revoked for ${user.email}. Takes effect on their next request.` }
    : { status: "error", message: `${user.email} has no active admin grant to revoke.` };
}
