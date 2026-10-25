import { Check, Minus } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge, ProBadge } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { PLAN_PRESENTATION } from "@/lib/config/pricing";
import { CAPABILITIES, FEATURES } from "@/lib/entitlements/capabilities";
import { PLAN_CAPABILITIES } from "@/lib/entitlements/plans";
import { cn } from "@/lib/utils/cn";

function price(p: (typeof PLAN_PRESENTATION)[number]) {
  if (!p.price) return null;
  return `₹${p.price.amount.toLocaleString("en-IN")}`;
}

function period(p: (typeof PLAN_PRESENTATION)[number]) {
  if (!p.price || p.price.amount === 0) return null;
  return `${p.price.per ? `per ${p.price.per} ` : ""}per ${p.price.period}`;
}

export function PlanCards() {
  return (
    <Stagger className="grid gap-5 md:grid-cols-2">
      {PLAN_PRESENTATION.map((p) => {
        const pro = p.id === "PRO";
        return (
          <StaggerItem key={p.id}>
            <div className={cn("flex h-full flex-col rounded-xl border bg-surface p-6 sm:p-8", pro ? "border-pro-500/40 shadow-md" : "border-line shadow-xs")}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">{p.name}</h2>
                {pro && <ProBadge />}
              </div>
              <p className="mt-2 text-ink-3">{p.summary}</p>
              <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-4xl font-semibold tracking-tight">{price(p)}</span>
                {period(p) && <span className="text-sm text-ink-3">{period(p)}</span>}
              </p>
              <p className="mt-1 text-sm text-ink-3">{p.priceNote}</p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {p.highlights.map((c) => (
                  <li key={c} className="flex gap-3 text-sm">
                    <Check aria-hidden className={cn("mt-0.5 size-4 shrink-0", pro ? "text-pro-700" : "text-accent-600")} />
                    <span className="text-ink-2">
                      {FEATURES[c].label}
                      {FEATURES[c].availability === "COMING_SOON" && <Badge tone="outline" className="ml-2 align-middle">Coming soon</Badge>}
                      {FEATURES[c].availability === "DEMO_DATA_ONLY" && <Badge tone="outline" className="ml-2 align-middle">Demo data only</Badge>}
                    </span>
                  </li>
                ))}
              </ul>
              <ButtonLink href={p.cta.href} variant={pro ? "primary" : "secondary"} size="lg" className="mt-8 w-full">
                {p.cta.label}
              </ButtonLink>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}

export function FeatureMatrix() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Features included in each plan</caption>
        <thead className="bg-surface-2/60">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium text-ink-3 sm:px-5">Feature</th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-medium text-ink-3 sm:w-28">Free</th>
            <th scope="col" className="w-20 px-2 py-3 text-center font-medium text-ink-3 sm:w-28">Pro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {CAPABILITIES.map((c) => (
            <tr key={c}>
              <th scope="row" className="px-4 py-3 font-normal sm:px-5">
                <span className="block font-medium text-ink">
                  {FEATURES[c].label}
                  {FEATURES[c].availability === "COMING_SOON" && <span className="ml-2 text-xs font-normal text-ink-3">(coming soon)</span>}
                  {FEATURES[c].availability === "DEMO_DATA_ONLY" && <span className="ml-2 text-xs font-normal text-ink-3">(demo data only)</span>}
                </span>
                <span className="mt-0.5 hidden text-xs text-ink-3 sm:block">{FEATURES[c].description}</span>
              </th>
              {(["FREE", "PRO"] as const).map((plan) => (
                <td key={plan} className="px-2 py-3 text-center">
                  {PLAN_CAPABILITIES[plan].includes(c) ? (
                    <Check aria-label="Included" className="mx-auto size-4 text-accent-600" />
                  ) : (
                    <Minus aria-label="Not included" className="mx-auto size-4 text-ink-4" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
