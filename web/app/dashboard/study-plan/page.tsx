import { Suspense } from "react";
import { PriorityList } from "@/components/analytics/priority-list";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { StudyPlanForm } from "@/components/dashboard/study-plan-form";
import { DemoBadge, StatTile } from "@/components/ui/primitives";
import { ProGate } from "@/components/ui/pro-gate";
import { NEXT_ATTEMPT } from "@/content/attempts";
import { weeksUntil } from "@/lib/utils/time";
import { can, requireUser } from "@/lib/auth/viewer";
import { analyticsCopy } from "@/lib/config/disclosure";
import { getSubjectAnalytics, listSubjects } from "@/lib/data/service";
import { store } from "@/lib/store";

export const metadata = { title: "Study plan" };

export default function Page() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const viewer = await requireUser("/dashboard/study-plan");
  if (!can(viewer, "STUDY_PLANNER")) {
    return (
      <>
        <DashHeading title="Study plan" />
        <ProGate capability="STUDY_PLANNER" viewerState={viewer.state} />
      </>
    );
  }
  // The focus list needs PYQ_ANALYTICS too; check it rather than assume the plan bundles both.
  const [subjects, plan, clp] = await Promise.all([listSubjects(), store.getStudyPlan(viewer.user.id), can(viewer, "PYQ_ANALYTICS") ? getSubjectAnalytics(viewer, "clp") : Promise.resolve(null)]);
  const weeks = weeksUntil(NEXT_ATTEMPT.startsAt);
  const hours = plan?.hoursPerWeek ?? 15;
  const focus = (clp?.priority ?? []).filter((p) => p.label === "HIGH" || p.label === "MEDIUM").slice(0, 6);

  return (
    <>
      <DashHeading title="Study plan" lead="A simple, evidence-informed plan. The full planner (weekly schedule and revision cycles) is in development." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Weeks to the exam" value={weeks} hint={NEXT_ATTEMPT.dates} />
        <StatTile label="Study hours available" value={weeks * hours} hint={`${hours} hours a week`} />
        <StatTile label="Papers in plan" value={plan?.subjects.length ?? "—"} hint={plan ? "Saved" : "Not saved yet"} />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Your plan</h2>
          <StudyPlanForm
            subjects={subjects.map((s) => ({ slug: s.slug, shortName: s.shortName, group: s.group }))}
            initial={plan}
            attempts={[{ id: "2026-12", label: "December 2026" }, { id: "2027-06", label: "June 2027" }]}
          />
        </section>
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold">{analyticsCopy(clp?.provenance ?? "VERIFIED").focusTitle}</h2>
            {clp?.provenance === "DEMO" && <DemoBadge />}
          </div>
          <div className="rounded-lg border border-line bg-surface px-4">
            <PriorityList provenance={clp?.provenance ?? "VERIFIED"} entries={focus} />
          </div>
        </section>
      </div>
    </>
  );
}
