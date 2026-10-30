import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { LISTING_KIND_LABELS } from "@/lib/constants";
import { formatDate, formatINR, formatQty, unitText } from "@/lib/format";
import { connectDB } from "@/server/db";
import { HttpError } from "@/server/http";
import { listActiveCategories } from "@/server/services/categories";
import { getListing } from "@/server/services/listings";
import { Gallery } from "@/components/listings/gallery";
import { InterestButton } from "@/components/listings/interest-button";
import { Badge, Card, CardBody, CardHeader, CardTitle, Container } from "@/components/ui";

export const dynamic = "force-dynamic";

/** Public view only (the same as GET /api/v1/listings/:id for a logged-out visitor). */
const load = cache(async (id: string) => {
  await connectDB();
  try {
    return (await getListing(id, null)).data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    if ((e as Error).name === "CastError") return null;
    throw e;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const l = await load((await params).id);
  if (!l) return { title: "Listing not found" };
  return {
    title: l.title,
    description: `${LISTING_KIND_LABELS[l.kind]}: ${formatQty(l.quantity, l.unit)} in ${l.city}, ${l.state}. ${l.description.slice(0, 140)}`,
    openGraph: l.images[0] ? { images: [l.images[0]] } : undefined,
  };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const l = await load((await params).id);
  if (!l) notFound();
  const category = (await listActiveCategories()).find((c) => c.slug === l.category);

  return (
    <Container className="py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-xs text-ink-500">
        <Link href="/" className="hover:text-ink-900">Home</Link> / <Link href="/listings" className="hover:text-ink-900">Listings</Link>
        {category && <> / <Link href={`/listings?category=${category.slug}`} className="hover:text-ink-900">{category.name}</Link></>}
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Gallery images={l.images} title={l.title} category={l.category} />

        <div className="h-fit space-y-4 rounded-lg border border-ink-100 bg-white p-6">
          <div className="flex items-center gap-2">
            <Badge tone={l.kind === "offer" ? "brand" : "neutral"}>{LISTING_KIND_LABELS[l.kind]}</Badge>
            {category && <span className="text-sm text-ink-500">{category.name}</span>}
          </div>
          <h1 className="text-2xl font-bold text-ink-900">{l.title}</h1>
          <p>
            {l.price ? (
              <><span className="text-3xl font-bold text-ink-900">{formatINR(l.price)}</span> <span className="text-sm text-ink-500">/ {unitText(l.unit)}</span></>
            ) : (
              <span className="text-3xl font-bold text-ink-900">Price on request</span>
            )}
          </p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-500">Quantity</dt><dd className="font-medium text-ink-900">{formatQty(l.quantity, l.unit)}</dd></div>
            <div><dt className="text-ink-500">Min. order</dt><dd className="font-medium text-ink-900">{l.minOrderQuantity ? formatQty(l.minOrderQuantity, l.unit) : "Any"}</dd></div>
            <div><dt className="text-ink-500">Location</dt><dd className="font-medium text-ink-900">{l.city}, {l.state}</dd></div>
            <div><dt className="text-ink-500">Posted</dt><dd className="font-medium text-ink-900">{formatDate(l.createdAt)}</dd></div>
          </dl>
          <p className="flex items-center gap-2 text-sm text-ink-700"><UserRound className="size-4" />{l.owner.alias}</p>
          <InterestButton listing={l} />
          <p className="text-xs text-ink-500">Doctraders will contact you and handle the deal. Contact details stay private.</p>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Description</CardTitle></CardHeader>
        <CardBody><p className="whitespace-pre-line text-sm text-ink-700">{l.description}</p></CardBody>
      </Card>
    </Container>
  );
}
