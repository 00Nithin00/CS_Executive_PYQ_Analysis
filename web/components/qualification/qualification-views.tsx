// Shared CA / CMA journey: qualification hub → level → paper. Data is the imported, provenance-checked catalogue.
import { ArrowRight, CircleCheck, CircleDashed, Info } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Card, Container, StatTile } from "@/components/ui/primitives";
import {
  attemptLabel,
  getCatalogue,
  KNOWN_GAPS,
  paperCoverage,
  papersOf,
  paperSlug,
  QUALIFICATION_INFO,
  qualificationCounts,
  resourcesFor,
  type ResourceQualification,
} from "@/lib/qualifications/catalogue";
import { formatDate } from "@/lib/utils/labels";
import type { QualLevel, QualPaper } from "@/types/qualification";
import { OfficialLinks } from "./official-links";

const FORMAT_LABEL: Record<QualPaper["format"], string | null> = {
  descriptive: "Descriptive",
  objective: "Objective (MCQ)",
  mixed: "Descriptive + MCQ",
  unknown: null,
};

function Availability() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="What is available">
      <li>
        <Badge tone="accent">
          <CircleCheck aria-hidden className="size-3.5" /> Official resources: available
        </Badge>
      </li>
      <li>
        <Badge tone="outline">
          <CircleDashed aria-hidden className="size-3.5" /> Question analysis: not available yet
        </Badge>
      </li>
    </ul>
  );
}

