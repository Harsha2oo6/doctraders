import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "How It Works", description: "Post what you sell or need, show interest, and Doctraders handles the deal, payment tracking and shipping updates." };

const STEPS = [
  ["Register free", "Choose whether you want to sell, buy or both. Your account is active straight away."],
  ["Post what you have or need", "Sellers post offers with photos. Buyers post requirements. Listings go live at once and show only an alias, never your name."],
  ["Click “I'm interested”", "Found a match? Tell us the quantity you want. Your interest goes straight to the Doctraders team."],
  ["We talk to both sides", "Our team calls you and the other side, and works out price and terms. You can follow the status under My enquiries."],
  ["The deal is created", "Once both sides agree, we record the deal with its quantity and price. It appears under My deals."],
  ["Track payment and shipping", "We record each payment. The seller posts an update for each lot: packed, shipped, reached. You get a notification at every step."],
  ["Commission after completion", "When the deal is complete, commission becomes due to Doctraders. No deal, no charge."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro eyebrow="How it works" title="From your first post to a completed deal" />
      <Section tone="white">
        <Container>
          <ol className="mx-auto max-w-3xl space-y-6">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-500 font-bold text-ink-950">{i + 1}</span>
                <div>
                  <h3 className="font-sans text-lg font-semibold text-ink-900">{title}</h3>
                  <p className="mt-1 text-ink-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
