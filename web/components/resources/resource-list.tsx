import { ArrowUpRight, FileText } from "lucide-react";
import type { OfficialResource } from "@/types/domain";
import { formatDate, RESOURCE_TYPE_LABEL } from "@/lib/utils/labels";
import { Badge } from "@/components/ui/primitives";

/** Official ICSI documents as links + metadata. Nothing is downloaded or re-hosted. */
export function ResourceList({ resources, showType = false }: { resources: OfficialResource[]; showType?: boolean }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
      {resources.map((r) => (
        <li key={r.id}>
          <a
            href={r.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-4 transition-colors hover:bg-surface-2/60 sm:items-center sm:gap-4 sm:px-5"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-2 text-ink-3 group-hover:text-accent-700">
              <FileText aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-ink">{r.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                {showType && <Badge tone="outline">{RESOURCE_TYPE_LABEL[r.resourceType]}</Badge>}
                <span>For {r.applicableExam}</span>
                {r.note && <span>{r.note}</span>}
                <span>Link checked {formatDate(r.lastVerified)}</span>
              </span>
            </span>
            <span className="hidden items-center gap-1 text-sm font-medium text-accent-700 sm:inline-flex">
              Open at ICSI <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <ArrowUpRight aria-hidden className="size-4 shrink-0 text-accent-700 sm:hidden" />
            <span className="sr-only">(opens the official ICSI document in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
