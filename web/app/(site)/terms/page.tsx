import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, SupportContact } from "@/components/legal/legal-page";
import { SITE } from "@/lib/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description: `How ${SITE.name} may be used, what its information is and is not, and the basis of its question analysis.`,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      path="/terms"
      updated="2026-10-24"
      lead={`${SITE.name} is an independent study aid. Please read what it is, and what it is not, before relying on it.`}
      sections={[
        {
          id: "independent",
          title: "An independent site",
          body: (
            <p>
              {SITE.name} is not affiliated with or endorsed by the Institute of Company Secretaries of India (ICSI), the Institute of Chartered
              Accountants of India (ICAI) or the Institute of Cost Accountants of India (ICMAI). Their names are used only to identify their official
              publications.
            </p>
          ),
        },
        {
          id: "official",
          title: "Official documents",
          body: (
            <p>
              Study material, question papers, guideline answers, syllabi and notices belong to the institutes that publish them. This site links to
              them at their official source and does not re-host them. The institute&apos;s own publication is always the authority; check it before
              relying on any summary here.
            </p>
          ),
        },
        {
          id: "analytics",
          title: "Question analysis",
          body: (
            <>
              <p>
                Question analysis for Company Law &amp; Practice is built from the six Syllabus 2022 question papers. Each question part was placed in the
                syllabus and that placement was {"reviewed on 25 October 2026 by one human reviewer, not independently verified"}. Other subjects have no question analysis yet.
              </p>
              <p>
                The analysis describes past papers only. It does not predict what a future examination will ask, and no outcome in any examination is
                promised. Repeat and concept analysis is not available yet.
              </p>
            </>
          ),
        },
        {
          id: "accuracy",
          title: "Accuracy",
          body: (
            <p>
              The site is maintained carefully, but links can break and summaries can contain errors. Please check important details, such as
              syllabus applicability and examination dates, with the official institute.
            </p>
          ),
        },
        {
          id: "accounts",
          title: "Accounts",
          body: (
            <>
              <p>
                An account is for one person. Keep your password private. Do not try to access other people&apos;s accounts, interfere with the
                site&apos;s operation, or automate sign-ups or sign-in attempts; the site limits repeated attempts.
              </p>
              <p>
                What an account stores is described in the <Link href="/privacy">Privacy</Link> notice.
              </p>
            </>
          ),
        },
        {
          id: "paid",
          title: "Paid plans",
          body: <p>Paid plans are not open. No payment is taken, and there is no paid subscription to renew, cancel or refund.</p>,
        },
        {
          id: "contact",
          title: "Questions about these terms",
          body: <SupportContact />,
        },
      ]}
    />
  );
}
