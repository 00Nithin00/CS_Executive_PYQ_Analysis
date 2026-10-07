import { Suspense } from "react";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { ProGate } from "@/components/ui/pro-gate";
import { can, requireUser } from "@/lib/auth/viewer";
import { getTaxonomy } from "@/lib/data/service";
import { store } from "@/lib/store";

export const metadata = { title: "Progress" };

export default function Page() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const viewer = await requireUser("/dashboard/progress");
  if (!can(viewer, "PROGRESS_TRACKING")) {
    return (
      <>
        <DashHeading title="Progress" />
        <ProGate capability="PROGRESS_TRACKING" viewerState={viewer.state} />
      </>
    );
  }
  const [tax, progress] = await Promise.all([getTaxonomy("clp"), store.listProgress(viewer.user.id)]);
  const chapters = (tax?.chapters ?? []).filter((c) => c.status !== "DELETED_FROM_DEC2025").map((c) => ({ id: c.id, number: c.number, name: c.name, part: c.part }));
  return (
    <>
      <DashHeading title="Progress" lead="Track coverage chapter by chapter. Chapters follow the current syllabus (lessons removed in December 2025 are excluded)." />
      <ProgressTracker chapters={chapters} initial={Object.fromEntries(progress.map((p) => [p.chapterId, p.status]))} />
    </>
  );
}
