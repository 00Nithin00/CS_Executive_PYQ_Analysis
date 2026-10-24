import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { CandidateBadge } from "@/components/preview/candidate-banner";
import { DemoBadge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils/cn";
import type { Provenance } from "@/types/domain";

/** Common chart chrome: title, subtitle, provenance label, optional accessible table view. */
export function ChartFrame({
  title,
  subtitle,
  provenance,
  children,
  table,
  className,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  provenance: Provenance;
  children: ReactNode;
  table?: { columns: string[]; rows: (string | number)[][] };
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("min-w-0 rounded-lg border border-line bg-surface p-4 sm:p-6", className)} aria-label={title}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {provenance === "DEMO" && <DemoBadge />}
          {provenance === "CANDIDATE" && <CandidateBadge />}
          {action}
        </div>
      </header>
      {children}
      {table && (
        <details className="group mt-5 border-t border-line pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm text-ink-3 hover:text-ink [&::-webkit-details-marker]:hidden">
            <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-open:rotate-180" />
            View as table
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="tabular w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-ink-3">
                  {table.columns.map((c) => (
                    <th key={c} scope="col" className="py-2 pr-4 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((r, i) => (
                  <tr key={i} className="border-b border-line/70 last:border-0">
                    {r.map((cell, j) => (
                      <td key={j} className="py-2 pr-4 text-ink-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
