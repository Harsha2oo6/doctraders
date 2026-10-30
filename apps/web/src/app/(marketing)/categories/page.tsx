import type { Metadata } from "next";
import { CATEGORIES } from "@doctraders/schemas";
import { Card, CardBody, Container, Section } from "@doctraders/ui";
import { CtaBand } from "@/components/cta-band";
import { PageIntro } from "@/components/page-intro";

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
