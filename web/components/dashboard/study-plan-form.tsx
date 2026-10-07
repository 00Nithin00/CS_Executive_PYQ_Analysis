"use client";

import { Check } from "lucide-react";
import { useActionState } from "react";
import { saveStudyPlanAction, type ActionResult } from "@/lib/actions/personal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function StudyPlanForm({
  subjects,
  initial,
  attempts,
}: {
  subjects: { slug: string; shortName: string; group: number }[];
  initial: { subjects: string[]; hoursPerWeek: number; examAttempt: string } | null;
  attempts: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveStudyPlanAction, { ok: true });
  return (
    <form action={action} className="space-y-6 rounded-lg border border-line bg-surface p-5 sm:p-6">
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Papers you are preparing</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {subjects.map((s) => (
            <label key={s.slug} className="relative flex h-12 cursor-pointer items-center gap-2 rounded-md border border-line px-3 text-sm has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50">
              <input type="checkbox" name="subjects" value={s.slug} defaultChecked={initial?.subjects.includes(s.slug) ?? s.group === 1} className="peer sr-only" />
              <span className="grid size-4 place-items-center rounded border border-line-strong bg-surface peer-checked:border-accent-600 peer-checked:bg-accent-600 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-600">
                <Check aria-hidden className="size-3 text-white" />
              </span>
              {s.shortName}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Exam attempt</span>
          <select name="examAttempt" defaultValue={initial?.examAttempt ?? attempts[0]?.id} className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm">
            {attempts.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Hours per week</span>
          <input type="number" name="hoursPerWeek" min={1} max={80} defaultValue={initial?.hoursPerWeek ?? 15} className="h-11 w-full rounded-md border border-line bg-surface px-3 text-sm" />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Save plan"}</Button>
        <p aria-live="polite" className={cn("text-sm", state.ok ? "text-ink-3" : "text-danger-600")}>
          {!state.ok ? (state.error === "INVALID" ? "Choose at least one paper and 1–80 hours." : "Couldn't save — please sign in again.") : ""}
        </p>
      </div>
    </form>
  );
}
