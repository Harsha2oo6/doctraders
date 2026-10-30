import type { Metadata } from "next";
import { DEFAULT_CATEGORIES as CATEGORIES } from "@/lib/constants";
import { Card, CardBody, Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Products and Categories" };

export default function CategoriesPage() {
  return (
    <>
      <PageIntro eyebrow="Products" title="Products and categories">
        Agro, food, metals, industrial goods, imports, exports and logistics services, all from verified direct sellers.
      </PageIntro>
      <Section tone="white">
        <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Card key={c.slug}>
              <CardBody>
                <h2 className="font-sans text-lg font-semibold text-ink-900">{c.name}</h2>
                <p className="mt-2 text-sm text-ink-600">{c.examples}</p>
              </CardBody>
            </Card>
          ))}
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
