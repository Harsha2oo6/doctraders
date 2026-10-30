import { Check } from "lucide-react";
import { Container, Section } from "@doctraders/ui";
import { CtaBand } from "./cta-band";
import { PageIntro } from "./page-intro";

/** One template for the Buyers, Sellers and Logistics pages. */
export function AudiencePage({ eyebrow, title, intro, benefits, who }: {
  eyebrow: string; title: string; intro: string; benefits: string[]; who: string[];
}) {
  return (
    <>
      <PageIntro eyebrow={eyebrow} title={title}>{intro}</PageIntro>
      <Section tone="white">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">What you get</h2>
            <ul className="mt-5 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex gap-3 text-ink-700"><Check className="mt-0.5 size-5 shrink-0 text-brand-600" />{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-ink-900">Who can register</h2>
            <ul className="mt-5 space-y-3">
              {who.map((w) => (
                <li key={w} className="flex gap-3 text-ink-700"><Check className="mt-0.5 size-5 shrink-0 text-brand-600" />{w}</li>
              ))}
            </ul>
            <p className="mt-6 rounded-lg bg-brand-50 p-4 text-sm text-brand-700">Brokers and agents are not allowed. Only direct parties can join.</p>
          </div>
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
