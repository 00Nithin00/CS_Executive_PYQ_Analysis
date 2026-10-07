import { Suspense } from "react";
import { DashHeading, DashSkeleton } from "@/components/dashboard/dash-ui";
import { SubjectIntelligence } from "@/components/subjects/subject-intelligence";
import { requireUser } from "@/lib/auth/viewer";
import { getSubject } from "@/lib/data/service";

export const metadata = { title: "PYQ Intelligence" };

export default function Page() {
  return (
    <Suspense fallback={<DashSkeleton />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireUser("/dashboard/pyq");
  const clp = (await getSubject("clp"))!;
  return (
    <>
      <DashHeading title="PYQ Intelligence" lead="Company Law & Practice (Paper 522). Other subjects are added as their datasets are verified." />
      <SubjectIntelligence subject={clp} />
    </>
  );
}
