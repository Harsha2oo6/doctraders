import type { Metadata } from "next";
import { Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "FAQ" };

const FAQ = [
  ["Is registration really free?", "Yes. There is no joining fee, listing fee or subscription."],
  ["When do I pay?", "Only after a deal is completed. Commission is agreed per deal with the Doctraders team."],
  ["Do I need to upload documents or wait for approval?", "No. Your account is active as soon as you register. GST number is optional."],
  ["Can I both buy and sell?", "Yes. Choose “Both” when you register, or add the other role later from your profile."],
  ["Will the other side see my name or number?", "No. They only see an alias such as Seller #48213. The Doctraders team is the only link between you."],
  ["What happens after I click “I'm interested”?", "The Doctraders team is notified and contacts both sides. You can follow the status under My enquiries."],
  ["How do I track my deal?", "Under My deals you can see how much is paid and how much has shipped and reached. Sellers post an update for each shipment lot."],
  ["Does Doctraders handle payments?", "No. We do not hold payments between parties and we do not guarantee any deal. We only keep a record of payments on your deal."],
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
