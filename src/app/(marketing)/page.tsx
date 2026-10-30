import { ChevronRight, EyeOff, Handshake, Inbox, PackagePlus, PhoneCall, Truck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { UNIT_LABELS, UNITS } from "@/lib/constants";
import type { PublicListing } from "@/lib/types";
import { connectDB } from "@/server/db";
import { listActiveCategories } from "@/server/services/categories";
import { searchPublicListings } from "@/server/services/listings";
import { categoryIcon } from "@/components/category-icon";
import { ListingCard } from "@/components/listings/listing-card";
import { WelcomeCard } from "@/components/site/welcome-card";
import { Button, Container, EmptyState, Input } from "@/components/ui";

export const dynamic = "force-dynamic";

const TRUST = [
  { icon: Users, title: "Direct buyers and sellers", text: "Farmers, mills, traders and wholesalers" },
  { icon: EyeOff, title: "Contact details stay private", text: "Doctraders is the only link" },
  { icon: Wallet, title: "Free to join", text: "No joining or listing fee" },
  { icon: Handshake, title: "Pay after the deal", text: "Commission only on completion" },
];

const STEPS = [
  { icon: PackagePlus, title: "Post what you have or need", text: "Sellers post offers with photos. Buyers post requirements. Free and live at once." },
  { icon: Inbox, title: "Click “I'm interested”", text: "Found a match? Tell us the quantity. Your interest comes straight to the Doctraders team." },
  { icon: PhoneCall, title: "We connect you", text: "We call both sides, agree price and terms, and turn it into a deal." },
  { icon: Truck, title: "Track payment and shipping", text: "Follow payments and every shipment lot. Commission is due only after completion." },
];

export default async function HomePage() {
  await connectDB();
  const [categories, offers, requirements] = await Promise.all([
    listActiveCategories(),
    searchPublicListings({ kind: "offer", page: 1, limit: 5 }),
    searchPublicListings({ kind: "requirement", page: 1, limit: 5 }),
  ]);

  return (
    <>
      {/* ---- top section: categories | banner | account card (equal height) ---- */}
      <section className="bg-paper py-5">
        <Container className="grid gap-4 lg:h-108 lg:grid-cols-[18rem_1fr_20rem]">
          <nav aria-label="Categories" className="hidden flex-col rounded-lg border border-ink-100 bg-white lg:flex">
            <p className="border-b border-ink-100 px-5 py-3 text-sm font-semibold text-ink-900">Categories</p>
            {categories.slice(0, 8).map((c) => {
              const Icon = categoryIcon(c.slug);
              return (
                <Link key={c.slug} href={`/listings?category=${c.slug}`} className="group flex flex-1 items-center gap-3 px-5 hover:bg-brand-50">
                  <Icon className="size-5 shrink-0 text-ink-500 group-hover:text-brand-600" strokeWidth={1.6} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink-900 group-hover:text-brand-600">{c.name}</span>
                    {c.examples && <span className="block truncate text-xs text-ink-500">{c.examples}</span>}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-300 group-hover:text-brand-600" />
                </Link>
              );
            })}
          </nav>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-lg bg-linear-to-br from-brand-700 to-brand-500 p-8 text-white sm:p-10">
            <div aria-hidden className="absolute -right-24 -top-24 size-96 rounded-full bg-white/10" />
            <div aria-hidden className="absolute -bottom-32 right-24 size-80 rounded-full bg-white/10" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">B2B agro trade, handled for you</p>
              <h1 className="mt-3 max-w-xl text-3xl font-bold leading-[1.1] sm:text-5xl">
                Direct Buyers.<br />Direct Sellers.<br /><span className="text-sand-300">Zero Joining Fee.</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/90">
                Post what you sell or what you need. Doctraders connects both sides, handles the deal and tracks payment and shipping.
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white px-7 text-brand-700 hover:bg-ink-50"><Link href="/register">Join free</Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/70 bg-transparent px-7 text-white hover:bg-white/10"><Link href="/listings">Browse listings</Link></Button>
            </div>
          </div>

          <WelcomeCard />
        </Container>
      </section>

      {/* ---- trust strip ---- */}
      <Container className="mt-4">
        <ul className="grid divide-ink-100 rounded-lg border border-ink-100 bg-white sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700"><Icon className="size-5" /></span>
              <span><span className="block text-sm font-semibold text-ink-900">{title}</span><span className="block text-xs text-ink-500">{text}</span></span>
            </li>
          ))}
        </ul>
      </Container>

      {/* ---- request for quotation ---- */}
      <Container className="mt-8">
        <section id="rfq" className="grid scroll-mt-32 overflow-hidden rounded-lg bg-linear-to-r from-ink-900 to-ink-700 text-white lg:grid-cols-[1.1fr_1fr]">
          <div className="p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Post a requirement</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Tell sellers what you need</h2>
            <p className="mt-3 max-w-md text-ink-200">Post your requirement once. Sellers who have it show interest, and the Doctraders team gets you the best offer.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-100">
              <li>✓ Free to post</li><li>✓ Doctraders talks to the sellers for you</li><li>✓ Your contact details stay private</li>
            </ul>
          </div>
          <form action="/dashboard/listings/new" className="space-y-3 bg-white p-6 text-ink-900 sm:p-8">
            <input type="hidden" name="kind" value="requirement" />
            <p className="font-semibold">What are you looking for?</p>
            <Input name="title" placeholder="Product name (e.g. Basmati rice 1121)" aria-label="Product name" />
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Input name="quantity" type="number" min="0" placeholder="Quantity" aria-label="Quantity" />
              <select name="unit" aria-label="Unit" defaultValue="bag" className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm">
                {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full rounded-full">Post requirement</Button>
            <p className="text-xs text-ink-500">You will be asked to log in or register free first.</p>
          </form>
        </section>
      </Container>

      <ProductRow title="Featured offers" subtitle="Sellers with goods ready to sell" href="/listings?kind=offer" items={offers.items} empty="No offers yet. Be the first to post one." />
      <ProductRow title="Buyer requirements" subtitle="Buyers looking for suppliers" href="/listings?kind=requirement" items={requirements.items} empty="No requirements yet." />

      {/* ---- categories ---- */}
      <Container className="mt-12">
        <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">Browse by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = categoryIcon(c.slug);
            return (
              <Link key={c.slug} href={`/listings?category=${c.slug}`} className="group flex flex-col items-center gap-3 rounded-lg border border-ink-100 bg-white p-5 text-center transition hover:border-brand-500 hover:shadow-card">
                <span className="grid size-14 place-items-center rounded-full bg-ink-50 text-ink-700 transition group-hover:bg-brand-100 group-hover:text-brand-700"><Icon className="size-7" strokeWidth={1.5} /></span>
                <span className="text-sm font-semibold text-ink-900">{c.name}</span>
                {c.examples && <span className="text-xs text-ink-500">{c.examples}</span>}
              </Link>
            );
          })}
        </div>
      </Container>

      {/* ---- how it works ---- */}
      <Container className="mt-12">
        <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">How Doctraders works</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-lg border border-ink-100 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-full bg-ink-900 text-brand-300"><Icon className="size-5" /></span>
                <span className="text-2xl font-bold text-ink-100">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold text-ink-900">{title}</h3>
              <p className="mt-1 text-sm text-ink-600">{text}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* ---- buyer / seller split ---- */}
      <Container className="mt-12 grid gap-4 md:grid-cols-2">
        {[
          { title: "I want to buy", text: "Post a requirement and let sellers come to you.", href: "/buyers", cta: "Source as a buyer" },
          { title: "I want to sell", text: "List your products and reach buyers across India.", href: "/sellers", cta: "Sell as a seller" },
        ].map((b) => (
          <div key={b.title} className="flex items-center justify-between gap-4 rounded-lg border border-ink-100 bg-white p-6">
            <div>
              <h3 className="text-lg font-bold text-ink-900">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{b.text}</p>
            </div>
            <Button asChild variant="secondary" className="shrink-0 rounded-full"><Link href={b.href}>{b.cta}</Link></Button>
          </div>
        ))}
      </Container>
    </>
  );
}

function ProductRow({ title, subtitle, href, items, empty }: { title: string; subtitle: string; href: string; items: PublicListing[]; empty: string }) {
  return (
    <Container className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h2>
          <p className="text-sm text-ink-500">{subtitle}</p>
        </div>
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800 hover:text-ink-950">View all <ChevronRight className="size-4" /></Link>
      </div>
      {items.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {items.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      ) : (
        <div className="mt-4"><EmptyState title={empty} /></div>
      )}
    </Container>
  );
}
