"use client";

import { AnimatePresence, m } from "motion/react";
import { Lock, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import type { ExplorerPayload } from "@/lib/data/service";
import type { ViewerState } from "@/lib/auth/viewer";
import { QUESTION_TYPE_LABEL, REPEAT_LABEL } from "@/lib/utils/labels";
import { cn } from "@/lib/utils/cn";
import { isProQuestion, type ExamAttempt, type QuestionType, type RepeatStatus } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { DEMO_DISCLOSURE } from "@/lib/config/disclosure";
import { DemoNotice, EmptyState } from "@/components/ui/primitives";
import { Sheet } from "@/components/ui/sheet";
import { BookmarkButton } from "./bookmark-button";
import { QuestionCard } from "./question-card";

export interface ExplorerChapter {
  id: string;
  name: string;
  number: number;
  topics: { id: string; name: string }[];
}

interface Filters {
  attempt: string;
  chapter: string;
  topic: string;
  marks: string;
  type: string;
  repeat: string;
}
const EMPTY: Filters = { attempt: "all", chapter: "all", topic: "all", marks: "all", type: "all", repeat: "all" };
const PAGE = 15;

export function PyqExplorer({
  payload,
  chapters,
  attempts,
  viewerState,
  canBookmark,
}: {
  payload: ExplorerPayload;
  chapters: ExplorerChapter[];
  attempts: ExamAttempt[];
  viewerState: ViewerState;
  canBookmark: boolean;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [sheetOpen, setSheetOpen] = useState(false);
  const q = useDeferredValue(query.trim().toLowerCase());
  const bookmarked = useMemo(() => new Set(payload.bookmarkedIds), [payload.bookmarkedIds]);

  const set = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch, ...(patch.chapter ? { topic: "all" } : {}) }));
    setLimit(PAGE);
  };

  const marksOptions = useMemo(() => [...new Set(payload.questions.map((x) => x.marks).filter((x): x is number => x !== null))].sort((a, b) => a - b), [payload.questions]);
  const typeOptions = useMemo(
    () => [...new Set(payload.questions.filter(isProQuestion).map((x) => x.questionType))] as QuestionType[],
    [payload.questions],
  );
  const repeatOptions: RepeatStatus[] = ["EXACT_REPEAT", "CONCEPTUAL_REPEAT", "TOPIC_REPEAT", "CHAPTER_REPEAT", "FIRST_SEEN"];

  const results = useMemo(
    () =>
      payload.questions.filter((x) => {
        if (filters.attempt !== "all" && x.attempt !== filters.attempt) return false;
        if (filters.chapter !== "all" && x.chapter.id !== filters.chapter) return false;
        if (filters.marks !== "all" && String(x.marks) !== filters.marks) return false;
        if (isProQuestion(x)) {
          if (filters.topic !== "all" && x.topic.id !== filters.topic) return false;
          if (filters.type !== "all" && x.questionType !== filters.type) return false;
          if (filters.repeat !== "all" && x.repeatStatus !== filters.repeat) return false;
        }
        if (q) {
          const hay = `${x.questionText} ${x.chapter.name} ${isProQuestion(x) ? `${x.topic.name} ${x.subtopic?.name ?? ""}` : ""}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [payload.questions, filters, q],
  );

  const activeCount = Object.entries(filters).filter(([, v]) => v !== "all").length;
  const topics = chapters.find((c) => c.id === filters.chapter)?.topics ?? [];
  const signature = JSON.stringify(filters) + q;

  const panel = (
    <FilterPanel
      filters={filters}
      set={set}
      attempts={attempts}
      chapters={chapters}
      topics={topics}
      marksOptions={marksOptions}
      typeOptions={typeOptions}
      repeatOptions={repeatOptions}
      advanced={payload.advanced}
      viewerState={viewerState}
    />
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-lg border border-line bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filters</h2>
            {activeCount > 0 && (
              <button onClick={() => set(EMPTY)} className="text-xs text-accent-700 hover:underline">
                Clear all
              </button>
            )}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        {payload.provenance === "DEMO" && <DemoNotice className="mb-4">{DEMO_DISCLOSURE.questions}</DemoNotice>}

        <div className="flex gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search questions</span>
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-4" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Search by concept, chapter or topic"
              className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[0.9375rem] placeholder:text-ink-4 focus:border-accent-500 focus:outline-none"
            />
          </label>
          <Button variant="secondary" className="lg:hidden" onClick={() => setSheetOpen(true)} aria-label={`Filters${activeCount ? `, ${activeCount} active` : ""}`}>
            <SlidersHorizontal aria-hidden className="size-4" />
            Filters
            {activeCount > 0 && <span className="tabular grid size-5 place-items-center rounded-full bg-ink text-[0.6875rem] text-white">{activeCount}</span>}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2" aria-live="polite">
          <p className="text-sm text-ink-3">
            <span className="tabular font-medium text-ink">{results.length}</span> of {payload.questions.length} questions
          </p>
          {activeCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(filters) as (keyof Filters)[])
                .filter((k) => filters[k] !== "all")
                .map((k) => (
                  <button key={k} onClick={() => set({ [k]: "all" })} className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs text-ink-2 hover:bg-surface-3">
                    {chipLabel(k, filters[k], attempts, chapters)}
                    <X aria-hidden className="size-3" />
                  </button>
                ))}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <m.div key={signature} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-4 space-y-3">
            {results.length === 0 ? (
              <EmptyState icon={<Search className="size-5" aria-hidden />} title="No questions match these filters" action={<Button variant="secondary" size="sm" onClick={() => { set(EMPTY); setQuery(""); }}>Reset filters</Button>}>
                Try removing a filter or searching for a broader term.
              </EmptyState>
            ) : (
              results.slice(0, limit).map((x) => (
                <QuestionCard
                  key={x.id}
                  q={x}
                  actions={viewerState === "anonymous" ? null : <BookmarkButton questionId={x.id} initial={bookmarked.has(x.id)} enabled={canBookmark} />}
                />
              ))
            )}
          </m.div>
        </AnimatePresence>

        {results.length > limit && (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
              Show more ({results.length - limit} remaining)
            </Button>
          </div>
        )}
      </div>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filter questions"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => set(EMPTY)}>
              Clear
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Show {results.length} questions
            </Button>
          </div>
        }
      >
        {panel}
      </Sheet>
    </div>
  );
}

function chipLabel(k: keyof Filters, v: string, attempts: ExamAttempt[], chapters: ExplorerChapter[]) {
  if (k === "attempt") return attempts.find((a) => a.id === v)?.shortLabel ?? v;
  if (k === "chapter") return `L${chapters.find((c) => c.id === v)?.number} ${chapters.find((c) => c.id === v)?.name ?? ""}`.slice(0, 32);
  if (k === "topic") return chapters.flatMap((c) => c.topics).find((t) => t.id === v)?.name.slice(0, 32) ?? v;
  if (k === "marks") return `${v} marks`;
  if (k === "type") return QUESTION_TYPE_LABEL[v as QuestionType];
  if (k === "repeat") return REPEAT_LABEL[v as RepeatStatus];
  return v;
}

function FilterPanel({
  filters,
  set,
  attempts,
  chapters,
  topics,
  marksOptions,
  typeOptions,
  repeatOptions,
  advanced,
  viewerState,
}: {
  filters: Filters;
  set: (p: Partial<Filters>) => void;
  attempts: ExamAttempt[];
  chapters: ExplorerChapter[];
  topics: { id: string; name: string }[];
  marksOptions: number[];
  typeOptions: QuestionType[];
  repeatOptions: RepeatStatus[];
  advanced: boolean;
  viewerState: ViewerState;
}) {
  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">Attempt</legend>
        <div className="flex flex-wrap gap-1.5">
          {[{ id: "all", shortLabel: "All" }, ...[...attempts].reverse()].map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={filters.attempt === a.id}
              onClick={() => set({ attempt: a.id })}
              className={cn(
                "h-9 rounded-full border px-3 text-sm transition-colors",
                filters.attempt === a.id ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-2 hover:border-line-strong",
              )}
            >
              {a.shortLabel}
            </button>
          ))}
        </div>
      </fieldset>

      <Select label="Chapter" value={filters.chapter} onChange={(v) => set({ chapter: v })} options={chapters.map((c) => ({ value: c.id, label: `L${c.number} · ${c.name}` }))} />
      <Select label="Marks" value={filters.marks} onChange={(v) => set({ marks: v })} options={marksOptions.map((mk) => ({ value: String(mk), label: `${mk} marks` }))} />

      <div className={cn("space-y-5 rounded-md", !advanced && "border border-dashed border-line-strong p-3")}>
        {!advanced && (
          <p className="flex items-start gap-2 text-xs text-ink-3">
            <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0 text-pro-700" />
            <span>
              Topic, question type and repeat filters are part of Pro.{" "}
              <Link href={viewerState === "anonymous" ? "/signup" : "/pricing"} className="font-medium text-accent-700 hover:underline">
                {viewerState === "anonymous" ? "Create an account" : "See Pro"}
              </Link>
            </span>
          </p>
        )}
        <Select label="Topic" disabled={!advanced || filters.chapter === "all"} hint={advanced && filters.chapter === "all" ? "Choose a chapter first" : undefined} value={filters.topic} onChange={(v) => set({ topic: v })} options={topics.map((t) => ({ value: t.id, label: t.name }))} />
        <Select label="Question type" disabled={!advanced} value={filters.type} onChange={(v) => set({ type: v })} options={typeOptions.map((t) => ({ value: t, label: QUESTION_TYPE_LABEL[t] }))} />
        <Select label="Repeat status" disabled={!advanced} value={filters.repeat} onChange={(v) => set({ repeat: v })} options={repeatOptions.map((r) => ({ value: r, label: REPEAT_LABEL[r] }))} />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className={cn("block", disabled && "opacity-60")}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full appearance-none rounded-md border border-line bg-surface bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%236b7280%22><path d=%22M5.5 7.5 10 12l4.5-4.5%22 stroke=%22%236b7280%22 stroke-width=%221.6%22 fill=%22none%22/></svg>')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 pl-3 text-sm text-ink focus:border-accent-500 focus:outline-none disabled:cursor-not-allowed"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}
