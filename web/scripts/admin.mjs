// Admin CLI for the local file store (.data/store.json). Safe to run while the app is running
// (the store re-reads the file on every request); avoid running it during a sign-up.
//
//   node scripts/admin.mjs list
//   node scripts/admin.mjs grant-pro  <email> [--note "text"]   # plan=PRO status=ACTIVE source=ADMIN_GRANT expires_at=NULL
//   node scripts/admin.mjs revoke-pro <email>
//   node scripts/admin.mjs make-admin <email>
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

const path = process.env.FILE_STORE_PATH ?? join(process.cwd(), ".data", "store.json");
const load = () => (existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : { users: [], subscriptions: [], bookmarks: [], progress: [], studyPlans: [] });
const save = (d) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, JSON.stringify(d, null, 2)); };

const [cmd, emailArg, ...rest] = process.argv.slice(2);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (cmd && cmd !== "list" && (!emailArg || emailArg.length > 254 || !EMAIL_RE.test(emailArg.trim()))) {
  console.error(`Invalid email: ${JSON.stringify(emailArg ?? "")}`);
  process.exit(1);
}
const d = load();
const user = emailArg ? d.users.find((u) => u.email === emailArg.trim().toLowerCase()) : null;
const need = () => { if (!user) { console.error(`No user with email ${emailArg}. They must sign up first.`); process.exit(1); } };

if (cmd === "list") {
  for (const u of d.users) {
    const live = d.subscriptions.filter((s) => s.userId === u.id && s.status === "ACTIVE" && (!s.expiresAt || new Date(s.expiresAt) > new Date()));
    console.log(`${u.email.padEnd(36)} ${u.role.padEnd(6)} ${live.some((s) => s.plan === "PRO") ? "PRO" : "FREE"}`);
  }
} else if (cmd === "grant-pro") {
  need();
  const live = d.subscriptions.filter((s) => s.userId === user.id && s.status === "ACTIVE" && s.plan === "PRO" && (!s.expiresAt || new Date(s.expiresAt) > new Date()));
  if (live.length) { console.log(`${user.email} already has Pro — nothing changed.`); process.exit(0); }
  const noteIdx = rest.indexOf("--note");
  d.subscriptions.push({ id: randomUUID(), userId: user.id, plan: "PRO", status: "ACTIVE", source: "ADMIN_GRANT", startedAt: new Date().toISOString(), expiresAt: null, providerReference: null, note: noteIdx >= 0 ? rest[noteIdx + 1] : "Granted via scripts/admin.mjs" });
  save(d);
  console.log(`Granted PRO (ADMIN_GRANT, no expiry) to ${user.email}`);
} else if (cmd === "revoke-pro") {
  need();
  let n = 0;
  for (const s of d.subscriptions) if (s.userId === user.id && s.status === "ACTIVE" && s.source === "ADMIN_GRANT") { s.status = "CANCELLED"; n++; }
  save(d);
  console.log(`Cancelled ${n} admin grant(s) for ${user.email}`);
} else if (cmd === "make-admin") {
  need();
  user.role = "ADMIN";
  save(d);
  console.log(`${user.email} is now ADMIN`);
} else {
  console.log("Usage: node scripts/admin.mjs list | grant-pro <email> [--note text] | revoke-pro <email> | make-admin <email>");
  process.exit(cmd ? 1 : 0);
}
