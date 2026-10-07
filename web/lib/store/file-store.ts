// Local JSON-file implementation of UserStore.
// Intended for local development and a single-machine MVP. It does NOT persist on serverless
// platforms (e.g. Vercel's read-only filesystem) — use the Postgres store there.
import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Role, Subscription } from "@/lib/entitlements/resolve";
import type { BookmarkRecord, ProgressRecord, StudyPlanRecord, UserRecord, UserStore } from "./types";

interface StoreShape {
  users: UserRecord[];
  subscriptions: Subscription[];
  bookmarks: BookmarkRecord[];
  progress: ProgressRecord[];
  studyPlans: StudyPlanRecord[];
}

const EMPTY: StoreShape = { users: [], subscriptions: [], bookmarks: [], progress: [], studyPlans: [] };

export function createFileStore(path = process.env.FILE_STORE_PATH ?? join(/*turbopackIgnore: true*/ process.cwd(), ".data", "store.json")): UserStore {
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<StoreShape> {
    try {
      return { ...EMPTY, ...JSON.parse(await readFile(/*turbopackIgnore: true*/ path, "utf8")) };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(EMPTY);
      throw e;
    }
  }

  async function save(data: StoreShape) {
    await mkdir(/*turbopackIgnore: true*/ dirname(path), { recursive: true });
    const tmp = `${path}.${process.pid}.tmp`;
    await writeFile(/*turbopackIgnore: true*/ tmp, JSON.stringify(data, null, 2));
    await rename(/*turbopackIgnore: true*/ tmp, path); // atomic replace
  }

  /** Serialise writes within this process so concurrent requests don't clobber each other. */
  function mutate<T>(fn: (d: StoreShape) => T | Promise<T>): Promise<T> {
    const run = queue.then(async () => {
      const data = await load();
      const result = await fn(data);
      await save(data);
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  }

  const now = () => new Date().toISOString();

  return {
    async findUserByEmail(email) {
      const d = await load();
      return d.users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
    },
    async findUserById(id) {
      const d = await load();
      return d.users.find((u) => u.id === id) ?? null;
    },
    createUser(input) {
      return mutate((d) => {
        const email = input.email.trim().toLowerCase();
        if (d.users.some((u) => u.email === email)) throw new Error("EMAIL_TAKEN");
        const user: UserRecord = { ...input, email, id: randomUUID(), createdAt: now() };
        d.users.push(user);
        return user;
      });
    },
    async listUsers() {
      return (await load()).users;
    },
    setRole(userId, role: Role) {
      return mutate((d) => {
        const u = d.users.find((x) => x.id === userId);
        if (!u) throw new Error("USER_NOT_FOUND");
        u.role = role;
      });
    },
    revokeSessions(userId, atUnixSeconds) {
      return mutate((d) => {
        const u = d.users.find((x) => x.id === userId);
        if (u) u.sessionsRevokedAt = atUnixSeconds;
      });
    },
    async listSubscriptions(userId) {
      return (await load()).subscriptions.filter((s) => s.userId === userId);
    },
    addSubscription(input) {
      return mutate((d) => {
        const s: Subscription = { ...input, id: randomUUID() };
        d.subscriptions.push(s);
        return s;
      });
    },
    updateSubscription(id, patch) {
      return mutate((d) => {
        const s = d.subscriptions.find((x) => x.id === id);
        if (!s) throw new Error("SUBSCRIPTION_NOT_FOUND");
        Object.assign(s, patch);
      });
    },
    async listBookmarks(userId) {
      return (await load()).bookmarks.filter((b) => b.userId === userId);
    },
    toggleBookmark(userId, questionId) {
      return mutate((d) => {
        const i = d.bookmarks.findIndex((b) => b.userId === userId && b.questionId === questionId);
        if (i >= 0) {
          d.bookmarks.splice(i, 1);
          return false;
        }
        d.bookmarks.push({ userId, questionId, createdAt: now() });
        return true;
      });
    },
    async listProgress(userId) {
      return (await load()).progress.filter((p) => p.userId === userId);
    },
    setProgress(userId, chapterId, status) {
      return mutate((d) => {
        const p = d.progress.find((x) => x.userId === userId && x.chapterId === chapterId);
        if (p) Object.assign(p, { status, updatedAt: now() });
        else d.progress.push({ userId, chapterId, status, updatedAt: now() });
      });
    },
    async getStudyPlan(userId) {
      return (await load()).studyPlans.find((p) => p.userId === userId) ?? null;
    },
    saveStudyPlan(plan) {
      return mutate((d) => {
        d.studyPlans = d.studyPlans.filter((p) => p.userId !== plan.userId);
        d.studyPlans.push(plan);
      });
    },
  };
}
