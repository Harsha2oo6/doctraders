import type { Metadata } from "next";
import Link from "next/link";
import { INDIAN_STATES, LISTING_KINDS, type ListingKind } from "@/lib/constants";
import { connectDB } from "@/server/db";
import { listActiveCategories } from "@/server/services/categories";
import { searchPublicListings } from "@/server/services/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { Button, Container, EmptyState, Input, Pager, Select } from "@/components/ui";

export const metadata: Metadata = { title: "Browse Listings", description: "Agro offers from sellers and requirements from buyers across India." };
export const dynamic = "force-dynamic";

type Params = { q?: string; category?: string; kind?: string; type?: string; state?: string; page?: string };
const LIMIT = 24;

/**
 * Public browse page (server-rendered for SEO, same service as GET /api/v1/listings).
 * Filters use a plain GET form, so they work without JavaScript. Owners appear only as aliases.
 */
export default async function ListingsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const category = sp.category ?? "";
  const kindRaw = sp.kind ?? sp.type ?? "";
  const kind = LISTING_KINDS.includes(kindRaw as ListingKind) ? (kindRaw as ListingKind) : undefined;
  const state = sp.state ?? "";
  const page = Math.max(1, Number(sp.page) || 1);

  await connectDB();
  const [categories, results] = await Promise.all([
    listActiveCategories(),
    searchPublicListings({ q, category: category || undefined, kind, state: state || undefined, page, limit: LIMIT }),
  ]);

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (kind) params.set("kind", kind);
    if (state) params.set("state", state);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/listings?${s}` : "/listings";
  };

  return (
    <Container className="py-8">
      <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
        <form className="h-fit space-y-5 rounded-xl border border-ink-100 bg-white p-5">
          <p className="font-semibold text-ink-900">Filters</p>
          <label className="block space-y-1.5 text-sm"><span className="font-medium text-ink-800">Keyword</span><Input name="q" defaultValue={q} placeholder="Product or city" /></label>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-1 font-medium text-ink-800">Type</legend>
            {[["", "Offers and requirements"], ["offer", "Offers (for sale)"], ["requirement", "Requirements (wanted)"]].map(([v, label]) => (
              <label key={v} className="flex items-center gap-2"><input type="radio" name="kind" value={v} defaultChecked={(kind ?? "") === v} className="accent-ink-900" />{label}</label>
            ))}
          </fieldset>
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-1 font-medium text-ink-800">Category</legend>
            <label className="flex items-center gap-2"><input type="radio" name="category" value="" defaultChecked={!category} className="accent-ink-900" />All</label>
            {categories.map((c) => (
              <label key={c.slug} className="flex items-center gap-2"><input type="radio" name="category" value={c.slug} defaultChecked={category === c.slug} className="accent-ink-900" />{c.name}</label>
            ))}
          </fieldset>
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-ink-800">State</span>
            <Select name="state" defaultValue={state}>
              <option value="">All states</option>
              {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </label>
          <Button type="submit" className="w-full rounded-full">Apply filters</Button>
          <Link href="/listings" className="block text-center text-xs text-ink-500 underline">Clear all</Link>
        </form>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-ink-900">{results.total.toLocaleString("en-IN")} listings</h1>
            <p className="text-xs text-ink-500">Names and contacts stay private. <Link href="/register" className="font-semibold text-ink-800 underline">Join free</Link> and click &ldquo;I&apos;m interested&rdquo;; we connect you.</p>
          </div>
          {results.items.length === 0 ? (
            <EmptyState title="No listings match" action={<Button asChild variant="outline" size="sm"><Link href="/listings">Clear filters</Link></Button>}>Try different keywords or clear the filters.</EmptyState>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                {results.items.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
              {results.total > LIMIT && <Pager className="mx-auto mt-6 max-w-sm" page={page} limit={LIMIT} total={results.total} hrefFor={hrefFor} />}
            </>
          )}
        </div>
      </div>
    </Container>
  );
}
