import type { ReactNode } from "react";

export function DashHeading({ title, lead, action }: { title: string; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-display-md font-semibold">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-ink-3">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function DashSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded-md bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg border border-line bg-surface" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-lg border border-line bg-surface" />
    </div>
  );
}
