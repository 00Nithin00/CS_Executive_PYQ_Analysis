import { Sparkles } from "lucide-react";
import { FEATURES, type Capability } from "@/lib/entitlements/capabilities";
import { cn } from "@/lib/utils/cn";
import type { ViewerState } from "@/lib/auth/viewer";
import { ButtonLink } from "./button";

/**
 * Shown in place of a Pro section. Renders a neutral skeleton shape only — the real data is never
 * sent to the browser for viewers without the capability (the service layer refuses it).
 */
export function ProGate({
  capability,
  viewerState,
  title,
  className,
  compact = false,
}: {
  capability: Capability;
  viewerState: ViewerState;
  title?: string;
  className?: string;
  compact?: boolean;
}) {
  const feature = FEATURES[capability];
  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-line bg-surface", className)}>
      <div aria-hidden className={cn("space-y-3 p-5 select-none", compact ? "opacity-50" : "opacity-60")}>
        {[78, 64, 52, 40, 30].slice(0, compact ? 3 : 5).map((w) => (
          <div key={w} className="flex items-center gap-3">
            <div className="h-2.5 w-28 rounded-full bg-surface-3" />
            <div className="h-2.5 rounded-full bg-surface-2" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-linear-to-b from-surface/40 via-surface/85 to-surface p-5">
        <div className="max-w-sm text-center">
          <span className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-pro-50 text-pro-700">
            <Sparkles aria-hidden className="size-5" />
          </span>
          <p className="font-display text-lg font-semibold">{title ?? feature.label}</p>
          <p className="mt-1 text-sm text-ink-3">{feature.description}</p>
          <div className="mt-4 flex justify-center gap-2">
            {viewerState === "anonymous" ? (
              <>
                <ButtonLink href="/signup" size="sm">Create free account</ButtonLink>
                <ButtonLink href="/pricing" size="sm" variant="secondary">See Pro</ButtonLink>
              </>
            ) : (
              <ButtonLink href="/pricing" size="sm" variant="pro">Available with Pro</ButtonLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
