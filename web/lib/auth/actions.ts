"use server";

import { redirect } from "next/navigation";
import { store } from "@/lib/store";
import { safeNextPath } from "./redirect";
import { hashPassword, verifyPassword } from "./password";
import { clientIp, loginThrottle, signupThrottle } from "./throttle";
import { createSession, destroySession, readSession } from "./session";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
  values?: { name?: string; email?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Upper bounds keep scrypt work and stored data bounded (a megabyte "password" would otherwise be hashed).
const LIMITS = { name: 80, email: 254, passwordMin: 8, passwordMax: 128 } as const;

const safeNext = (next: FormDataEntryValue | null) => safeNextPath(next);

export async function signupAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = String(form.get("name") ?? "").replace(/\s+/g, " ").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (name.length < 2 || name.length > LIMITS.name) fieldErrors.name = `Please enter your name (up to ${LIMITS.name} characters).`;
  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < LIMITS.passwordMin) fieldErrors.password = `Use at least ${LIMITS.passwordMin} characters.`;
  else if (password.length > LIMITS.passwordMax) fieldErrors.password = `Use at most ${LIMITS.passwordMax} characters.`;
  if (Object.keys(fieldErrors).length) return { fieldErrors, values: { name, email } };
  if (!(await signupThrottle.attempt(await clientIp()))) {
    return { error: "Too many sign-ups from this network. Please try again in an hour.", values: { name, email } };
  }

  try {
    const user = await store.createUser({ name, email, passwordHash: await hashPassword(password), role: "USER" });
    await createSession(user.id);
  } catch (e) {
    if (e instanceof Error && e.message === "EMAIL_TAKEN") {
      return { fieldErrors: { email: "An account with this email already exists." }, values: { name, email } };
    }
    throw e;
  }
  redirect(safeNext(form.get("next")));
}

export async function loginAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, LIMITS.email);
  const password = String(form.get("password") ?? "");
  if (password.length > LIMITS.passwordMax) return { error: "That email and password don't match an account.", values: { email } };
  if (!(await loginThrottle.attempt(email, await clientIp()))) {
    return { error: "Too many failed attempts for this account. Please wait 15 minutes and try again.", values: { email } };
  }
  const user = email ? await store.findUserByEmail(email) : null;
  // Same message for unknown email and wrong password.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "That email and password don't match an account.", values: { email } };
  }
  await loginThrottle.reset(email);
  await createSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logoutAction() {
  // Invalidate every token issued so far for this user (not just this browser's cookie).
  const session = await readSession();
  if (session) await store.revokeSessions(session.userId, Math.floor(Date.now() / 1000));
  await destroySession();
  redirect("/");
}
