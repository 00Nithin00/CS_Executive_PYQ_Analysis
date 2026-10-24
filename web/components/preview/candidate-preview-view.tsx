import { CircleX } from "lucide-react";
import { AttemptDots } from "@/components/analytics/attempt-dots";
import { AttemptTimeline } from "@/components/analytics/attempt-timeline";
import { BarList } from "@/components/analytics/bar-list";
import { ChartFrame } from "@/components/analytics/chart-frame";
import { CoverageGrid } from "@/components/analytics/coverage-grid";
import { PriorityList } from "@/components/analytics/priority-list";
import { CandidateBanner } from "@/components/preview/candidate-banner";
import { Badge, StatTile } from "@/components/ui/primitives";
import type { CandidatePreviewResult } from "@/lib/preview/candidate";
import type { ExamAttempt } from "@/types/domain";

const STATUS_LABEL: Record<string, string> = {
  NOT_APPLIED_PENDING_EVIDENCE: "Pending evidence",
  NOT_APPLIED_PENDING_REVIEW: "Pending review",
  NOT_APPLIED_CONFLICT: "Confidence conflict",
};

/** Candidate preview body. Renders an explicit error (never demonstration data) when loading or validation fails. */
export function CandidatePreviewView({ result, attempts }: { result: CandidatePreviewResult; attempts: ExamAttempt[] }) {
  if (!result.ok) {
    return (
      <div className="space-y-6" data-candidate-preview="error">
        <CandidateBanner className="rounded-md border-x-2" />
        <section role="alert" className="rounded-lg border border-danger-600/40 bg-surface p-5">
          <div className="flex items-center gap-2 text-danger-600">
            <CircleX aria-hidden className="size-5" />
            <h2 className="text-lg font-semibold">The candidate dataset could not be loaded</h2>
          </div>
          <p className="mt-2 text-sm text-ink-2">No figures are shown, and no demonstration data was substituted. Fix the problems below and reload.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-2">
            {result.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  const d = result.data;
  const a = d.analytics;
  const windowAttempts = attempts.filter((x) => a.attemptsInWindow.includes(x.id));
  const N = windowAttempts.length;
  const heldOnCurrent = d.held.filter((h) => h.onCurrentNode);
  const heldByTopic = new Map<string, number>();
  for (const r of d.records) if (r.currentPriorityHold) heldByTopic.set(r.topicId, (heldByTopic.get(r.topicId) ?? 0) + 1);
  const currentRecurring = a.recurringConcepts.filter((c) => c.currentPriorityEligible);
  const historicalOnlyRecurring = a.recurringConcepts.length - currentRecurring.length;

  return (
    <div className="space-y-6" data-candidate-preview="ok">
      <CandidateBanner className="rounded-md border-x-2" />

      <section className="rounded-lg border border-line bg-surface p-4 text-sm sm:p-5" aria-label="Data source">
        <h2 className="font-semibold">Data source</h2>
        <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-ink-2 sm:grid-cols-[auto_1fr]">
          <dt className="text-ink-3">Candidate</dt>
          <dd className="min-w-0 break-all">
            <code>{d.source.dataset}</code> ({d.source.classificationVersion}; SHA-256 <code>{d.source.datasetSha256.slice(0, 12)}…</code>)
          </dd>
          <dt className="text-ink-3">Review overlay</dt>
          <dd className="min-w-0 break-all">
            <code>{d.source.overlay}</code>
          </dd>
          <dt className="text-ink-3">Taxonomy</dt>
          <dd>v{d.source.taxonomyVersion}</dd>
          <dt className="text-ink-3">Records</dt>
          <dd>
            {d.recordCount} ·{" "}
            {Object.entries(d.verificationStatusCounts)
              .map(([k, v]) => `${v} ${k}`)
              .join(", ")}{" "}
            · none human-reviewed or verified
          </dd>
          <dt className="text-ink-3">Priority-A review</dt>
          <dd>
            {d.changedRecordIds.length} records changed by the AI desk review · {d.held.length} held unresolved
          </dd>
        </dl>
      </section>

      <section aria-labelledby="hist-figures">
        <h2 id="hist-figures" className="text-lg font-semibold">
          Historical figures <span className="text-sm font-normal text-ink-3">· all {N} attempts, every eligible record, held records included</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Questions (historical)" value={d.summary.questionCount} hint="Atomic units on analytics-eligible nodes" />
          <StatTile label="Marks (historical)" value={d.summary.marksAnalyzed} hint="Compulsory units only" />
          <StatTile label="Attempts" value={d.summary.attemptsAnalyzed} />
          <StatTile label="Chapters covered" value={d.summary.chaptersCovered} />
        </div>
      </section>

      <section aria-labelledby="cur-figures">
        <h2 id="cur-figures" className="text-lg font-semibold">
          Current-syllabus figures <span className="text-sm font-normal text-ink-3">· each record&apos;s own topic must be current; held records excluded</span>
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Questions (current)" value={d.current.questionCount} />
          <StatTile label="Marks (current)" value={d.current.marks} hint="Compulsory units only" />
          <StatTile label="Current topics" value={d.current.topicCount} />
          <StatTile label="Held from current" value={d.held.length} hint={`${heldOnCurrent.length} would otherwise count`} />
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Not in any topic figure: {d.summary.excluded.unmapped} records on the holding node (unmapped). Alternatives in a choice group add no marks (
          {d.summary.excluded.alternativeMarks} records).
        </p>
      </section>

      <section aria-labelledby="held" className="rounded-lg border border-line bg-surface p-4 sm:p-6">
        <h2 id="held" className="text-lg font-semibold">
          {d.held.length} records held from current-priority figures
        </h2>
        <p className="mt-1 text-sm text-ink-3">
          Their review is unresolved, so they keep their original v0.1 classification and count only in historical figures. They never feed current topic
          figures, chapter current marks, recurring concepts, rankings or priority labels. {heldOnCurrent.length} of them sit on current-syllabus topics
          and would otherwise count; the rest are on deleted content or the holding node, which is outside current figures anyway.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="tabular w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-ink-3">
                <th scope="col" className="py-2 pr-4 font-medium">Record</th>
                <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                <th scope="col" className="py-2 pr-4 font-medium">Kept classification</th>
                <th scope="col" className="py-2 pr-4 font-medium">Marks</th>
                <th scope="col" className="py-2 pr-4 font-medium">Effect</th>
                <th scope="col" className="py-2 pr-4 font-medium">Why held</th>
              </tr>
            </thead>
            <tbody>
              {d.held.map((h) => (
                <tr key={h.id} className="border-b border-line/70 align-top last:border-0" data-held-record={h.id}>
                  <td className="py-2 pr-4 font-medium text-ink">{h.shortId}</td>
                  <td className="py-2 pr-4">
                    <Badge tone={h.status === "NOT_APPLIED_CONFLICT" ? "danger" : "outline"}>{STATUS_LABEL[h.status] ?? h.status}</Badge>
                  </td>
                  <td className="py-2 pr-4">
                    <code>{h.primaryNode}</code>
                  </td>
                  <td className="py-2 pr-4">{h.isAlternative ? `${h.marks} (alternative)` : h.marks}</td>
                  <td className="py-2 pr-4 text-ink-2">
                    {h.onCurrentNode ? "Removed from current figures" : h.historicallyEligible ? "Historical only (deleted content)" : "Unmapped (holding node)"}
                  </td>
                  <td className="py-2 pr-4 text-ink-2">{h.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
        <ChartFrame
          title="Current-syllabus topic coverage"
          subtitle="Topics ranked by attempts covered, then marks, from current-syllabus records only (held records excluded)."
          provenance={a.provenance}
          table={{
            columns: ["Topic", "Attempts", "Marks (current)", "Marks (historical)", "Held records"],
            rows: a.currentTopics
              .slice(0, 12)
              .map((t) => [t.topicName, `${t.coverage} of ${N}`, t.marks, a.topics.find((h) => h.topicId === t.topicId)?.marks ?? 0, heldByTopic.get(t.topicId) ?? 0]),
          }}
        >
          <CoverageGrid topics={a.currentTopics.slice(0, 12)} attempts={windowAttempts} />
        </ChartFrame>

        <ChartFrame title="Candidate priority indicators" subtitle="Computed only from current-syllabus records without a review hold. Not a prediction." provenance={a.provenance}>
          <PriorityList provenance={a.provenance} entries={a.priority.filter((p) => p.label === "HIGH" || p.label === "MEDIUM").slice(0, 7)} />
        </ChartFrame>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartFrame
          title="Marks by chapter"
          subtitle="Bars: current-syllabus marks, per record. The table also shows marks across all attempts."
          provenance={a.provenance}
          table={{
            columns: ["Chapter", "Marks (all attempts)", "Current-syllabus marks", "Questions (all)", "Questions (current)", "Status"],
            rows: a.chapters.map((c) => [`L${c.chapterNumber} ${c.chapterName}`, c.marks, c.currentMarks, c.questionCount, c.currentQuestionCount, c.status]),
          }}
        >
          <BarList
            unit=" m"
            data={[...a.chapters]
              .sort((x, y) => y.currentMarks - x.currentMarks)
              .filter((c) => c.currentMarks > 0)
              .slice(0, 8)
              .map((c) => ({
                key: c.chapterId,
                label: c.chapterName,
                value: c.currentMarks,
                detail: `${c.currentQuestionCount} current questions · ${c.marks} marks across all attempts`,
              }))}
          />
        </ChartFrame>

        <ChartFrame
          title="Recurring concepts (current syllabus)"
          subtitle={`Concepts recurring in at least two attempts through current-syllabus records. ${historicalOnlyRecurring} further concepts recur only historically.`}
          provenance={a.provenance}
        >
          <ul className="divide-y divide-line">
            {currentRecurring.slice(0, 7).map((c) => (
              <li key={c.conceptKey} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink" title={c.conceptName}>
                    {c.conceptName}
                  </p>
                  <p className="truncate text-xs text-ink-3">{c.topicName}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <AttemptDots attempts={windowAttempts} appeared={c.currentAttempts} />
                  <span className="tabular text-xs text-ink-3">
                    {c.currentAttempts.length} of {N}
                  </span>
                </div>
              </li>
            ))}
            {currentRecurring.length === 0 && <li className="py-2.5 text-sm text-ink-3">No concept recurs through current-syllabus records.</li>}
          </ul>
        </ChartFrame>
      </div>

      <ChartFrame title="Attempt timeline (historical)" subtitle="Where each paper's marks went, across all records including held ones." provenance={a.provenance}>
        <AttemptTimeline attempts={a.attempts} />
      </ChartFrame>

      <p className="text-xs text-ink-3">Repeat analysis is not shown: repeat status has not been assessed for any record in the candidate.</p>
    </div>
  );
}
