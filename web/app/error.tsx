"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-display-md font-semibold">Something went wrong.</h1>
      <p className="mt-3 text-ink-3">The page couldn’t be loaded. Please try again.</p>
      {error.digest && <p className="tabular mt-2 text-xs text-ink-3">Reference: {error.digest}</p>}
      <Button className="mt-8" onClick={reset}>Try again</Button>
    </main>
  );
}
