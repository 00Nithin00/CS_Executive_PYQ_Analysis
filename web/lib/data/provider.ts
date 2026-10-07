// The boundary between the UI and wherever the data lives.
// Today: mockProvider (content/ + mock/). Later: a Postgres provider fed by the approved web_export.
// The service layer (./service.ts) and the UI only ever talk to this interface.
import type { SubjectAnalytics, SubjectSummary } from "@/types/analytics";
import type { ExamAttempt, OfficialResource, Provenance, QuestionRecord, ResourceType, Subject, SubjectSlug, Taxonomy } from "@/types/domain";

export interface QuestionSet {
  provenance: Provenance;
  generatedFrom: string;
  records: QuestionRecord[];
}

export interface ResourceFilter {
  type?: ResourceType;
  subject?: SubjectSlug;
  attempt?: string;
}

export interface DataProvider {
  readonly name: string;
  listSubjects(): Promise<Subject[]>;
  getSubject(slug: string): Promise<Subject | null>;
  getTaxonomy(slug: SubjectSlug): Promise<Taxonomy | null>;
  listAttempts(): Promise<ExamAttempt[]>;
  /** Raw question records. Server-only; the service layer shapes them per viewer. */
  getQuestionSet(slug: SubjectSlug): Promise<QuestionSet | null>;
  getSummary(slug: SubjectSlug): Promise<SubjectSummary | null>;
  getAnalytics(slug: SubjectSlug): Promise<SubjectAnalytics | null>;
  listResources(filter?: ResourceFilter): Promise<OfficialResource[]>;
  resourcesVerifiedOn(): Promise<string>;
}
