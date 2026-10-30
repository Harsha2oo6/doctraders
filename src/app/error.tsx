"use client";

import { ErrorState } from "@/components/ui";

/** Catches server-render failures (for example the database being unreachable) on any page. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <ErrorState message="Please try again in a moment." onRetry={reset} />
    </main>
  );
}
