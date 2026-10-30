import type { Metadata } from "next";
import Link from "next/link";
import { Button, EmptyState, Logo } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-4">
      <Link href="/" aria-label="Doctraders home" className="text-center"><Logo /></Link>
      <EmptyState title="This page isn't available" action={<Button asChild className="rounded-full"><Link href="/listings">Browse listings</Link></Button>}>
        The listing may have been closed, or the link may be wrong.
      </EmptyState>
    </main>
  );
}
