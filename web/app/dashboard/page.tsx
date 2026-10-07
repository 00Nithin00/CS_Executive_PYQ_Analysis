import { ArrowRight, BookOpen, FileQuestion, Sparkles } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { ButtonLink } from "@/components/ui/button";
import { Card, DemoNotice, ProBadge, StatTile } from "@/components/ui/primitives";
import { NEXT_ATTEMPT } from "@/content/attempts";
import { can, requireUser } from "@/lib/auth/viewer";
import { getTaxonomy } from "@/lib/data/service";
import { store } from "@/lib/store";

export const metadata = { title: "Overview" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const viewer = await requireUser("/dashboard");
  const first = viewer.user.name.split(" ")[0];
  const pro = viewer.state === "pro";
  const [progress, bookmarks, clp] = await Promise.all([
    can(viewer, "PROGRESS_TRACKING") ? store.listProgress(viewer.user.id) : Promise.resolve([]),
    can(viewer, "BOOKMARKS") ? store.listBookmarks(viewer.user.id) : Promise.resolve([]),
    getTaxonomy("clp"),
  ]);
  const clpChapters = clp?.chapters.filter((c) => c.status !== "DELETED_FROM_DEC2025") ?? [];
  const covered = progress.filter((p) => p.status === "COVERED" && clpChapters.some((c) => c.id === p.chapterId)).length;

  return (
    <>
      <DashHeading title={`Hello, ${first}`} lead={`Next examination: ${NEXT_ATTEMPT.label} (${NEXT_ATTEMPT.dates}).`} action={pro ? <ProBadge /> : null} />

      {pro ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile label="CLP chapters covered" value={`${covered} / ${clpChapters.length}`} hint="From your progress tracker" />
          <StatTile label="Bookmarked questions" value={bookmarks.length} />
          <StatTile label="Plan" value="Pro" hint={viewer.subscription?.expiresAt ? `Until ${new Date(viewer.subscription.expiresAt).toLocaleDateString("en-IN")}` : "No expiry"} />
        </div>
      ) : (
        <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pro-50 text-pro-700">
              <Sparkles aria-hidden className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">You’re on the Free plan</p>
              <p className="text-sm text-ink-3">All official resources and the question browser are included. Pro adds the historical analysis and planning tools.</p>
            </div>
          </div>
          <ButtonLink href="/pricing" variant="pro" className="shrink-0">Compare plans</ButtonLink>
        </Card>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { href: "/dashboard/pyq", icon: Sparkles, title: "PYQ Intelligence", body: "Coverage, marks weight and priorities for Company Law & Practice." },
          { href: "/pyq", icon: FileQuestion, title: "Question browser", body: "Every question by attempt and chapter." },
          { href: "/resources", icon: BookOpen, title: "Official resources", body: "Study material, papers, answers and supplements." },
        ].map(({ href, icon: Icon, title, body }) => (
          <Link key={href} href={href} className="group rounded-lg border border-line bg-surface p-5 transition-[box-shadow,border-color] hover:border-line-strong hover:shadow-md">
            <Icon aria-hidden className="size-5 text-accent-600" />
            <p className="mt-4 font-semibold">{title}</p>
            <p className="mt-1 text-sm text-ink-3">{body}</p>
            <ArrowRight aria-hidden className="mt-4 size-4 text-accent-700 transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <DemoNotice className="mt-8">
        <strong className="font-semibold">Early access.</strong> PYQ analysis currently uses demonstration data — synthetic questions, not ICSI examination history — while the verified Company Law & Practice dataset is completed.
      </DemoNotice>
    </>
  );
}
