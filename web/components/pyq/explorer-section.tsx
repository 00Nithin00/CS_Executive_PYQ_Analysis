import { Hourglass } from "lucide-react";
import { can, getViewer } from "@/lib/auth/viewer";
import { getExplorerQuestions, getTaxonomy, listAttempts } from "@/lib/data/service";
import type { Subject } from "@/types/domain";
import { EmptyState } from "@/components/ui/primitives";
import { PyqExplorer, type ExplorerChapter } from "./pyq-explorer";

/** Reads the session — render inside <Suspense>. Shapes data per capability on the server. */
export async function ExplorerSection({ subject }: { subject: Subject }) {
  const viewer = await getViewer();
  const [payload, taxonomy, attempts] = await Promise.all([getExplorerQuestions(viewer, subject.slug), getTaxonomy(subject.slug), listAttempts()]);
  if (!payload || !taxonomy) {
    return (
      <EmptyState icon={<Hourglass className="size-5" aria-hidden />} title={`${subject.shortName} questions are being prepared`}>
        Questions for this paper appear here once they have been extracted from the official papers and verified.
      </EmptyState>
    );
  }
  // Topic lists are only sent to viewers who can filter by topic.
  const chapters: ExplorerChapter[] = taxonomy.chapters.map((c) => ({
    id: c.id,
    name: c.name,
    number: c.number,
    topics: payload.advanced ? c.topics.filter((t) => t.classificationUse === "CLASSIFIABLE").map((t) => ({ id: t.id, name: t.name })) : [],
  }));
  return <PyqExplorer payload={payload} chapters={chapters} attempts={attempts} viewerState={viewer.state} canBookmark={can(viewer, "BOOKMARKS")} />;
}

export function ExplorerSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[17rem_1fr]" aria-busy="true" aria-label="Loading questions">
      <div className="hidden h-96 animate-pulse rounded-lg border border-line bg-surface lg:block" />
      <div className="space-y-3">
        <div className="h-11 animate-pulse rounded-full border border-line bg-surface" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
