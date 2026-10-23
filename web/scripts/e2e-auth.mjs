// End-to-end account journey against a RUNNING production build, through the real sign-up/login forms.
// Proves persistence across a server restart by being run in two phases:
//
//   PHASE=1 BASE=http://localhost:3311 DATABASE_URL=<audit db> npm run e2e:auth   # sign up, invalid inputs, isolation
//   (restart the server)
//   PHASE=2 BASE=http://localhost:3311 DATABASE_URL=<audit db> npm run e2e:auth   # log in again from a fresh "browser"
//
// Exit code 1 if any check fails.
import { readFileSync, writeFileSync } from "node:fs";
import postgres from "postgres";

const BASE = process.env.BASE ?? "http://localhost:3311";
const PHASE = process.env.PHASE ?? "1";
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL || !/audit|test/.test(new URL(DB_URL).pathname)) throw new Error("DATABASE_URL must point at an isolated audit/test database.");
const sql = postgres(DB_URL, { max: 1, prepare: false, onnotice: () => {} });
const STATE = new URL("../.e2e-auth-state.json", import.meta.url);

const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};

const manifest = JSON.parse(readFileSync(new URL("../.next/server/server-reference-manifest.json", import.meta.url), "utf8")).node;
const actionId = (name) => Object.entries(manifest).find(([, v]) => v.exportedName === name)?.[0];

/** Submits an auth form exactly as the browser does (useActionState: [prevState, FormData]). Each call is a fresh "browser" unless a cookie is passed. */
async function submit(action, page, fields, { cookie, ip } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(`_1_${k}`, v);
  fd.set("0", JSON.stringify([{}, "$K1"]));
  const r = await fetch(BASE + page, {
    method: "POST",
    redirect: "manual",
    headers: { "Next-Action": actionId(action), Origin: BASE, ...(cookie ? { cookie } : {}), ...(ip ? { "x-real-ip": ip } : {}) },
    body: fd,
  });
  const setCookie = r.headers.get("set-cookie") ?? "";
  const session = /cse_session=([^;]+)/.exec(setCookie)?.[1];
  return { status: r.status, body: await r.text(), session: session ? `cse_session=${session}` : null };
}
const page = async (path, cookie) => {
  const r = await fetch(BASE + path, { redirect: "manual", headers: cookie ? { cookie } : {} });
  return { status: r.status, location: r.headers.get("location"), body: await r.text() };
};
const signedIn = (r) => r.status === 200 && r.body.includes("Hello,");

try {
  if (PHASE === "1") {
    const email = `e2e-${Date.now()}@example.com`;
    const password = "correct-horse-42";
    const ip = `10.0.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

    // invalid inputs are rejected with field errors and create nothing
    const bad = await submit("signupAction", "/signup", { name: "A", email: "not-an-email", password: "short" }, { ip });
    check("[signup] invalid name/email/password rejected", !bad.session && /valid email/.test(bad.body) && /at least 8/.test(bad.body));
    const long = await submit("signupAction", "/signup", { name: "Long Pw", email: `x${email}`, password: "p".repeat(129) }, { ip });
    check("[signup] over-long password rejected", !long.session && /at most 128/.test(long.body));
    check("[signup] nothing stored for rejected sign-ups", Number((await sql`select count(*)::int n from users where email like ${"%" + email}`)[0].n) === 0);

    // real sign-up through the form
    const up = await submit("signupAction", "/signup", { name: "E2E Student", email: email.toUpperCase(), password }, { ip });
    check("[signup] valid sign-up sets a session cookie", !!up.session, `status ${up.status}`);
    const [row] = await sql`select id, email, password_hash from users where email = ${email}`;
    check("[signup] account stored in Postgres with normalised email and scrypt hash", !!row && row.password_hash.startsWith("scrypt$") && !row.password_hash.includes(password));
    check("[session] new session opens the dashboard", signedIn(await page("/dashboard", up.session)));
    check("[session] refresh keeps the session", signedIn(await page("/dashboard", up.session)));

    const dup = await submit("signupAction", "/signup", { name: "Again", email, password }, { ip });
    check("[signup] duplicate email rejected without a session", !dup.session && /already exists/.test(dup.body));

    // separate browser: no cookie → no access; logging in there works
    check("[browser-2] no cookie → redirected to login", (await page("/dashboard")).status === 307);
    const wrong = await submit("loginAction", "/login", { email, password: "wrong-password" }, { ip });
    check("[login] wrong password refused with a generic message", !wrong.session && /don't match an account/.test(wrong.body));
    const ghost = await submit("loginAction", "/login", { email: `nobody-${email}`, password }, { ip });
    check("[login] unknown email gets the same generic message", !ghost.session && /don't match an account/.test(ghost.body));
    const b2 = await submit("loginAction", "/login", { email, password }, { ip });
    check("[browser-2] login from a second browser works", !!b2.session && signedIn(await page("/dashboard", b2.session)));

    // user isolation: a second account sees only its own data
    const other = await submit("signupAction", "/signup", { name: "Other Student", email: `other-${email}`, password }, { ip });
    const otherDash = await page("/dashboard/account", other.session);
    check("[isolation] second account sees its own email, never the first's", otherDash.body.includes(`other-${email}`) && !otherDash.body.includes(`>${email}<`));

    // sign-up rate limit per IP (20/hour; earlier attempts from this IP also count)
    let limited = false;
    for (let i = 0; i < 25 && !limited; i++) {
      const r = await submit("signupAction", "/signup", { name: "Spam", email: `spam${i}-${email}`, password }, { ip });
      limited = /Too many sign-ups/.test(r.body);
    }
    check("[abuse] sign-up rate limit per IP engages", limited);

    writeFileSync(STATE, JSON.stringify({ email, password, ip, oldSession: up.session }));
  } else {
    const { email, password, oldSession } = JSON.parse(readFileSync(STATE, "utf8"));
    check("[persistence] session issued before restart still valid after restart", signedIn(await page("/dashboard", oldSession)));
    const again = await submit("loginAction", "/login", { email, password }, { ip: "10.9.9.9" });
    check("[persistence] account survives restart: login works", !!again.session && signedIn(await page("/dashboard", again.session)));
    // logout from one browser revokes every browser
    await fetch(BASE + "/dashboard/account", { method: "POST", redirect: "manual", headers: { "Next-Action": actionId("logoutAction"), Origin: BASE, "Content-Type": "text/plain;charset=UTF-8", cookie: again.session }, body: "[]" });
    await new Promise((r) => setTimeout(r, 50));
    check("[logout] logging out revokes the other browser's older session", !signedIn(await page("/dashboard", oldSession)));
  }
} finally {
  await sql.end({ timeout: 5 });
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} e2e auth checks passed (phase ${PHASE})`);
process.exit(failed.length ? 1 : 0);
