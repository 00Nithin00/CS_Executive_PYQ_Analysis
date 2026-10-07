import { ArrowRight, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { HeroSpecimen } from "./hero-specimen";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="paper-rule pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <Container className="relative grid items-center gap-12 pt-14 pb-16 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:pt-24 lg:pb-24">
        <div>
          <div className="animate-rise" style={{ "--delay": "0ms" } as React.CSSProperties}>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-3">
              <span className="size-1.5 rounded-full bg-accent-500" aria-hidden />
              ICSI CS Executive · Syllabus 2022
            </p>
          </div>
          <div className="animate-rise" style={{ "--delay": "60ms" } as React.CSSProperties}>
            <h1 className="mt-6 text-display-xl font-semibold">
              Prepare with evidence,
              <br className="hidden sm:block" /> <span className="text-accent-700">not guesswork.</span>
            </h1>
          </div>
          <div className="animate-rise" style={{ "--delay": "120ms" } as React.CSSProperties}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-3">
              Official CS Executive resources in one place, and every past question organised by syllabus, chapter, topic and concept — so
              you can see what has actually been examined, how often, and for how many marks.
            </p>
          </div>
          <div className="animate-rise" style={{ "--delay": "180ms" } as React.CSSProperties}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/subjects" size="lg">
                Explore Subjects <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
              <ButtonLink href="/pyq" size="lg" variant="secondary">
                Explore PYQ Intelligence
              </ButtonLink>
            </div>
          </div>
          <div className="animate-rise" style={{ "--delay": "240ms" } as React.CSSProperties}>
            <p className="mt-8 flex items-start gap-2 text-sm text-ink-3">
              <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-600" />
              Built from official ICSI examination papers, with every figure traceable to a specific question. Verification of the
              historical dataset is in progress.
            </p>
          </div>
        </div>
        <div className="animate-rise" style={{ "--delay": "150ms" } as React.CSSProperties}>
          <HeroSpecimen />
        </div>
      </Container>
    </section>
  );
}
