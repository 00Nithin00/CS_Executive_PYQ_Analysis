import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = pageMetadata({
  title: "About & method",
  description: "Why this CS Executive platform exists and how its question analysis is produced and verified.",
  path: "/about",
});

const PRINCIPLES = [
  ["Official sources first", "Every document links to its ICSI source. Third-party sites are never treated as authoritative."],
  ["A published taxonomy", "Questions are classified into chapters and topics taken verbatim from the ICSI syllabus. The Company Law & Practice taxonomy is frozen at version 0.2."],
  ["Traceable numbers", "Each figure on the site can be traced to specific questions, papers, pages and question numbers."],
  ["Uncertainty is shown, not hidden", "Ambiguous classifications are reviewed by a person. Content removed from the syllabus is kept for history but excluded from current priorities."],
  ["History, not prediction", "Frequency, coverage and recency describe past papers. Priorities are explained in plain numbers, never as a probability of appearing."],
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="An independent project, built carefully."
        lead="This platform was built after seeing how difficult it is to turn years of examination papers into useful preparation information. It is not affiliated with the Institute of Company Secretaries of India."
        crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }]}
      />
      <Container size="narrow" className="py-12">
        <Reveal as="section">
          <h2 className="text-display-md font-semibold">The method</h2>
          <p className="mt-4 leading-relaxed text-ink-3">
            The historical intelligence comes from a documented research process: sources are registered and checksummed, papers are split into atomic
            questions, each question is classified with its evidence, uncertain cases are verified by a person, and only approved records reach the
            analytics. The research methodology and the taxonomy are versioned separately.
          </p>
        </Reveal>
        <ol className="mt-10 space-y-4">
          {PRINCIPLES.map(([title, body], i) => (
            <Reveal as="li" key={title} delay={i * 0.04}>
              <div className="flex gap-4 rounded-lg border border-line bg-surface p-5">
                <span className="tabular font-display text-sm text-ink-4">0{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-3">{body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
        <Reveal as="section" className="mt-12 rounded-lg border border-dashed border-pro-500/50 bg-pro-50/60 p-5 text-sm text-pro-700">
          <strong className="font-semibold">Current status:</strong> official resources are live. Historical analysis on the site currently uses clearly
          labelled demo records while the Company Law & Practice dataset completes verification. Other subjects follow.
        </Reveal>
      </Container>
    </>
  );
}
