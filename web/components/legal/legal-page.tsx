import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/primitives";
import { SUPPORT } from "@/lib/config/site";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

/** Plain, readable layout for the privacy, terms and contact pages: one h2 per section, in a narrow column. */
export function LegalPage({ title, lead, path, updated, sections }: { title: string; lead: ReactNode; path: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <PageHeader eyebrow="Policies" title={title} lead={lead} crumbs={[{ href: "/", label: "Home" }, { href: path, label: title }]} />
      <Container size="narrow" className="py-12">
        <p className="text-sm text-ink-3">
          Last updated <time dateTime={updated}>{new Date(`${updated}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>
        </p>
        <div className="mt-8 space-y-10">
          {sections.map((s) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id} className="text-xl font-semibold">
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-ink-2 [&_a]:font-medium [&_a]:text-accent-700 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{s.body}</div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}

/** How to reach the operator: the published support address, or a plain statement that none is published yet. */
export function SupportContact() {
  return SUPPORT.email ? (
    <p>
      Email <a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>. Please do not include your password in any message.
    </p>
  ) : (
    <p>
      A support email address has not been published yet, so there is currently no published way to send a request. See{" "}
      <Link href="/contact">Contact &amp; support</Link> for the current status.
    </p>
  );
}
