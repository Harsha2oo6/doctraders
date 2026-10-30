import type { Metadata } from "next";
import { connectDB } from "@/server/db";
import { listActiveCategories } from "@/server/services/categories";
import { Card, CardBody, Container, Section } from "@/components/ui";
import { CtaBand } from "@/components/site/cta-band";
import { PageIntro } from "@/components/site/page-intro";

export const metadata: Metadata = { title: "Products and Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await connectDB();
  const categories = await listActiveCategories();
  return (
    <>
      <PageIntro eyebrow="Products" title="Products and categories">
        Agro products from farmers, mills, processors, traders and wholesalers across India.
      </PageIntro>
      <Section tone="white">
        <Container className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.slug}>
              <CardBody>
                <h2 className="font-sans text-lg font-semibold text-ink-900"><a href={`/listings?category=${c.slug}`} className="hover:text-brand-600">{c.name}</a></h2>
                {c.examples && <p className="mt-2 text-sm text-ink-600">{c.examples}</p>}
              </CardBody>
            </Card>
          ))}
        </Container>
      </Section>
      <CtaBand />
    </>
  );
}
