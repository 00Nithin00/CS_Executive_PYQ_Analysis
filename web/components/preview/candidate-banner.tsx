import { TriangleAlert } from "lucide-react";
import { CANDIDATE_DISCLOSURE, CANDIDATE_LABEL } from "@/lib/config/candidate-preview";
import { cn } from "@/lib/utils/cn";

/** Shown on every candidate-preview entry point, including the error state. */
export function CandidateBanner({ className }: { className?: string }) {
  return (
    <div role="alert" data-candidate-banner className={cn("border-y-2 border-dashed border-danger-600/60 bg-danger-50", className)}>
      <div className="mx-auto flex w-full max-w-[1200px] gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-danger-600" />
        <div className="min-w-0 text-sm">
          <p className="font-semibold tracking-wide text-danger-600">{CANDIDATE_LABEL}</p>
          <p className="mt-0.5 text-ink-2">{CANDIDATE_DISCLOSURE}</p>
        </div>
      </div>
    </div>
  );
}

export function CandidateBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full border border-dashed border-danger-600/60 bg-danger-50 px-2.5 py-0.5 text-xs font-medium text-danger-600", className)}
      title={CANDIDATE_LABEL}
    >
      <TriangleAlert aria-hidden className="size-3" /> Candidate · not verified
      <span className="sr-only"> — {CANDIDATE_LABEL}</span>
    </span>
  );
}