function CoverageNote({ q }: { q: ResourceQualification }) {
  const info = QUALIFICATION_INFO[q];
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-700" />
        <div className="min-w-0">
          <h2 className="font-semibold">What this section covers — and what it doesn&apos;t</h2>
          <p className="mt-2 text-sm text-ink-3">
            Every link opens the official {info.bodyShort} document. Question-by-question analysis (topics, frequency, marks) is built only from
            verified datasets; none exists yet for {info.short}, so no analysis is shown.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-3">
            {KNOWN_GAPS[q].map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- hub
export function QualificationHub({ q }: { q: ResourceQualification }) {
  const info = QUALIFICATION_INFO[q];
  const c = getCatalogue(q);
  const counts = qualificationCounts(q);
  const scheme = c.schemes[0];
  return (
    <>
      <PageHeader
        eyebrow={`${info.bodyShort} · ${scheme?.name ?? ""}`}
        title={`${info.name} (${info.short})`}
        lead={`Official ${info.bodyShort} syllabus, study material and past papers for every ${info.short} level, organised by level and paper.`}
        crumbs={[{ href: "/", label: "Home" }, { href: info.href, label: info.short }]}
      >
        <Availability />
      </PageHeader>
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Papers" value={counts.papers} hint="Across all levels" />
          <StatTile label="Question papers" value={counts.questionPapers} hint={`${counts.attempts} attempts`} />
          <StatTile label="Suggested answers" value={counts.suggestedAnswers} hint={counts.suggestedAnswers ? "Official" : "Not publicly available"} />
          <StatTile label="Official documents" value={counts.resources} hint={`Checked ${formatDate(counts.lastVerified)}`} />
        </div>

        <h2 className="mt-12 text-display-md font-semibold">Choose your level</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {c.levels.map((l) => (
            <LevelCard key={l.id} q={q} level={l} />
          ))}
        </div>

        <div className="mt-12">
          <CoverageNote q={q} />
        </div>
        {scheme && (
          <p className="mt-6 text-sm text-ink-3">
            Scheme: {scheme.name}, effective {scheme.effectiveFrom}. Source:{" "}
            <a className="text-accent-700 underline-offset-2 hover:underline" href={scheme.sourceUrls[0]} target="_blank" rel="noopener noreferrer">
              {info.bodyShort}
            </a>
            . {info.bodyName} does not endorse this site.
          </p>
        )}
      </Container>
    </>
  );
}

function LevelCard({ q, level }: { q: ResourceQualification; level: QualLevel }) {
  const papers = papersOf(q, level.id);
  const docs = resourcesFor(q, { levelId: level.id }).length;
  return (
    <Link
      href={`/${q}/${level.id}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-surface p-6 shadow-xs transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
    >
      <h3 className="text-xl font-semibold">{level.name}</h3>
      <p className="mt-2 text-sm text-ink-3">
        {papers.length} papers{level.groups.length ? ` in ${level.groups.length} groups` : ""} · exams in {level.examSessions.join(", ")}
      </p>
      <span className="mt-auto flex items-center justify-between pt-5 text-sm">
        <span className="tabular text-ink-3">{docs} official documents</span>
        <ArrowRight aria-hidden className="size-4 text-accent-700 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

// ---------------------------------------------------------------- level
export function LevelView({ q, level }: { q: ResourceQualification; level: QualLevel }) {
  const info = QUALIFICATION_INFO[q];
  const papers = papersOf(q, level.id);
  const grouped = level.groups.length
    ? level.groups.map((g) => ({ title: g.name, papers: papers.filter((p) => g.paperIds.includes(p.id)) }))
    : [{ title: "Papers", papers: papers.filter((p) => !p.elective) }];
  const electives = papers.filter((p) => p.elective);
  const levelWide = resourcesFor(q, { levelId: level.id, paperId: null });
  return (
    <>
      <PageHeader
        eyebrow={`${info.short} · ${info.bodyShort}`}
        title={level.name}
        lead={`Exams in ${level.examSessions.join(", ")}${level.totalMarks ? ` · ${level.totalMarks} marks in total` : ""}. Choose a paper for its syllabus, study material and past papers.`}
        crumbs={[{ href: "/", label: "Home" }, { href: info.href, label: info.short }, { href: `/${q}/${level.id}`, label: level.name }]}
      >
        <Availability />
      </PageHeader>
      <Container className="py-12">
        <div className="space-y-10">
          {grouped.map((g) => (
            <section key={g.title} aria-label={g.title}>
              <h2 className="text-xl font-semibold">{g.title}</h2>
              <PaperGrid q={q} papers={g.papers} />
            </section>
          ))}
          {electives.length > 0 && (
            <section aria-label="Electives">
              <h2 className="text-xl font-semibold">Electives</h2>
              <p className="mt-1 text-sm text-ink-3">Choose one, at enrolment for the Final course.</p>
              <PaperGrid q={q} papers={electives} />
            </section>
          )}
          {levelWide.length > 0 && (
            <section aria-labelledby="level-docs">
              <h2 id="level-docs" className="text-xl font-semibold">
                {level.name}: syllabus, notices and level-wide papers
              </h2>
              <div className="mt-4">
                <OfficialLinks resources={levelWide} body={info.bodyShort} showType />
              </div>
            </section>
          )}
          <CoverageNote q={q} />
        </div>
      </Container>
    </>
  );
}

function PaperGrid({ q, papers }: { q: ResourceQualification; papers: QualPaper[] }) {
  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {papers.map((p) => {
        const docs = resourcesFor(q, { paperId: p.id }).length;
        return (
          <li key={p.id}>
            <Link
              href={`/${q}/${p.levelId}/${paperSlug(p)}`}
              className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-md"
            >
              <span className="text-xs font-medium tracking-wide text-ink-3 uppercase">Paper {paperSlug(p).slice(1).toUpperCase()}</span>
              <span className="mt-1 font-semibold text-ink">{p.name}</span>
              <span className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-ink-3">
                {p.marks && <Badge tone="outline">{p.marks} marks</Badge>}
                {FORMAT_LABEL[p.format] && <Badge tone="outline">{FORMAT_LABEL[p.format]}</Badge>}
                <span className="tabular">{docs} documents</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------- paper
export function PaperView({ q, level, paper }: { q: ResourceQualification; level: QualLevel; paper: QualPaper }) {
  const info = QUALIFICATION_INFO[q];
  const group = level.groups.find((g) => g.paperIds.includes(paper.id));
  const study = resourcesFor(q, { paperId: paper.id, types: ["SYLLABUS", "STUDY_MATERIAL"] });
  const practice = resourcesFor(q, { paperId: paper.id, types: ["RTP", "MTP"] });
  const notices = resourcesFor(q, { paperId: paper.id, types: ["NOTICE"] });
  const coverage = paperCoverage(q, paper);
  const answersPublic = q !== "cma";
  return (
    <>
      <PageHeader
        eyebrow={`${info.short} · ${level.name}${group ? ` · ${group.name}` : paper.elective ? " · Elective" : ""}`}
        title={`Paper ${paperSlug(paper).slice(1).toUpperCase()}: ${paper.name}`}
        crumbs={[
          { href: "/", label: "Home" },
          { href: info.href, label: info.short },
          { href: `/${q}/${level.id}`, label: level.name },
          { href: `/${q}/${level.id}/${paperSlug(paper)}`, label: `Paper ${paperSlug(paper).slice(1).toUpperCase()}` },
        ]}
      >
        <div className="flex flex-wrap gap-2">
          {paper.marks && <Badge tone="outline">{paper.marks} marks</Badge>}
          {FORMAT_LABEL[paper.format] && <Badge tone="outline">{FORMAT_LABEL[paper.format]}</Badge>}
          <Badge tone="outline">Question analysis: not available yet</Badge>
        </div>
        {paper.factsCitation && (
          <p className="mt-3 text-xs [overflow-wrap:anywhere] text-ink-3">
            Marks and group from{" "}
            <a className="underline-offset-2 hover:underline" href={paper.factsCitation.url} target="_blank" rel="noopener noreferrer">
              {paper.factsCitation.document}
            </a>
            , {paper.factsCitation.location.split(";")[0]}.
          </p>
        )}
      </PageHeader>
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr]">
          <section aria-labelledby="papers" className="min-w-0">
            <h2 id="papers" className="text-xl font-semibold">
              Past papers by attempt
            </h2>
            <p className="mt-1 text-sm text-ink-3">
              {answersPublic ? `Question paper and ${info.bodyShort} suggested answers for each attempt, where published.` : "Question paper for each term. ICMAI suggested answers require a student login and are not linked."}
            </p>
            {coverage.length ? (
              <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface">
                <table className="w-full text-sm">
                  <caption className="sr-only">Official documents for {paper.name} by attempt</caption>
                  <thead className="bg-surface-2/60 text-left text-xs text-ink-3">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">Attempt</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Question paper</th>
                      {answersPublic && <th scope="col" className="px-4 py-2.5 font-medium">Suggested answers</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {coverage.map((row) => (
                      <tr key={row.attempt}>
                        <th scope="row" className="px-4 py-3 text-left font-medium whitespace-nowrap">{attemptLabel(row.attempt)}</th>
                        <td className="px-4 py-3"><DocCell r={row.paper} label="Open paper" body={info.bodyShort} /></td>
                        {answersPublic && <td className="px-4 py-3"><DocCell r={row.answers} label="Open answers" body={info.bodyShort} /></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="border-t border-line px-4 py-2.5 text-xs text-ink-3">
                  “Not available” means no official document is linked for that attempt: either {info.bodyShort} has not published it publicly, or it has not
                  been catalogued yet.
                </p>
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-line p-5 text-sm text-ink-3">No question papers for this paper are published on the official {info.bodyShort} site yet.</p>
            )}
          </section>
          <div className="min-w-0 space-y-10">
            <section aria-labelledby="study">
              <h2 id="study" className="text-xl font-semibold">
                Syllabus and study material
              </h2>
              <div className="mt-4">
                {study.length ? <OfficialLinks resources={study} body={info.bodyShort} showType /> : <p className="text-sm text-ink-3">Not catalogued for this paper yet.</p>}
              </div>
            </section>
            {practice.length > 0 && (
              <section aria-labelledby="practice">
                <h2 id="practice" className="text-xl font-semibold">
                  Revision and practice papers
                </h2>
                <div className="mt-4">
                  <OfficialLinks resources={practice} body={info.bodyShort} showType />
                </div>
              </section>
            )}
            {notices.length > 0 && (
              <section aria-labelledby="notices">
                <h2 id="notices" className="text-xl font-semibold">
                  Notices
                </h2>
                <div className="mt-4">
                  <OfficialLinks resources={notices} body={info.bodyShort} />
                </div>
              </section>
            )}
          </div>
        </div>
      </Container>
    </>
  );
}

function DocCell({ r, label, body }: { r: { officialUrl: string } | null; label: string; body: string }) {
  if (!r) return <span className="text-ink-4">Not available</span>;
  return (
    <a href={r.officialUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-700 underline-offset-2 hover:underline">
      {label}
      <span className="sr-only"> (official {body} PDF, opens in a new tab)</span>
    </a>
  );
}
