import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "FAQ" };

const FAQ = [
  ["Is registration really free?", "Yes. There is no joining fee, listing fee or subscription."],
  ["When do I pay?", "Only after a deal is completed. A commission percentage, agreed per deal, is invoiced then."],
  ["Can brokers or agents register?", "No. Only direct buyers, direct sellers and logistics providers can join."],
  ["Which documents do I need?", "Business registration, tax ID (GST/PAN), bank proof, and licences such as IEC or FSSAI where relevant. The form shows the exact list for your company type."],
  ["When can I see other companies' contact details?", "After a deal is initiated through Doctraders and both parties accept the commission agreement."],
  ["Does Doctraders handle payments?", "No. We do not hold or handle payments between parties, and we do not guarantee any deal."],
  ["What if I deal directly after being introduced?", "The terms include an anti-bypass clause: commission is payable on any deal between parties introduced through the platform."],
];

export default function FaqPage() {
  return (
    <>
      <PageIntro eyebrow="FAQ" title="Frequently asked questions" />
      <Section tone="white">
        <Container className="mx-auto max-w-3xl divide-y divide-ink-100">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink-900">
                {q}<span className="text-brand-600 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-ink-600">{a}</p>
            </details>
          ))}
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
