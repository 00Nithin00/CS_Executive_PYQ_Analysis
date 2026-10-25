import { ExternalLink } from "lucide-react";
import { Badge, StatTile } from "@/components/ui/primitives";
import type { ReviewProgress } from "@/lib/data/paper-inventory";
import type { PaperInventory } from "@/types/papers";

/** Real question papers behind the subject: official links, structure and marks. No question text, no classifications. */
export function PaperInventorySection({ inventory, review }: { inventory: PaperInventory; review: ReviewProgress }) {
  const { papers, meta } = inventory;
  const parts = papers.reduce((s, p) => s + p.totals.atomicParts, 0);
  const allChecks = papers.every((p) => p.checks.extraction.passed === p.checks.extraction.total && p.checks.source === "VERIFIED");
  return (
    <section aria-labelledby="papers" data-paper-inventory>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h2 id="papers" className="text-display-md font-semibold">
          Question papers in the dataset
        </h2>
        <Badge tone="accent">Official ICSI papers</Badge>
      </div>
      <p className="max-w-3xl text-ink-3">
        Every Syllabus 2022 attempt of this paper, split into individually marked question parts. The counts and marks below come from the official
        papers and reconcile to each paper&apos;s printed maximum. Question text stays in the official papers, linked here.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Exam attempts" value={papers.length} hint={`${papers[0]?.attemptLabel} – ${papers.at(-1)?.attemptLabel}`} />
        <StatTile label="Question parts extracted" value={parts} hint="Individually marked units" />
        <StatTile label="Guideline answers linked" value={`${papers.filter((p) => p.guidelineAnswerUrl).length} of ${papers.length}`} />
        <StatTile
          label="Topic classifications human-reviewed"
          value={`${review.reviewed} of ${review.total}`}
          hint={review.releasedAttempts ? `${review.releasedAttempts} attempts fully reviewed` : "Published per attempt once fully reviewed"}
        />
      </div>

      <div className="relative mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="tabular w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Question papers by exam attempt, with structure, marks and official links</caption>
          <thead className="bg-surface-2/60 text-ink-3">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">Attempt</th>
              <th scope="col" className="px-4 py-3 font-medium">Questions</th>
              <th scope="col" className="px-4 py-3 font-medium">Question parts</th>
              <th scope="col" className="px-4 py-3 font-medium">Marks</th>
              <th scope="col" className="px-4 py-3 font-medium">Official documents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {papers.map((p) => {
              const choice = p.questions.filter((q) => q.alternativeGroup);
              return (
                <tr key={p.paperId} data-paper={p.paperId}>
                  <th scope="row" className="px-4 py-3 font-medium text-ink">
                    {p.attemptLabel}
                  </th>
                  <td className="px-4 py-3 text-ink-2">
                    {p.printed.totalQuestions}
                    {choice.length > 0 && <span className="block text-xs text-ink-3">{choice.map((q) => `Q${q.number}`).join(", ")} are either/or choices</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-2">{p.totals.atomicParts}</td>
                  <td className="px-4 py-3 text-ink-2">
                    {p.totals.attemptableMarks} of {p.printed.maximumMarks}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap gap-x-4 gap-y-1">
                      <a href={p.officialPaperUrl} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 text-accent-700 hover:underline">
                        Question paper <ExternalLink aria-hidden className="size-3.5" />
                        <span className="sr-only">(opens the ICSI PDF in a new tab)</span>
                      </a>
                      {p.guidelineAnswerUrl && (
                        <a href={p.guidelineAnswerUrl} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 text-accent-700 hover:underline">
                          Guideline answers <ExternalLink aria-hidden className="size-3.5" />
                          <span className="sr-only">(opens the ICSI PDF in a new tab)</span>
                        </a>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 grid gap-2 text-sm text-ink-3 sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="font-medium text-ink-2">Papers</dt>
        <dd>{meta.status.papers}</dd>
        <dt className="font-medium text-ink-2">Extraction</dt>
        <dd>
          {meta.status.extraction}
          {allChecks ? "" : " Some checks did not pass; see the methodology notes."}
        </dd>
        <dt className="font-medium text-ink-2">Topics</dt>
        <dd>
          Every question part has a draft chapter and topic classification. {review.reviewed} of {review.total} have been human-reviewed (one reviewer; not independently verified). Topic
          analytics from the real papers are published attempt by attempt, once every question part of an attempt has been reviewed.
        </dd>
      </dl>
    </section>
  );
}
