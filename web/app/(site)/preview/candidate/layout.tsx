import { notFound } from "next/navigation";
import { CandidateBanner } from "@/components/preview/candidate-banner";
import { candidatePreviewEnabled } from "@/lib/config/candidate-preview";

/** Every candidate-preview route carries the candidate warning. With the preview off, nothing here renders at all. */
export default function CandidatePreviewLayout({ children }: { children: React.ReactNode }) {
  if (!candidatePreviewEnabled()) notFound();
  return (
    <>
      <CandidateBanner />
      {children}
    </>
  );
}
