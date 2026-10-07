import { Hourglass } from "lucide-react";
import { can, getViewer } from "@/lib/auth/viewer";
import { analyticsCopy } from "@/lib/config/disclosure";
import { getSubjectAnalytics, getSubjectSummary, listAttempts } from "@/lib/data/service";
import { QUESTION_TYPE_LABEL, REPEAT_LABEL } from "@/lib/utils/labels";
import type { Subject } from "@/types/domain";
import { AttemptDots } from "@/components/analytics/attempt-dots";
import { AttemptTimeline } from "@/components/analytics/attempt-timeline";
import { BarList } from "@/components/analytics/bar-list";
import { ChartFrame } from "@/components/analytics/chart-frame";
import { CoverageGrid } from "@/components/analytics/coverage-grid";
import { PriorityList } from "@/components/analytics/priority-list";
import { ButtonLink } from "@/components/ui/button";
import { DemoNotice, EmptyState, StatTile } from "@/components/ui/primitives";
import { ProGate } from "@/components/ui/pro-gate";

/** Reads the session (capability checks) — render inside <Suspense>. */
export async function SubjectIntelligence({ subject }: { subject: Subject }) {
  if (subject.intelligenceStatus === "IN_PREPARATION") {
    return (
      <EmptyState icon={<Hourglass className="size-5" aria-hidden />} title="PYQ analysis for this subject is being prepared">
        Questions from the six Syllabus 2022 attempts are being extracted, classified and verified against the official papers. Until that
        work is approved, this page shows only official resources and the syllabus — no unverified numbers.
      </EmptyState>
    );
  }

  const [viewer, summary, allAttempts] = await Promise.all([getViewer(), getSubjectSummary(subject.slug), listAttempts()]);
  if (!summary) return null;
  const copy = analyticsCopy(summary.provenance);
  const pro = can(viewer, "PYQ_ANALYTICS");
  const analytics = pro ? await getSubjectAnalytics(viewer, subject.slug) : null;
  // The analysis window comes from the data, not a constant, so a new attempt needs no UI change.
  const windowAttempts = allAttempts.filter((a) => summary.attemptsInWindow.includes(a.id));
  const N = windowAttempts.length;
  const removed = (status: string) => status === "DELETED_FROM_DEC2025";

  return (
    <div className="space-y-6">
      {summary.provenance === "DEMO" && <DemoNotice />}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={copy.stat.attempts} value={summary.attemptsAnalyzed} hint="Syllabus 2022 attempts" />
        <StatTile label={copy.stat.questions} value={summary.questionCount} hint="Atomic question units" />
        <StatTile label={copy.stat.marks} value={summary.marksAnalyzed} />
        <StatTile label={copy.stat.chapters} value={summary.chaptersCovered} hint={`of ${subject.lessons.length} lessons`} />
      </div>

      {analytics ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
            <ChartFrame
              title={copy.coverageTitle}
              subtitle={copy.coverageSubtitle}
              provenance={analytics.provenance}
              table={{
                columns: ["Topic", "Attempts", "Marks", "Last asked"],
                rows: analytics.topics
                  .filter((t) => t.currentPriorityEligible)
                  .slice(0, 12)
                  .map((t) => [t.topicName, `${t.coverage} of ${N}`, t.marks, t.lastSeen ? (windowAttempts.find((a) => a.id === t.lastSeen)?.label ?? t.lastSeen) : "—"]),
              }}
            >
              <CoverageGrid topics={analytics.topics.filter((t) => t.currentPriorityEligible).slice(0, 12)} attempts={windowAttempts} />
            </ChartFrame>

            <ChartFrame title={copy.priorityTitle} subtitle={copy.prioritySubtitle} provenance={analytics.provenance}>
              <PriorityList entries={analytics.priority.filter((p) => p.label === "HIGH" || p.label === "MEDIUM").slice(0, 7)} />
            </ChartFrame>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartFrame
              title={copy.marksTitle}
              subtitle={copy.marksSubtitle}
              provenance={analytics.provenance}
              table={{
                columns: ["Chapter", "Marks", "Questions", "Status"],
                rows: analytics.chapters.map((c) => [`L${c.chapterNumber} ${c.chapterName}`, c.marks, c.questionCount, removed(c.status) ? "Removed Dec 2025" : "Current"]),
              }}
            >
              <BarList
                unit=" m"
                data={analytics.chapters.slice(0, 8).map((c) => ({
                  key: c.chapterId,
                  label: removed(c.status) ? `${c.chapterName} (removed Dec 2025)` : c.chapterName,
                  value: c.marks,
                  muted: removed(c.status),
                  detail: `${c.questionCount} questions · appeared in ${c.attemptsAppeared.length} of ${N} attempts`,
                }))}
              />
            </ChartFrame>

            <ChartFrame title={copy.recurringTitle} subtitle={copy.recurringSubtitle} provenance={analytics.provenance}>
              <ul className="divide-y divide-line">
                {analytics.recurringConcepts
                  .filter((c) => c.currentPriorityEligible)
                  .slice(0, 7)
                  .map((c) => (
                    <li key={c.conceptKey} className="flex items-center gap-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink" title={c.conceptName}>
                          {c.conceptName}
                        </p>
                        <p className="truncate text-xs text-ink-3">{c.topicName}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <AttemptDots attempts={windowAttempts} appeared={c.attempts} />
                        <span className="tabular text-xs text-ink-3">
                          {c.attempts.length} of {N}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </ChartFrame>
          </div>

          <ChartFrame title={copy.timelineTitle} subtitle={copy.timelineSubtitle} provenance={analytics.provenance}>
            <AttemptTimeline attempts={analytics.attempts} />
          </ChartFrame>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartFrame title={copy.typesTitle} subtitle="Marks by question format." provenance={analytics.provenance}>
              <BarList unit=" m" size="sm" data={analytics.questionTypes.map((t) => ({ key: t.type, label: QUESTION_TYPE_LABEL[t.type], value: t.marks, detail: `${t.count} questions` }))} />
            </ChartFrame>
            <ChartFrame title={copy.repeatTitle} subtitle="How each question relates to earlier attempts (methodology §7)." provenance={analytics.provenance}>
              <BarList
                size="sm"
                data={analytics.repeatBreakdown.map((r) => ({
                  key: r.status,
                  label: REPEAT_LABEL[r.status],
                  value: r.count,
                  muted: r.status === "CHAPTER_REPEAT" || r.status === "FIRST_SEEN",
                }))}
              />
            </ChartFrame>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProGate capability="TOPIC_FREQUENCY" viewerState={viewer.state} title={copy.coverageTitle} />
          <ProGate capability="PRIORITY_TOPICS" viewerState={viewer.state} />
          <ProGate capability="MARKS_ANALYSIS" viewerState={viewer.state} compact />
          <ProGate capability="REPEAT_ANALYSIS" viewerState={viewer.state} compact />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-2/60 p-4 sm:p-5">
        <p className="text-sm text-ink-2">
          Browse every question by attempt and chapter{pro ? ", topic, marks, type and repeat status" : ""}.
        </p>
        <ButtonLink href={`/pyq/${subject.slug}`} size="sm" variant="secondary">
          Open PYQ Explorer
        </ButtonLink>
      </div>
    </div>
  );
}

export function SubjectIntelligenceSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading PYQ analysis">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg border border-line bg-surface" />
    </div>
  );
}
