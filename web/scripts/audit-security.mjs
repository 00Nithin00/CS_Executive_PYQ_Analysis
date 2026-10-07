// Adversarial entitlement / auth audit against a RUNNING production server.
//
//   npm run build
//   FILE_STORE_PATH=/tmp/audit-store.json AUTH_SECRET=<32+ chars> PORT=3311 npm start &
//   FILE_STORE_PATH=/tmp/audit-store.json AUTH_SECRET=<same> BASE=http://localhost:3311 node scripts/audit-security.mjs
//
// The script provisions users directly in the (isolated!) file store, mints sessions with the
// server's secret, then tries to obtain Pro data / Pro writes / admin writes as each identity,
// including by invoking server actions directly by ID. Exit code 1 if any test fails.
import { SignJWT } from "jose";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3311";
const STORE = process.env.FILE_STORE_PATH;
const SECRET = process.env.AUTH_SECRET;
if (!STORE || !SECRET) throw new Error("Set FILE_STORE_PATH and AUTH_SECRET to the values the server was started with.");
if (!STORE.includes("audit") && !STORE.includes("tmp")) throw new Error("Refusing to touch a store path that does not look isolated (must contain 'audit' or 'tmp').");

// ---------------------------------------------------------------- fixtures
const load = () => (existsSync(STORE) ? JSON.parse(readFileSync(STORE, "utf8")) : { users: [], subscriptions: [], bookmarks: [], progress: [], studyPlans: [] });
const save = (d) => writeFileSync(STORE, JSON.stringify(d, null, 2));
function user(email, role = "USER") {
  const d = load();
  let u = d.users.find((x) => x.email === email);
  if (!u) {
    const salt = randomBytes(16);
    u = { id: randomUUID(), email, name: email.split("@")[0], passwordHash: `scrypt$${salt.toString("hex")}$${scryptSync("pw-123456", salt, 64).toString("hex")}`, role, createdAt: new Date().toISOString() };
    d.users.push(u);
    save(d);
  }
  return u;
}
function grant(u) {
  const d = load();
  d.subscriptions.push({ id: randomUUID(), userId: u.id, plan: "PRO", status: "ACTIVE", source: "ADMIN_GRANT", startedAt: new Date(Date.now() - 1000).toISOString(), expiresAt: null, providerReference: null });
  save(d);
}
const key = new TextEncoder().encode(SECRET);
const mint = (claims, exp = "1h", k = key) => new SignJWT(claims).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(exp).sign(k);

const free = user("audit-free@example.com");
const pro = user("audit-pro@example.com");
const admin = user("audit-admin@example.com", "ADMIN");
const victim = user("audit-victim@example.com");
if (!load().subscriptions.some((s) => s.userId === pro.id && s.status === "ACTIVE")) grant(pro);

const tok = {
  anon: null,
  free: await mint({ userId: free.id }),
  pro: await mint({ userId: pro.id }),
  admin: await mint({ userId: admin.id }),
};
const forged = {
  wrongSecret: await mint({ userId: pro.id }, "1h", new TextEncoder().encode("x".repeat(40))),
  algNone: `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from(JSON.stringify({ userId: pro.id })).toString("base64url")}.`,
  expired: await new SignJWT({ userId: pro.id }).setProtectedHeader({ alg: "HS256" }).setIssuedAt(1).setExpirationTime(2).sign(key),
  ghostUser: await mint({ userId: randomUUID() }),
  malformed: "not-a-jwt",
  tamperedPayload: (() => {
    const [h, , s] = tok.free.split(".");
    return `${h}.${Buffer.from(JSON.stringify({ userId: pro.id, iat: 1, exp: 9999999999 })).toString("base64url")}.${s}`;
  })(),
};

// ---------------------------------------------------------------- helpers
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
};
async function get(path, token, extraHeaders = {}) {
  const r = await fetch(BASE + path, { redirect: "manual", headers: { ...(token ? { cookie: `cse_session=${token}` } : {}), ...extraHeaders } });
  return { status: r.status, location: r.headers.get("location"), body: await r.text() };
}
// Strings that only appear in Pro payloads/markup.
// (The coverage grid's aria-label is the rendered-analytics marker; the lock panel reuses the visible title, so match the attribute.)
const PRO_MARKERS = ["repeatStatus", "previousAppearances", "marksByAttempt", "repeatBreakdown", "recurringConcepts", 'aria-label="Topic coverage by attempt"', "\"priority\":", "conceptKey"];
const leaks = (body) => PRO_MARKERS.filter((m) => body.includes(m));
const redirectedToLogin = (r) => (r.status >= 300 && r.status < 400 && /\/login/.test(r.location ?? "")) || /NEXT_REDIRECT;[a-z]+;\/login/.test(r.body);
const redirectedTo = (r, path) => (r.status >= 300 && r.status < 400 && (r.location ?? "").includes(path)) || r.body.includes(`;${path};`);

