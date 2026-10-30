import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "About", description: "Doctraders connects agro buyers and sellers across India and handles the deal for both sides." };

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About us" title="One trusted middleman between buyers and sellers">
        Doctraders connects buyers and sellers of agro products across India and handles the deal for both sides.
      </PageIntro>
      <Section tone="white">
        <Container className="mx-auto max-w-3xl space-y-5 text-lg text-ink-700">
          <p>Sellers post what they have. Buyers post what they need. When someone is interested, our team talks to both sides by phone or WhatsApp, agrees the price and terms, and turns it into a deal.</p>
          <p>Your name and contact details stay private. The other side only sees an alias such as Seller #48213. We are the only link between you, and we earn commission only after a deal is completed.</p>
          <p>Registration is open and accounts are active straight away. We do not check documents, so always use your own judgement before you trade. We can block any account or listing that misuses the platform. We do not guarantee any deal.</p>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
