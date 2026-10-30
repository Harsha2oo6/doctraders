import type { Metadata } from "next";
import { Container, Section } from "@doctraders/ui";
import { CtaBand } from "@/components/cta-band";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About us" title="Trade is built on trust. We verify it.">
        Doctraders connects verified direct buyers and verified direct sellers across every sector.
      </PageIntro>
      <Section tone="white">
        <Container className="mx-auto max-w-3xl space-y-5 text-lg text-ink-700">
          <p>Cross-border B2B trade is full of middlemen, unverified claims and hidden costs. Doctraders removes them. We are the only intermediary on the platform, and we earn only when your deal completes.</p>
          <p>Every company uploads documents and is approved by our team before it can post, search or see contacts. There are no brokers and no agents, only the companies that actually buy and sell.</p>
          <p>We verify documents but do not guarantee any deal, and we never hold or handle payments between parties.</p>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
