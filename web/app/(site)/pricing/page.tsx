import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { FeatureMatrix, PlanCards } from "@/components/pricing/plans";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/primitives";
import { PRO_PRICE_LABEL } from "@/lib/config/pro-price";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description: `Free access to every official resource. Pro is ${PRO_PRICE_LABEL}; it is not yet available to buy.`,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Plans"
        title="Free for the official material. Pro for the analysis."
        lead={`Official resources stay free. Pro is ${PRO_PRICE_LABEL}. It is not yet available to buy: its analysis features still run on synthetic demonstration questions, so checkout stays closed until verified question data is published.`}
        crumbs={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }]}
      />
      <Container className="py-12">
        <PlanCards />
        <Reveal className="mt-16">
          <h2 className="mb-5 text-display-md font-semibold">Compare plans</h2>
          <FeatureMatrix />
        </Reveal>
        <Reveal className="mt-12 grid gap-6 rounded-lg border border-line bg-surface p-6 text-sm text-ink-3 sm:grid-cols-2 sm:p-8">
          <div>
            <h3 className="text-base font-semibold text-ink">Can I buy Pro now?</h3>
            <p className="mt-2">
              Not yet. Pro is {PRO_PRICE_LABEL}, but checkout is not open and no payment can be made on this site. There are no timers, introductory
              “deals” or hidden renewals here.
            </p>
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink">Does Pro predict the exam?</h3>
            <p className="mt-2">No. Pro describes what past examinations contained and ranks topics by that evidence. It does not claim what the next paper will ask.</p>
          </div>
        </Reveal>
      </Container>
    </>
  );
}
