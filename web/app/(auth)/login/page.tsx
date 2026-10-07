import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm, AuthFormSkeleton } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
