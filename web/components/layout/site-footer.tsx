import Link from "next/link";
import { ProductLogo } from "@/components/brand/product-logo";
import { Container } from "@/components/ui/primitives";
import { RESOURCE_SECTIONS } from "@/lib/config/site";
import { SUBJECTS } from "@/content/subjects";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <ProductLogo variant="horizontal" />
            <p className="mt-4 text-sm leading-relaxed text-ink-3">
              An independent preparation platform for the ICSI CS Executive Programme. Not affiliated with or endorsed by the Institute of
              Company Secretaries of India.
            </p>
          </div>
          <FooterCol title="Subjects" links={SUBJECTS.map((s) => ({ href: `/subjects/${s.slug}`, label: s.shortName }))} />
          <FooterCol title="Resources" links={[...RESOURCE_SECTIONS.map((r) => ({ href: `/resources/${r.slug}`, label: r.label })), { href: "/papers", label: "Paper finder" }]} />
          <FooterCol
            title="Product"
            links={[
              { href: "/pyq", label: "PYQ Intelligence" },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About & method" },
              { href: "/login", label: "Log in" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row sm:justify-between">
          <p>Official documents are linked at their ICSI source and are not re-hosted here.</p>
          <p>Historical patterns describe past examinations. They do not predict future questions.</p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-ink-3 transition-colors hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