const manifest = JSON.parse(readFileSync(new URL("../.next/server/server-reference-manifest.json", import.meta.url), "utf8")).node;
const actionId = (name) => Object.entries(manifest).find(([, v]) => v.exportedName === name)?.[0];
async function callAction(name, args, token, { page = "/", origin = BASE } = {}) {
  const r = await fetch(BASE + page, {
    method: "POST",
    redirect: "manual",
    headers: { "Next-Action": actionId(name), "Content-Type": "text/plain;charset=UTF-8", Origin: origin, ...(token ? { cookie: `cse_session=${token}` } : {}) },
    body: JSON.stringify(args),
  });
  return { status: r.status, body: await r.text(), location: r.headers.get("location") };
}
// useActionState-style call: args = [prevState, FormData], encoded exactly as React does (captured from a real browser):
// chunk "0" = [prevState, "$K1"], form entries under the "_1_" prefix.
async function callFormAction(name, fields, token, { page = "/dashboard/admin", origin = BASE, prev = { status: "idle", message: "" } } = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(`_1_${k}`, v);
  fd.set("0", JSON.stringify([prev, "$K1"])); // must come last: the streaming decoder resolves $K1 from entries already received
  const r = await fetch(BASE + page, { method: "POST", redirect: "manual", headers: { "Next-Action": actionId(name), Origin: origin, ...(token ? { cookie: `cse_session=${token}` } : {}) }, body: fd });
  return { status: r.status, body: await r.text(), location: r.headers.get("location") };
}
const subs = (u) => load().subscriptions.filter((s) => s.userId === u.id && s.status === "ACTIVE" && s.plan === "PRO").length;

// ---------------------------------------------------------------- 1. read paths
const PUBLIC_PRO_PAGES = ["/", "/subjects/clp", "/pyq", "/pyq/clp", "/subjects", "/papers", "/resources", "/pricing"];
for (const who of ["anon", "free"]) {
  for (const p of PUBLIC_PRO_PAGES) {
    const r = await get(p, tok[who]);
    const l = leaks(r.body);
    check(`[read] ${who} ${p} has no Pro fields`, r.status === 200 && l.length === 0, l.join(",") || `status ${r.status}`);
  }
  for (const p of ["/pyq/clp?advanced=1&plan=PRO&state=pro&capabilities=REPEAT_ANALYSIS", "/subjects/clp?pro=true&viewer=pro"]) {
    const r = await get(p, tok[who]);
    check(`[query-param] ${who} ${p.split("?")[0]} with spoofed params has no Pro fields`, leaks(r.body).length === 0, leaks(r.body).join(","));
  }
  // RSC payload route (client navigation format)
  const rsc = await get("/pyq/clp", tok[who], { RSC: "1" });
  check(`[rsc] ${who} /pyq/clp RSC payload has no Pro fields`, leaks(rsc.body).length === 0, leaks(rsc.body).join(","));
}
for (const p of ["/dashboard", "/dashboard/pyq", "/dashboard/bookmarks", "/dashboard/progress", "/dashboard/study-plan", "/dashboard/account", "/dashboard/admin"]) {
  const r = await get(p, null);
  check(`[route] anon ${p} redirected to login`, redirectedToLogin(r), `status ${r.status} → ${r.location}`);
}
for (const p of ["/dashboard/pyq", "/dashboard/bookmarks", "/dashboard/progress", "/dashboard/study-plan"]) {
  const r = await get(p, tok.free);
  check(`[route] free ${p} gated, no Pro fields`, r.body.includes("Available with Pro") && leaks(r.body).length === 0, leaks(r.body).join(","));
}
{
  const r = await get("/dashboard/admin", tok.free);
  check("[admin] free cannot open /dashboard/admin", redirectedTo(r, "/dashboard") && !r.body.includes("audit-victim@example.com"));
  const r2 = await get("/dashboard/admin", tok.pro);
  check("[admin] pro (non-admin) cannot open /dashboard/admin", !r2.body.includes("audit-victim@example.com"));
  const r3 = await get("/dashboard/admin", tok.admin);
  check("[admin] admin can open /dashboard/admin", r3.body.includes("audit-victim@example.com"));
}
{
  const r = await get("/pyq/clp", tok.pro);
  check("[read] pro /pyq/clp receives Pro fields", r.body.includes("repeatStatus") && r.body.includes("previousAppearances"));
  const r2 = await get("/subjects/clp", tok.pro);
  check("[read] pro /subjects/clp receives analytics", r2.body.includes('aria-label="Topic coverage by attempt"'));
  const r3 = await get("/subjects/clp", tok.admin);
  check("[read] admin without Pro subscription is treated as Free for Pro data", leaks(r3.body).length === 0, "admin role grants admin pages, not Pro data");
}

