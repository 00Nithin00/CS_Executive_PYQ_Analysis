"use client";

import { m } from "motion/react";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { loginAction, signupAction, type AuthFormState } from "@/lib/auth/actions";
import { safeNextPath } from "@/lib/auth/redirect";
import { Button } from "@/components/ui/button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const wantsPro = params.get("plan") === "pro";
  const [state, action, pending] = useActionState<AuthFormState, FormData>(mode === "login" ? loginAction : signupAction, {});
  const signup = mode === "signup";

  return (
    <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] rounded-xl border border-line bg-surface p-6 shadow-md sm:p-8">
      <h1 className="text-2xl font-semibold">{signup ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1.5 text-sm text-ink-3">
        {signup
          ? wantsPro
            ? "Start with a free account. Pro access will be available from your dashboard when it opens."
            : "Free forever for official resources and the question browser."
          : "Log in to your dashboard."}
      </p>

      {state.error && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-md bg-danger-50 p-3 text-sm text-danger-600">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}

      <form action={action} className="mt-6 space-y-4" noValidate>
        <input type="hidden" name="next" value={next} />
        {signup && <Field name="name" label="Full name" autoComplete="name" defaultValue={state.values?.name} error={state.fieldErrors?.name} />}
        <Field name="email" type="email" label="Email" autoComplete="email" defaultValue={state.values?.email} error={state.fieldErrors?.email} inputMode="email" />
        <Field
          name="password"
          type="password"
          label="Password"
          autoComplete={signup ? "new-password" : "current-password"}
          error={state.fieldErrors?.password}
          hint={signup ? "At least 8 characters." : undefined}
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Please wait…" : signup ? "Create account" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-3">
        {signup ? "Already have an account? " : "New here? "}
        <Link href={`${signup ? "/login" : "/signup"}${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-accent-700 hover:underline">
          {signup ? "Log in" : "Create a free account"}
        </Link>
      </p>
    </m.div>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  error,
  hint,
  inputMode,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  inputMode?: "email" | "text";
}) {
  const id = `f-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        required
        className="h-12 w-full rounded-md border border-line bg-surface px-3.5 text-base text-ink transition-colors placeholder:text-ink-4 focus:border-accent-500 focus:outline-none aria-[invalid=true]:border-danger-600"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AuthFormSkeleton() {
  return <div className="h-[460px] w-full max-w-[420px] animate-pulse rounded-xl border border-line bg-surface" />;
}
