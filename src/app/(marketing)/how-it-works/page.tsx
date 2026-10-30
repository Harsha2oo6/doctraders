import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "How It Works" };

const STEPS = [
  ["Register free", "Create an account as a seller, buyer or logistics provider. Brokers and agents cannot register."],
  ["Upload documents", "Submit business registration, tax ID, bank proof and any licences for your company type."],
  ["Admin verification", "Our team reviews your documents. Your status moves from Pending to Approved, or Rejected with a reason. You get an email at every step."],
  ["Post or search", "Approved members post requirements or offers and search by product, country, port, quantity and category. Smart matching suggests the right partners."],
  ["Show interest", "Press the interest button. Doctraders handles the connection. Contact details stay hidden until a deal is initiated."],
  ["Accept the commission agreement", "Both parties accept a digital commission agreement before contact details are shared."],
  ["Track the deal", "Follow it through Enquiry, Negotiation, Agreement, Shipped and Completed, and upload documents along the way."],
  ["Pay commission on completion", "After the deal completes we issue a commission invoice. No deal, no charge."],
];

export default function HowItWorksPage() {
  return (
    <>
      <PageIntro eyebrow="How it works" title="A simple, verified path from sign-up to closed deal" />
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