// ---------------------------------------------------------------- 2. forged sessions
for (const [name, t] of Object.entries(forged)) {
  const r = await get("/pyq/clp", t);
  const d = await get("/dashboard", t);
  check(`[session] forged cookie (${name}) gets no Pro fields`, leaks(r.body).length === 0, leaks(r.body).join(","));
  check(`[session] forged cookie (${name}) cannot open dashboard`, redirectedToLogin(d) || !d.body.includes("Hello,"));
}

// ---------------------------------------------------------------- 3. direct server-action invocation
{
  const qid = "EP-2022-522-202606-Q2-a";
  for (const who of ["anon", "free"]) {
    const r = await callAction("toggleBookmarkAction", [qid], tok[who], { page: "/pyq/clp" });
    const u = who === "free" ? free : null;
    const stored = u ? load().bookmarks.filter((b) => b.userId === u.id).length : 0;
    check(`[action] ${who} toggleBookmarkAction refused`, /SIGNED_OUT|NOT_ENTITLED/.test(r.body) && stored === 0, r.body.slice(0, 80).replace(/\s+/g, " "));
    const p = await callAction("setProgressAction", ["CLP.L14", "COVERED"], tok[who], { page: "/dashboard/progress" });
    const pStored = who === "free" ? load().progress.filter((x) => x.userId === free.id).length : 0;
    check(`[action] ${who} setProgressAction refused`, (/SIGNED_OUT|NOT_ENTITLED/.test(p.body) || redirectedToLogin(p)) && pStored === 0, (p.location ?? p.body.slice(0, 80)).replace(/\s+/g, " "));
    // same action posted to a public page (bypasses the /dashboard proxy entirely)
    const p2 = await callAction("setProgressAction", ["CLP.L14", "COVERED"], tok[who], { page: "/" });
    const p2Stored = who === "free" ? load().progress.filter((x) => x.userId === free.id).length : 0;
    check(`[action] ${who} setProgressAction via public route refused`, !/"ok":true/.test(p2.body) && p2Stored === 0, `status ${p2.status} ${p2.body.slice(0, 80).replace(/\s+/g, " ")}`);
  }
  const ok = await callAction("toggleBookmarkAction", [qid], tok.pro, { page: "/pyq/clp" });
  check("[action] pro toggleBookmarkAction allowed", /"ok":true/.test(ok.body));
  const bad = await callAction("toggleBookmarkAction", ["../../etc/passwd"], tok.pro, { page: "/pyq/clp" });
  check("[action] pro toggleBookmarkAction rejects unknown question id", /INVALID/.test(bad.body), bad.body.slice(0, 80));
  const badCh = await callAction("setProgressAction", ["CLP.L99", "COVERED"], tok.pro, { page: "/dashboard/progress" });
  check("[action] pro setProgressAction rejects unknown chapter", /INVALID/.test(badCh.body), badCh.body.slice(0, 80));
  const cross = await callAction("toggleBookmarkAction", [qid], tok.pro, { page: "/pyq/clp", origin: "https://evil.example" });
  check("[csrf] cross-origin server-action call rejected", cross.status >= 400 || !/"ok":true/.test(cross.body), `status ${cross.status}`);
}
for (const who of ["anon", "free", "pro"]) {
  const before = subs(victim);
  await callFormAction("grantProAction", { userId: victim.id }, tok[who]);
  check(`[admin-action] ${who} cannot grant Pro`, subs(victim) === before, `active PRO subs ${before} → ${subs(victim)}`);
  const selfBefore = who === "free" ? subs(free) : 0;
  if (who === "free") {
    await callFormAction("grantProAction", { userId: free.id }, tok.free);
    check("[admin-action] free cannot grant Pro to self", subs(free) === selfBefore);
  }
}
{
  const g = await callFormAction("grantProAction", { userId: victim.id }, tok.admin);
  check("[admin-action] admin can grant Pro", subs(victim) === 1 && g.body.includes("Pro granted"), `active PRO subs = ${subs(victim)} · ${g.status} ${g.body.slice(0, 160).replace(/\s+/g, " ")}`);
  const victimTok = await mint({ userId: victim.id });
  const r1 = await get("/pyq/clp", victimTok);
  check("[revoke] granted user sees Pro data", r1.body.includes("repeatStatus"));
  for (const who of ["anon", "free"]) {
    await callFormAction("revokeProAction", { userId: victim.id }, tok[who]);
    check(`[admin-action] ${who} cannot revoke Pro`, subs(victim) === 1);
  }
  await callFormAction("revokeProAction", { userId: victim.id }, tok.admin);
  const r2 = await get("/pyq/clp", victimTok);
  check("[revoke] revoke removes Pro on the very next request (same session)", subs(victim) === 0 && leaks(r2.body).length === 0, leaks(r2.body).join(","));
  const badId = await callFormAction("grantProAction", { userId: "not-a-uuid'; DROP" }, tok.admin);
  check("[admin-action] grant with invalid user id is rejected with a clear error", load().subscriptions.every((s) => s.userId !== "not-a-uuid'; DROP") && badId.body.includes("Invalid user id"), `status ${badId.status}`);
  const ghost = await callFormAction("grantProAction", { userId: randomUUID() }, tok.admin);
  check("[admin-action] grant for unknown user reports 'User not found'", ghost.body.includes("User not found"));
  await callFormAction("grantProAction", { userId: victim.id }, tok.admin);
  const dup = await callFormAction("grantProAction", { userId: victim.id }, tok.admin);
  check("[admin-action] duplicate grant is refused (no stacked subscriptions)", subs(victim) === 1 && dup.body.includes("already has Pro"), `active PRO subs = ${subs(victim)}`);
  const ok = await callFormAction("revokeProAction", { userId: victim.id }, tok.admin);
  check("[admin-action] revoke reports success", ok.body.includes("Pro revoked") && subs(victim) === 0);
}

