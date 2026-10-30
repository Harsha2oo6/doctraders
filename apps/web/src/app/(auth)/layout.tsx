import Link from "next/link";
import type { ReactNode } from "react";
import { MockProvider } from "@doctraders/mock";
import { Logo } from "@doctraders/ui";

/** Minimal centered layout for Register and Login. MockProvider starts the fake API. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
        <Link href="/"><Logo /></Link>
        <Link href="/" className="text-sm text-ink-600 hover:text-ink-900">Back to site</Link>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16">
        <MockProvider>{children}</MockProvider>
      </main>
    </div>
  );
}
