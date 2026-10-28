import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, SupportContact } from "@/components/legal/legal-page";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { SITE } from "@/lib/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy",
  description: `What ${SITE.name} stores when you create an account, how it is used, and how sign-in sessions work.`,
  path: "/privacy",
});

// Every statement here describes the code as built (lib/auth, lib/db/schema.ts, lib/store). Change it when the code changes.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      path="/privacy"
      updated="2026-10-28"
      lead={`What ${SITE.name} stores about you, why, and what you can do about it. Browsing official resources needs no account.`}
      sections={[
        {
          id: "no-account",
          title: "Without an account",
          body: (
            <p>
              You can browse subjects, official resources and the paper finder without signing up. The site loads no advertising scripts and
              does not set cookies for visitors who are not signed in. Like any website, the hosting provider (Vercel) receives the technical
              details of each request, such as your IP address, in order to serve it. To count page views, the site uses Vercel Web Analytics,
              which sets no cookies and records the page visited, the referring page, browser, operating system, device type and approximate
              country. It tells repeat visits apart only through a hash of the request that Vercel discards after 24 hours, and it does not
              follow you across other websites.
            </p>
          ),
        },
        {
          id: "account",
          title: "When you create an account",
          body: (
            <>
              <p>We store:</p>
              <ul>
                <li>your name and email address, as you enter them (the email is stored in lower case);</li>
                <li>
                  your password, only as a salted one-way hash (scrypt). The password itself is never stored and cannot be read back, including by
                  us;
                </li>
                <li>when the account was created, its role (student or administrator) and when you last logged out.</li>
              </ul>
              <p>These are used to let you sign in, to show your name in your dashboard and to keep your account separate from others.</p>
              <p>Site administrators can see account names, email addresses and plan status in order to manage accounts.</p>
            </>
          ),
        },
        {
          id: "features",
          title: "When you use account features",
          body: (
            <>
              <p>If you use them, we also store:</p>
              <ul>
                <li>which chapters you have marked as started or covered;</li>
                <li>the questions you bookmark;</li>
                <li>your study plan: the exam attempt, the subjects you chose and your weekly hours.</li>
              </ul>
              <p>This data is only used to show these features back to you.</p>
            </>
          ),
        },
        {
          id: "session",
          title: "Sign-in cookie",
          body: (
            <p>
              Signing in sets one cookie, <code>{SESSION_COOKIE}</code>. It holds a signed token with your account ID, cannot be read by scripts on the
              page, and expires after 30 days. Logging out removes it and invalidates every earlier sign-in to your account on other devices too.
            </p>
          ),
        },
        {
          id: "abuse",
          title: "Protection against misuse",
          body: (
            <p>
              To stop password guessing and automated sign-ups, the site counts sign-in attempts per email address and per IP address, and sign-ups
              per IP address. These counters are stored in the database with the email or IP address they relate to.
            </p>
          ),
        },
        {
          id: "payments",
          title: "Payments",
          body: (
            <p>
              Paid plans are not open, and this site does not collect payment details.
            </p>
          ),
        },
        {
          id: "sharing",
          title: "Who else handles the data",
          body: (
            <p>
              The site runs on Vercel, and account data is kept in a Postgres database. The site does not send emails and does not pass your details
              to advertisers. Official documents open on the ICSI, ICAI or ICMAI websites, which have their own policies.
            </p>
          ),
        },
        {
          id: "requests",
          title: "Access, correction and deletion",
          body: (
            <>
              <p>There is no self-service account deletion or data export in the dashboard yet. Requests are handled by the operator.</p>
              <SupportContact />
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes",
          body: (
            <p>
              This page describes the site as it works on the date above. See also the{" "}
              <Link href="/terms">Terms of use</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}
