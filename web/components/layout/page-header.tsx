import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function PageHeader({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <div className="border-b border-line">
      <Container className="pt-10 pb-10 sm:pt-14 sm:pb-12">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-3">
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight aria-hidden className="size-3.5 text-ink-4" />}
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="animate-rise">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h1 className="max-w-3xl text-display-lg font-semibold [overflow-wrap:anywhere]">{title}</h1>
          {lead && <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-3">{lead}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </Container>
    </div>
  );
}
