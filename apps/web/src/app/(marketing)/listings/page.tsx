import type { Metadata } from "next";
import Link from "next/link";
import { listings } from "@doctraders/mock";
import { CATEGORIES } from "@doctraders/schemas";
import { Button, Container, EmptyState, Input } from "@doctraders/ui";
import { ListingCard } from "@/components/listing-card";

export const metadata: Metadata = { title: "Browse Listings" };

type Params = { q?: string; category?: string; type?: string };

/**
 * Public browse page. Filters use a plain GET form (works without JavaScript).
 * Company names are never shown, only "Verified Seller #id". Contact needs an approved account.
 */
export default async function ListingsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { q = "", category = "", type = "" } = await searchParams;
  const results = listings.filter(
    (l) =>
      l.status === "active" &&
      (!category || l.category === category) &&
      (!type || l.kind === type) &&
      `${l.product} ${l.location} ${l.country} ${l.specification}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Container className="py-8">
      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        <form className="h-fit space-y-5 rounded-xl border border-ink-100 bg-white p-5">
          <p className="font-semibold text-ink-900">Filters</p>
          <label className="block space-y-1.5 text-sm"><span className="font-medium text-ink-800">Keyword</span><Input name="q" defaultValue={q} placeholder="Product, port, country" /></label>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-1 font-medium text-ink-800">Category</legend>
            <label className="flex items-center gap-2"><input type="radio" name="category" value="" defaultChecked={!category} className="accent-ink-900" />All</label>
            {CATEGORIES.map((c) => (
              <label key={c.slug} className="flex items-center gap-2"><input type="radio" name="category" value={c.slug} defaultChecked={category === c.slug} className="accent-ink-900" />{c.name}</label>
            ))}
          </fieldset>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-1 font-medium text-ink-800">Type</legend>
            {[["", "Offers and requirements"], ["offer", "Offers"], ["requirement", "Requirements"]].map(([v, label]) => (
              <label key={v} className="flex items-center gap-2"><input type="radio" name="type" value={v} defaultChecked={type === v} className="accent-ink-900" />{label}</label>
            ))}
          </fieldset>
          <Button type="submit" className="w-full rounded-full">Apply filters</Button>
          <Link href="/listings" className="block text-center text-xs text-ink-500 underline">Clear all</Link>
        </form>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-ink-900">{results.length} listings</h1>
            <p className="text-xs text-ink-500">Company names are hidden. <Link href="/register" className="font-semibold text-ink-800 underline">Join free</Link> to contact verified companies.</p>
          </div>
          {results.length === 0 ? (
            <EmptyState title="No listings match">Try different keywords or clear the filters.</EmptyState>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {results.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
