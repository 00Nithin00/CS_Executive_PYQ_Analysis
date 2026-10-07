import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm, AuthFormSkeleton } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
