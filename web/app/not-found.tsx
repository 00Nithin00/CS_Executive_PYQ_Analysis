import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container size="narrow" className="py-24 text-center">
          <p className="tabular font-display text-sm text-ink-4">404</p>
          <h1 className="mt-3 text-display-lg font-semibold">This page isn’t in the syllabus.</h1>
          <p className="mt-4 text-ink-3">The page you’re looking for doesn’t exist or has moved.</p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/">Go home</ButtonLink>
            <ButtonLink href="/subjects" variant="secondary">Browse subjects</ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