// ---------------------------------------------------------------- 4. self-elevation via form input
{
  const fd = await callAction("saveStudyPlanAction", [{ ok: true }, "role=ADMIN&plan=PRO"], tok.free, { page: "/dashboard/study-plan" });
  check("[elevation] free saveStudyPlanAction refused", /NOT_ENTITLED/.test(fd.body) || !/"ok":true/.test(fd.body));
  check("[elevation] free user still FREE and USER after all attempts", subs(free) === 0 && load().users.find((u) => u.id === free.id).role === "USER");
}

// ---------------------------------------------------------------- 5. auth: redirects, throttle, logout invalidation
{
  async function login(email, password, next) {
    const fd = new FormData();
    fd.set("_1_email", email);
    fd.set("_1_password", password);
    fd.set("_1_next", next);
    fd.set("0", JSON.stringify([{}, "$K1"]));
    const r = await fetch(BASE + "/login", { method: "POST", redirect: "manual", headers: { "Next-Action": actionId("loginAction"), Origin: BASE }, body: fd });
    return { status: r.status, redirect: r.headers.get("x-action-redirect") ?? "", setCookie: r.headers.get("set-cookie") ?? "", body: await r.text() };
  }
  for (const next of ["//evil.example", "/\\evil.example", "/..//evil.example", "https://evil.example", "/dashboard/progress"]) {
    const r = await login(free.email, "pw-123456", next);
    const target = r.redirect.split(";")[0];
    const safe = target.startsWith("/") && !target.startsWith("//") && !target.includes("\\") && !/evil/.test(target);
    check(`[redirect] login with next=${JSON.stringify(next)} stays on-site`, r.setCookie.includes("cse_session") && safe, `→ ${target || "(none)"}`);
  }
  for (let i = 0; i < 10; i++) await login(victim.email, `wrong-${i}`, "/dashboard");
  const locked = await login(victim.email, "pw-123456", "/dashboard");
  check("[throttle] 10 failed logins lock the account temporarily (correct password refused)", locked.body.includes("Too many failed attempts") && !locked.setCookie.includes("cse_session"));
  // logout invalidates previously issued tokens
  const t0 = await mint({ userId: free.id });
  const before = await get("/dashboard", t0);
  await new Promise((r) => setTimeout(r, 1100)); // revoke timestamp is in whole seconds
  await callAction("logoutAction", [], t0, { page: "/dashboard/account" });
  const after = await get("/dashboard", t0);
  check("[logout] a token issued before logout no longer authenticates", before.body.includes("Hello,") && !after.body.includes("Hello,"), `before=${before.body.includes("Hello,")} after=${after.body.includes("Hello,")}`);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} security tests passed`);
writeFileSync(new URL("../.audit-security-results.json", import.meta.url), JSON.stringify(results, null, 2));
process.exit(failed.length ? 1 : 0);
