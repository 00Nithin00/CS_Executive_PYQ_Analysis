import { Bookmark } from "lucide-react";
import { Suspense } from "react";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { BookmarkButton } from "@/components/pyq/bookmark-button";
import { QuestionCard } from "@/components/pyq/question-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/primitives";
import { ProGate } from "@/components/ui/pro-gate";
import { can, requireUser } from "@/lib/auth/viewer";
import { getBookmarkedQuestions } from "@/lib/data/service";

export const metadata = { title: "Bookmarks" };

export default function Page() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const viewer = await requireUser("/dashboard/bookmarks");
  if (!can(viewer, "BOOKMARKS")) {
    return (
      <>
        <DashHeading title="Bookmarks" />
        <ProGate capability="BOOKMARKS" viewerState={viewer.state} />
      </>
    );
  }
  const questions = await getBookmarkedQuestions(viewer);
  return (
    <>
      <DashHeading title="Bookmarks" lead={`${questions.length} saved question${questions.length === 1 ? "" : "s"}.`} />
      {questions.length === 0 ? (
        <EmptyState icon={<Bookmark className="size-5" aria-hidden />} title="No bookmarks yet" action={<ButtonLink href="/pyq" variant="secondary" size="sm">Open the question browser</ButtonLink>}>
          Use the bookmark icon on any question to save it here.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard key={q.id} q={q} actions={<BookmarkButton questionId={q.id} initial enabled />} />
          ))}
        </div>
      )}
    </>
  );
}
