// Admin CLI for the account database (DATABASE_URL). Grants are recorded as ADMIN_GRANT, never as payments.
//
//   DATABASE_URL=... node scripts/admin.mjs list
//   DATABASE_URL=... node scripts/admin.mjs grant-pro  <email> <cs|ca|cma> [--note "text"]   # plan=PRO status=ACTIVE source=ADMIN_GRANT expires_at=NULL
//   DATABASE_URL=... node scripts/admin.mjs revoke-pro <email> <cs|ca|cma>                   # cancels admin grants only; paid subscriptions untouched
//   DATABASE_URL=... node scripts/admin.mjs make-admin <email>
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const [cmd, emailArg, ...rest] = process.argv.slice(2);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const QUALIFICATIONS = ["cs", "ca", "cma"];
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};
if (!["list", "grant-pro", "revoke-pro", "make-admin"].includes(cmd ?? "")) fail("Usage: list | grant-pro <email> <cs|ca|cma> [--note text] | revoke-pro <email> <cs|ca|cma> | make-admin <email>");
if (cmd !== "list" && (!emailArg || emailArg.length > 254 || !EMAIL_RE.test(emailArg.trim()))) fail(`Invalid email: ${JSON.stringify(emailArg ?? "")}`);
const qualification = rest[0];
if ((cmd === "grant-pro" || cmd === "revoke-pro") && !QUALIFICATIONS.includes(qualification)) fail(`Qualification must be one of ${QUALIFICATIONS.join(", ")}.`);

const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
try {
  if (cmd === "list") {
    const rows = await sql`
      select u.email, u.role,
        coalesce(string_agg(distinct s.qualification::text, ',') filter (
          where s.plan = 'PRO' and (
            (s.status = 'ACTIVE' and (s.expires_at is null or s.expires_at > now()))
            or (s.status in ('PAST_DUE','CANCELLED') and s.expires_at > now()))), '') as pro
      from users u left join subscriptions s on s.user_id = u.id
      group by u.id order by u.created_at`;
    for (const r of rows) console.log(`${r.email.padEnd(36)} ${r.role.padEnd(6)} ${r.pro ? `PRO(${r.pro})` : "FREE"}`);
  } else {
    const [user] = await sql`select id, email from users where email = ${emailArg.trim().toLowerCase()}`;
    if (!user) fail(`No user with email ${emailArg}. They must sign up first.`);
    if (cmd === "make-admin") {
      await sql`update users set role = 'ADMIN' where id = ${user.id}`;
      console.log(`${user.email} is now ADMIN.`);
    } else if (cmd === "grant-pro") {
      const [live] = await sql`select id from subscriptions where user_id = ${user.id} and qualification = ${qualification} and plan = 'PRO'
        and ((status = 'ACTIVE' and (expires_at is null or expires_at > now())) or (status in ('PAST_DUE','CANCELLED') and expires_at > now()))`;
      if (live) fail(`${user.email} already has ${qualification.toUpperCase()} Pro.`);
      const i = rest.indexOf("--note");
      const note = i >= 0 ? rest[i + 1] ?? null : null;
      await sql`insert into subscriptions (user_id, qualification, plan, status, source, expires_at, note) values (${user.id}, ${qualification}, 'PRO', 'ACTIVE', 'ADMIN_GRANT', null, ${note})`;
      console.log(`${qualification.toUpperCase()} Pro granted to ${user.email} (ADMIN_GRANT, no expiry).`);
    } else if (cmd === "revoke-pro") {
      const r = await sql`update subscriptions set status = 'CANCELLED', updated_at = now()
        where user_id = ${user.id} and qualification = ${qualification} and source = 'ADMIN_GRANT' and status = 'ACTIVE' returning id`;
      console.log(r.length ? `Revoked ${r.length} admin grant(s) for ${user.email} (${qualification}).` : `${user.email} has no active ${qualification} admin grant.`);
    }
  }
} finally {
  await sql.end({ timeout: 5 });
}
