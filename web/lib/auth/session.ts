import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SESSION_COOKIE } from "./constants";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be set (at least 32 characters) in production.");
    }
    return new TextEncoder().encode("dev-only-insecure-secret-change-me-0000000000");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  issuedAt: number; // unix seconds
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Secure in production by default. COOKIE_SECURE=false is only for serving the production build over
    // plain http on a LAN (e.g. testing on a phone); browsers drop Secure cookies on non-localhost http.
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE !== "false" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  // Token expiry is checked against the current time, so this must run at request time
  // (not inside a runtime prefetch, where reading the clock is not allowed).
  await connection();
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    return typeof payload.userId === "string" && typeof payload.iat === "number" ? { userId: payload.userId, issuedAt: payload.iat } : null;
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
