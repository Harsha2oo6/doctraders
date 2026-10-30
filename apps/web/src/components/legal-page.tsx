import type { ReactNode } from "react";
import { Container, Section } from "@doctraders/ui";
import { PageIntro } from "./page-intro";

/**
 * Wrapper for the four legal pages. The text below each page is PLACEHOLDER copy:
 * it must be reviewed and replaced by your lawyer before launch.
 */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageIntro eyebrow="Legal" title={title} />
      <Section tone="white">
        <Container className="mx-auto max-w-3xl space-y-4 text-ink-700 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink-900">
          <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand-700">Draft text. Pending legal review before launch.</p>
          {children}
        </Container>
      </Section>
    </>
  );
}
