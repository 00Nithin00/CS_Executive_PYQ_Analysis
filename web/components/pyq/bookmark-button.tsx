"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleBookmarkAction } from "@/lib/actions/personal";
import { cn } from "@/lib/utils/cn";

export function BookmarkButton({ questionId, initial, enabled }: { questionId: string; initial: boolean; enabled: boolean }) {
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();

  if (!enabled) {
    return (
      <Link href="/pricing" className="grid size-9 place-items-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink" aria-label="Bookmarks are a Pro feature" title="Bookmarks are a Pro feature">
        <Bookmark className="size-4" aria-hidden />
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark question"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const prev = saved;
          setSaved(!prev); // optimistic
          const res = await toggleBookmarkAction(questionId);
          setSaved(res.ok ? Boolean(res.data?.bookmarked) : prev);
        })
      }
      className={cn("grid size-9 place-items-center rounded-full transition-colors hover:bg-surface-2", saved ? "text-accent-700" : "text-ink-3 hover:text-ink")}
    >
      {saved ? <BookmarkCheck className="size-4" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
    </button>
  );
}
