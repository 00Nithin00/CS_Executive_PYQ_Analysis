import type { PriorityLabel } from "@/types/analytics";
import type { QuestionType, RepeatStatus, ResourceType } from "@/types/domain";

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  mcq: "MCQ",
  descriptive_theory: "Descriptive",
  short_note: "Short note",
  comment_true_false: "Comment on statement",
  practical_application: "Practical / application",
  case_based: "Case study",
  numerical: "Numerical",
  drafting: "Drafting",
};

export const REPEAT_LABEL: Record<RepeatStatus, string> = {
  FIRST_SEEN: "First appearance",
  EXACT_REPEAT: "Exact repeat",
  CONCEPTUAL_REPEAT: "Conceptual repeat",
  TOPIC_REPEAT: "Same topic, new concept",
  CHAPTER_REPEAT: "Same chapter, new topic",
  UNRESOLVED: "Under review",
};

export const REPEAT_HELP: Record<RepeatStatus, string> = {
  FIRST_SEEN: "Not seen in an earlier attempt in this window.",
  EXACT_REPEAT: "Essentially the same question asked again.",
  CONCEPTUAL_REPEAT: "Different wording, same underlying provision and rule.",
  TOPIC_REPEAT: "Same syllabus topic, but a different concept was tested.",
  CHAPTER_REPEAT: "Same chapter, different topic. Not a repeated question.",
  UNRESOLVED: "Repeat relationship still being verified.",
};

export const PRIORITY_LABEL: Record<PriorityLabel, string> = {
  HIGH: "High priority",
  MEDIUM: "Medium priority",
  LOW: "Low priority",
  INSUFFICIENT_HISTORY: "Insufficient history",
  NOT_EXAMINABLE: "Not examinable",
};

export const RESOURCE_TYPE_LABEL: Record<ResourceType, string> = {
  STUDY_MATERIAL: "Study material",
  QUESTION_PAPER: "Question paper",
  GUIDELINE_ANSWER: "Guideline answers",
  SUPPLEMENT: "Supplement",
  SYLLABUS: "Syllabus",
  NOTICE: "Notice",
  RELEVANT_MATERIAL: "Relevant material",
};

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
