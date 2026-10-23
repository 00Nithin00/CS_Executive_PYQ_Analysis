import { ArrowRight, BookOpen, CircleCheck, FileQuestion, FlaskConical, Library } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Container } from "@/components/ui/primitives";
import { listResources, listSubjects } from "@/lib/data/service";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Company Secretary (CS)",
  description: "CS Executive (ICSI Syllabus 2022): official resources, the paper finder, all seven subject pages and the PYQ explorer.",
  path: "/cs",
});

export default async function CsHub() {
  const [subjects, resources] = await Promise.all([listSubjects(), listResources(null)]);
  const sections = [
    { href: "/subjects", icon: BookOpen, title: "Subjects", body: `All ${subjects.length} Executive papers with their syllabus lessons and official resources.` },
    { href: "/papers", icon: FileQuestion, title: "Previous papers", body: "Every Syllabus 2022 Executive paper by attempt, with ICSI guideline answers." },
    { href: "/resources", icon: Library, title: "Official resources", body: `${resources.length} official ICSI documents: study material, papers, answers, supplements and syllabus.` },
    { href: "/pyq", icon: FlaskConical, title: "PYQ Intelligence", body: "Past questions placed in the syllabus. Currently shown with clearly labelled demo data while verification completes.", demo: true },
  ];
  return (
    <>
      <PageHeader
        eyebrow="ICSI · Executive Programme · Syllabus 2022"
        title="Company Secretary (CS)"
        lead="Our current focus is the CS Executive Programme. CS Professional is not covered yet."
        crumbs={[{ href: "/", label: "Home" }, { href: "/cs", label: "CS" }]}
      >
        <ul className="flex flex-wrap gap-2" aria-label="What is available">
          <li>
            <Badge tone="accent">
              <CircleCheck aria-hidden className="size-3.5" /> Official resources: available
            </Badge>
          </li>
          <li>
            <Badge tone="outline">
              <FlaskConical aria-hidden className="size-3.5" /> Question analysis: in verification (demo data shown)
            </Badge>
          </li>
        </ul>
      </PageHeader>
      <Container className="py-12">
        <ul className="grid gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 shadow-xs transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-accent-50 text-accent-700">
                  <s.icon aria-hidden className="size-5" />
                </span>
                <h2 className="mt-5 flex items-center gap-2 text-xl font-semibold">
                  {s.title} {s.demo && <Badge tone="outline">Demo data</Badge>}
                </h2>
                <p className="mt-2 flex-1 text-sm text-ink-3">{s.body}</p>
                <ArrowRight aria-hidden className="mt-5 size-4 text-accent-700 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}
