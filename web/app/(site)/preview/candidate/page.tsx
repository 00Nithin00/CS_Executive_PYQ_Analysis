import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CandidatePreviewView } from "@/components/preview/candidate-preview-view";
import { Container } from "@/components/ui/primitives";
import { ATTEMPTS } from "@/content/attempts";
import { CANDIDATE_LABEL, CANDIDATE_ROUTE, candidatePreviewEnabled, candidatePreviewPaths } from "@/lib/config/candidate-preview";
import { loadCandidatePreview } from "@/lib/preview/candidate";

export function generateMetadata(): Metadata {
  if (!candidatePreviewEnabled()) return { robots: { index: false, follow: false } };
  return { title: "Candidate preview (local)", description: CANDIDATE_LABEL, robots: { index: false, follow: false } };
}

/** Local-only: 404 unless CANDIDATE_PREVIEW=1. The production/demo pages never read the candidate. */
export default function CandidatePreviewPage() {
  if (!candidatePreviewEnabled()) notFound();
  return (
    <>
      <PageHeader
        eyebrow="Local preview · not production"
        title="CLP Paper 522: candidate analytics"
        lead="The production analytics pipeline, run on the v0.2 AI desk-review candidate with its review-status overlay."
        crumbs={[{ href: "/", label: "Home" }, { href: CANDIDATE_ROUTE, label: "Candidate preview" }]}
      />
      <Container className="py-10">
        <Suspense fallback={<p className="text-sm text-ink-3">Loading the candidate dataset…</p>}>
          <CandidatePreviewSection />
        </Suspense>
      </Container>
    </>
  );
}

/** Reads the research files at request time, so a changed or missing file shows up on reload. */
async function CandidatePreviewSection() {
  await connection();
  return <CandidatePreviewView result={loadCandidatePreview(candidatePreviewPaths())} attempts={ATTEMPTS} />;
}
