import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, SupportContact } from "@/components/legal/legal-page";
import { SITE } from "@/lib/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & support",
  description: `How to reach ${SITE.name} about your account or the site, and where to take examination questions.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact & support"
      path="/contact"
      updated="2026-10-24"
      lead="Help with your account or with the site."
      sections={[
        {
          id: "support",
          title: "Account and site support",
          body: (
            <>
              <SupportContact />
              <p>
                Requests to correct or delete account data are handled by the operator; there is no self-service deletion in the dashboard yet (see{" "}
                <Link href="/privacy">Privacy</Link>).
              </p>
            </>
          ),
        },
        {
          id: "password",
          title: "Forgotten password",
          body: <p>Password reset by email is not available yet. Please keep your password safe.</p>,
        },
        {
          id: "exams",
          title: "Examination questions",
          body: (
            <p>
              {SITE.name} is independent of ICSI, ICAI and ICMAI and cannot answer questions about registration, admit cards, results or examination
              rules. Contact the institute concerned through its official website, for example{" "}
              <a href="https://www.icsi.edu" rel="noopener noreferrer">
                icsi.edu
              </a>{" "}
              for CS.
            </p>
          ),
        },
      ]}
    />
  );
}
