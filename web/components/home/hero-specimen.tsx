import { History } from "lucide-react";
import { DemoBadge } from "@/components/ui/primitives";

/** A static, clearly-labelled specimen of how one analysed question is presented. */
export function HeroSpecimen() {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      <div aria-hidden className="absolute -inset-x-4 -top-4 -bottom-4 -z-10 rotate-[-2deg] rounded-xl border border-line bg-surface-2" />
      <div className="rounded-xl border border-line bg-surface p-5 shadow-lg sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">December 2025 · Q4(a)</p>
          <DemoBadge />
        </div>
        <p className="tabular mt-1 text-sm text-ink-3">5 marks · Company Law & Practice</p>
        <div className="mt-5 space-y-2" aria-hidden>
          <div className="h-2.5 w-full rounded-full bg-surface-2" />
          <div className="h-2.5 w-11/12 rounded-full bg-surface-2" />
          <div className="h-2.5 w-3/5 rounded-full bg-surface-2" />
        </div>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <dt className="text-ink-3">Placed in</dt>
            <dd className="text-right text-ink">Directors → Appointment</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <dt className="text-ink-3">Relation to earlier papers</dt>
            <dd className="text-right font-medium text-accent-700">Conceptual repeat</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-3">
            <dt className="text-ink-3">Previously appeared</dt>
            <dd className="inline-flex items-center gap-1 text-right text-ink">
              <History aria-hidden className="size-3.5 text-ink-3" /> June 2024
            </dd>
          </div>
        </dl>
      </div>
      <figcaption className="mt-6 text-center text-xs text-ink-3">Illustrative example of the layout — not a real ICSI question or finding.</figcaption>
    </figure>
  );
}
