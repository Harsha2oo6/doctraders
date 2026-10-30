import { BadgeCheck, Ban, ChevronRight, FileCheck2, Handshake, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { listings } from "@/lib/sample-data";
import { CATEGORIES } from "@/lib/constants";
import { Button, Container, Input } from "@/components/ui";
import { categoryIcon } from "@/components/category-icon";
import { ListingCard } from "@/components/listings/listing-card";

const TRUST = [
  { icon: BadgeCheck, title: "Verified companies", text: "Documents checked by our team" },
  { icon: Ban, title: "No brokers or agents", text: "Direct buyers and sellers only" },
  { icon: Wallet, title: "Free to join", text: "No joining or listing fee" },
  { icon: Handshake, title: "Pay after the deal", text: "Commission only on completion" },
];

const STEPS = [
  { icon: FileCheck2, title: "Register free", text: "Create an account and upload your business documents." },
  { icon: ShieldCheck, title: "Get verified", text: "We review your documents and give you a Verified badge." },
  { icon: BadgeCheck, title: "Post or find", text: "Post a requirement or offer, or search verified listings." },
  { icon: Handshake, title: "Close with us", text: "We connect both sides. Commission is due only after completion." },
];

export default function HomePage() {
  const featured = listings.filter((l) => l.status === "active");
  const offers = featured.filter((l) => l.kind === "offer").slice(0, 5);
  const requirements = featured.filter((l) => l.kind === "requirement").slice(0, 5);

  return (
    <>
      {/* ---- top section: categories | banner | account card (equal height) ---- */}
      <section className="bg-paper py-5">
        <Container className="grid gap-4 lg:h-108 lg:grid-cols-[18rem_1fr_20rem]">
          <nav aria-label="Categories" className="hidden flex-col rounded-lg border border-ink-100 bg-white lg:flex">
            <p className="border-b border-ink-100 px-5 py-3 text-sm font-semibold text-ink-900">Categories</p>
            {CATEGORIES.map((c) => {
              const Icon = categoryIcon(c.slug);
              return (
                <Link key={c.slug} href={`/listings?category=${c.slug}`} className="group flex flex-1 items-center gap-3 px-5 hover:bg-brand-50">
                  <Icon className="size-5 shrink-0 text-ink-500 group-hover:text-brand-600" strokeWidth={1.6} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink-900 group-hover:text-brand-600">{c.name}</span>
                    <span className="block truncate text-xs text-ink-500">{c.examples}</span>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-white/80">B2B trade, made trustworthy</p>
              <h1 className="mt-3 max-w-xl text-3xl font-bold leading-[1.1] sm:text-5xl">
                Verified Buyers.<br />Verified Sellers.<br /><span className="text-sand-300">Zero Joining Fee.</span>
              </h1>
              <p className="mt-4 max-w-lg text-base text-white/90">
                Trade agro, food, metals, industrial goods and logistics directly with companies whose documents we have checked.
              </p>
            </div>
            <div className="relative mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-white px-7 text-brand-700 hover:bg-ink-50"><Link href="/register">Join free</Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/70 bg-transparent px-7 text-white hover:bg-white/10"><Link href="/listings">Browse listings</Link></Button>
            </div>
          </div>

          <aside className="flex flex-col rounded-lg border border-ink-100 bg-white p-5">
            <p className="text-lg font-bold text-ink-900">Welcome to Doctraders</p>
            <p className="mt-1 text-sm text-ink-500">Trade with verified companies worldwide.</p>
            <Button asChild className="mt-4 rounded-full"><Link href="/register">Join free</Link></Button>
            <Button asChild variant="outline" className="mt-2 rounded-full"><Link href="/login">Sign in</Link></Button>
            <ul className="mt-5 space-y-3 border-t border-ink-100 pt-5 text-sm text-ink-700">
              <li className="flex gap-2.5"><ShieldCheck className="size-4 shrink-0 translate-y-0.5 text-info" />Every company verified</li>
              <li className="flex gap-2.5"><Ban className="size-4 shrink-0 translate-y-0.5 text-info" />No brokers or agents</li>
              <li className="flex gap-2.5"><Wallet className="size-4 shrink-0 translate-y-0.5 text-info" />Pay only after the deal</li>
            </ul>
            <Link href="#rfq" className="mt-auto rounded-lg bg-brand-50 p-3 text-sm hover:bg-brand-100">
              <span className="block font-semibold text-ink-900">Looking for a product?</span>
              <span className="text-brand-700">Post a requirement &rarr;</span>
            </Link>
          </aside>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">Request for quotation</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">One request, multiple verified quotes</h2>
            <p className="mt-3 max-w-md text-ink-200">Tell us what you need. Matching verified sellers will respond with their price and terms.</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-100">
              <li>✓ Free to post</li><li>✓ Only verified sellers can respond</li><li>✓ Your contact details stay private until a deal starts</li>
            </ul>
          </div>
          <form action="/register" className="space-y-3 bg-white p-6 text-ink-900 sm:p-8">
            <p className="font-semibold">What are you looking for?</p>
            <Input name="product" placeholder="Product name (e.g. Basmati rice 1121)" aria-label="Product name" />
            <div className="grid grid-cols-[1fr_7rem] gap-3">
              <Input name="quantity" type="number" min="0" placeholder="Quantity" aria-label="Quantity" />
              <select name="unit" aria-label="Unit" className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm"><option>MT</option><option>KG</option><option>Container</option><option>Piece</option></select>
            </div>
            <Button type="submit" className="w-full rounded-full">Post requirement</Button>
            <p className="text-xs text-ink-500">You will be asked to register free to submit.</p>
          </form>
        </section>
      </Container>

      {/* ---- featured offers ---- */}
      <ProductRow title="Featured offers" subtitle="Verified sellers with goods ready to ship" href="/listings?type=offer" items={offers} />
      <ProductRow title="Buyer requirements" subtitle="Verified buyers looking for suppliers" href="/listings?type=requirement" items={requirements} />

      {/* ---- categories ---- */}
      <Container className="mt-12">
        <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">Browse by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => {
            const Icon = categoryIcon(c.slug);
            return (
              <Link key={c.slug} href={`/listings?category=${c.slug}`} className="group flex flex-col items-center gap-3 rounded-lg border border-ink-100 bg-white p-5 text-center transition hover:border-brand-500 hover:shadow-card">
                <span className="grid size-14 place-items-center rounded-full bg-ink-50 text-ink-700 transition group-hover:bg-brand-100 group-hover:text-brand-700"><Icon className="size-7" strokeWidth={1.5} /></span>
                <span className="text-sm font-semibold text-ink-900">{c.name}</span>
                <span className="text-xs text-ink-500">{c.examples}</span>
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
          { title: "I want to buy", text: "Post a requirement and let verified sellers come to you.", href: "/buyers", cta: "Source as a buyer" },
          { title: "I want to sell", text: "List your offers and reach verified buyers in new markets.", href: "/sellers", cta: "Sell as a seller" },
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

function ProductRow({ title, subtitle, href, items }: { title: string; subtitle: string; href: string; items: typeof listings }) {
  return (
    <Container className="mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink-900 sm:text-2xl">{title}</h2>
          <p className="text-sm text-ink-500">{subtitle}</p>
        </div>
        <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800 hover:text-ink-950">View all <ChevronRight className="size-4" /></Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {items.map((l) => <ListingCard key={l.id} listing={l} />)}
      </div>
    </Container>
  );
}
