import { ArrowRight, BookOpen, FileQuestion, FileCheck2, FilePlus2, ScrollText } from "lucide-react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Container } from "@/components/ui/primitives";
import { RESOURCE_SECTIONS } from "@/lib/config/site";
import { listResources, resourcesVerifiedOn } from "@/lib/data/service";
import { formatDate } from "@/lib/utils/labels";

export const metadata: Metadata = pageMetadata({
  title: "Official resources",
  description: "ICSI CS Executive study material, previous papers, guideline answers, supplements and syllabus — linked to the official source.",
  path: "/resources",
});

const ICONS = { "study-material": BookOpen, "previous-papers": FileQuestion, "guideline-answers": FileCheck2, supplements: FilePlus2, syllabus: ScrollText } as const;

export default async function ResourcesPage() {
  const [all, verified] = await Promise.all([listResources(null), resourcesVerifiedOn()]);
  return (
    <>
      <PageHeader
        eyebrow="Free for everyone"
        title="Official resources"
        lead="Every document here opens at its official ICSI source. Nothing is copied or re-hosted — this is a well-organised index, checked and dated."
        crumbs={[{ href: "/", label: "Home" }, { href: "/resources", label: "Resources" }]}
      >
        <p className="text-sm text-ink-3">Links last checked {formatDate(verified)}</p>
      </PageHeader>
      <Container className="py-12">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCE_SECTIONS.map((s) => {
            const Icon = ICONS[s.slug];
            const count = all.filter((r) => (s.slug === "syllabus" ? ["SYLLABUS", "NOTICE", "RELEVANT_MATERIAL"].includes(r.resourceType) : r.resourceType === s.type)).length;
            return (
              <StaggerItem key={s.slug}>
                <Link href={`/resources/${s.slug}`} className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 shadow-xs transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md">
                  <span className="grid size-11 place-items-center rounded-lg bg-accent-50 text-accent-700">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold">{s.label}</h2>
                  <p className="mt-2 flex-1 text-sm text-ink-3">{s.blurb}</p>
                  <span className="mt-5 flex items-center justify-between text-sm">
                    <span className="tabular text-ink-3">{count} documents</span>
                    <ArrowRight aria-hidden className="size-4 text-accent-700 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </>
  );
}
