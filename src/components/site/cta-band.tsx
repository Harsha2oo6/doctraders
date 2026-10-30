import Link from "next/link";
import { Button, Container } from "@/components/ui";

/** Closing call-to-action reused at the bottom of inner pages. */
export function CtaBand() {
  return (
    <section className="bg-ink-900 py-14 text-white">
      <Container className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to trade with verified partners?</h2>
          <p className="mt-1 text-ink-200">Registration is free. Pay commission only after a deal is completed.</p>
        </div>
        <Button asChild size="lg" className="rounded-full px-8"><Link href="/register">Join free</Link></Button>
      </Container>
    </section>
  );
}
