import { ArrowRight, BadgeCheck, Database, FileSearch, Layers3, LineChart, Library, Lightbulb, Network, Tags, UserCheck } from "lucide-react";
import type { Subject } from "@/types/domain";
import { ButtonLink } from "@/components/ui/button";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { SubjectCard } from "@/components/subjects/subject-card";

export function SubjectsSection({ subjects }: { subjects: Subject[] }) {
  return (
    <section className="border-y border-line bg-surface py-20 sm:py-28">
      <Container>
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Seven papers" title="Every Executive subject, one consistent structure." lead="Group 1 and Group 2 of the ICSI Syllabus 2022 — each with official resources, the syllabus, and historical intelligence as it is verified." />
          <ButtonLink href="/subjects" variant="secondary" className="self-start md:self-auto">
            All subjects <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <StaggerItem key={s.slug}>
              <SubjectCard subject={s} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

const PILLARS = [
  { icon: Library, title: "Official", body: "Study material, previous papers, guideline answers, supplements and syllabus notices — linked to the ICSI source, checked and dated." },
  { icon: Layers3, title: "Structured", body: "Questions organised by syllabus, chapter, topic and concept, using a published taxonomy built from the official syllabus." },
  { icon: Lightbulb, title: "Intelligent", body: "Historical patterns turned into study insight you can verify: how often, how many marks, how recently — and why it matters." },
];

export function Differentiators() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading align="center" eyebrow="What makes it different" title="Official sources. Rigorous structure. Honest analysis." />
        </Reveal>
        <Stagger className="mt-14 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title} className="bg-surface p-7 sm:p-9">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-lg bg-accent-50 text-accent-700">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="tabular font-display text-sm text-ink-4">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink-3">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

const STEPS = [
  { icon: Database, title: "ICSI sources", body: "Official papers, guideline answers and syllabus, recorded with their source and checksum." },
  { icon: FileSearch, title: "Question extraction", body: "Each paper split into atomic questions with marks, page and question number." },
  { icon: Tags, title: "Classification", body: "Every question placed in the frozen syllabus taxonomy, with the evidence for its placement." },
  { icon: UserCheck, title: "Human verification", body: "Ambiguous, multi-topic and repeat claims are checked by a person before release." },
  { icon: LineChart, title: "Analytics", body: "Coverage, marks weight, recency and recurrence computed only from approved records." },
  { icon: BadgeCheck, title: "Student insights", body: "Transparent priorities you can click into — always with the numbers behind them." },
];

export function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="How it works" title="From an official PDF to an insight you can trust." lead="A documented research method sits underneath every number. Nothing is shown that can't be traced back to a specific question in a specific paper." />
        </Reveal>
        <Stagger className="relative mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.08}>
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title}>
              <div className="relative h-full rounded-lg border border-line bg-canvas p-6">
                <div className="flex items-center gap-3">
                  <span className="tabular grid size-8 place-items-center rounded-full border border-line-strong bg-surface font-display text-sm font-semibold">{i + 1}</span>
                  <Icon aria-hidden className="size-5 text-accent-600" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-8 flex items-center gap-2 text-sm text-ink-3">
          <Network aria-hidden className="size-4 text-accent-600" />
          The method, taxonomy and source registry are versioned independently; the approach is summarised on the About page.
        </Reveal>
      </Container>
    </section>
  );
}

export function OriginStory() {
  return (
    <section className="py-20 sm:py-28">
      <Container size="narrow">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-700">Why this exists</p>
          <blockquote className="mt-6 font-display text-[1.65rem] leading-snug font-medium tracking-tight text-ink sm:text-[2rem]">
            “Years of question papers are publicly available. Turning them into something you can actually prepare from is the hard part.”
          </blockquote>
          <div className="mt-8 space-y-4 text-[1.0625rem] leading-relaxed text-ink-3">
            <p>
              This platform started as an independent project, after watching how much time CS Executive preparation spends on sorting
              through papers, PDFs and notices before any real studying begins.
            </p>
            <p>
              The goal is modest and specific: put the official material in one place, organise past questions properly, and show the
              historical patterns honestly — including what the data cannot tell you.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="pb-8">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface px-6 py-14 text-center shadow-sm sm:px-12 sm:py-20">
            <div aria-hidden className="paper-rule pointer-events-none absolute inset-0 opacity-30" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-display-md font-semibold">Start with the official material. Add the evidence when you’re ready.</h2>
              <p className="mx-auto mt-4 max-w-xl text-ink-3">Free accounts include every official resource and the question browser. Pro adds the historical intelligence.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink href="/signup" size="lg">
                  Create a free account
                </ButtonLink>
                <ButtonLink href="/subjects" size="lg" variant="secondary">
                  Browse subjects
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
