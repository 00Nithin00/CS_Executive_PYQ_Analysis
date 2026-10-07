import type { ExamAttempt } from "@/types/domain";
import data from "./attempts.json";

/** Completed Syllabus 2022 Executive attempts (first exam: December 2023). Oldest first. */
export const ATTEMPTS = data.attempts as ExamAttempt[];

export const NEXT_ATTEMPT = data.next;

const byId = new Map(ATTEMPTS.map((a) => [a.id, a]));
export const attemptLabel = (id: string, short = false) => {
  const a = byId.get(id as ExamAttempt["id"]);
  return a ? (short ? a.shortLabel : a.label) : id;
};
export const attemptIndex = (id: string) => ATTEMPTS.findIndex((a) => a.id === id);
