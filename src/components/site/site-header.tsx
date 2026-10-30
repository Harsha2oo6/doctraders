"use client";

import { ChevronDown, LayoutGrid, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SyntheticEvent, type ReactNode } from "react";
import { CATEGORIES } from "@/lib/constants";
import { Button, Container, Logo, cn } from "@/components/ui";
import { categoryIcon } from "@/components/category-icon";

type MenuItem = { href: string; label: string; hint?: string };

const MENUS: { label: string; href: string; items?: MenuItem[] }[] = [
  {
    label: "Buyers", href: "/buyers",
    items: [
      { href: "/register", label: "Post a requirement", hint: "Let verified sellers come to you" },
      { href: "/listings?type=offer", label: "Browse offers", hint: "Goods ready to ship" },
      { href: "/buyers", label: "How buying works" },
    ],
  },
  {
    label: "Sellers", href: "/sellers",
    items: [
      { href: "/register", label: "Post an offer", hint: "Reach verified buyers" },
      { href: "/listings?type=requirement", label: "Browse buyer requirements", hint: "See what buyers need" },
      { href: "/sellers", label: "How selling works" },
    ],
  },
  { label: "How It Works", href: "/how-it-works" },
  {
    label: "Help", href: "/faq",
    items: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact us" },
      { href: "/commission-policy", label: "Commission policy" },
    ],
  },
  {
    label: "About", href: "/about",
    items: [
      { href: "/about", label: "About Doctraders" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

/**
 * Hover / keyboard dropdown (pure CSS: group-hover and group-focus-within).
 * The panel touches the trigger, so the pointer never leaves the "group" while moving into it.
 */
function Dropdown({ trigger, children, align = "left", panelClass }: {
  trigger: ReactNode; children: ReactNode; align?: "left" | "right"; panelClass?: string;
}) {
  return (
    <div className="group relative">
      <div className="flex h-full cursor-pointer items-center gap-1">
        {trigger}
        <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
      </div>
      <div
        className={cn(
          "invisible absolute top-full z-50 translate-y-1 opacity-0 transition duration-150",
          "group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100",
          "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        <div className={cn("min-w-56 rounded-b-lg border border-ink-100 bg-white p-2 shadow-card", panelClass)}>{children}</div>
      </div>
    </div>
  );
}

function MenuLink({ item }: { item: MenuItem }) {
  const external = item.href.startsWith("http");
  return (
    <Link href={item.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="block rounded-md px-3 py-2 hover:bg-brand-50">
      <span className="block text-sm font-medium text-ink-900">{item.label}</span>
      {item.hint && <span className="block text-xs text-ink-500">{item.hint}</span>}
    </Link>
  );
}

/** Alibaba-style header: utility bar, logo + big search, then a navigation strip with dropdowns. */
export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  function search(e: SyntheticEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_0_var(--color-ink-100)]">
      <div className="hidden border-b border-ink-100 bg-ink-50 text-xs text-ink-600 md:block">
        <Container className="flex h-8 items-center justify-between">
          <p>Free registration. <span className="font-semibold text-brand-600">Commission only after your deal is completed.</span></p>
          <div className="flex h-8 items-center gap-5">
            <Link href="/faq" className="hover:text-ink-900">Help &amp; FAQ</Link>
            <Link href="/contact" className="hover:text-ink-900">Contact</Link>
          </div>
        </Container>
      </div>

      <Container className="flex h-16 items-center gap-3 md:gap-6">
        <button className="grid size-10 place-items-center rounded-lg lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
        <Link href="/" aria-label="Doctraders home" className="shrink-0"><Logo /></Link>

        <form onSubmit={search} role="search" className="hidden h-11 flex-1 overflow-hidden rounded-full border-2 border-brand-500 md:flex">
          <label className="relative flex items-center border-r border-ink-100 bg-ink-50">
            <span className="sr-only">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-full cursor-pointer appearance-none bg-transparent pl-4 pr-9 text-sm text-ink-800 outline-none">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 size-4 text-ink-500" />
          </label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What are you looking for?" aria-label="Search products" className="min-w-0 flex-1 px-4 text-sm outline-none" />
          <button type="submit" className="flex cursor-pointer items-center gap-2 bg-brand-500 px-7 text-sm font-semibold text-white transition hover:bg-brand-600"><Search className="size-4" />Search</button>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <div className="hidden h-16 items-center text-sm font-medium text-ink-800 sm:flex">
            <Dropdown align="right" trigger={<Link href="/login" className="px-1 hover:text-ink-950">Sign in</Link>}>
              <MenuLink item={{ href: "/login", label: "Sign in", hint: "Buyers and sellers" }} />
              <MenuLink item={{ href: "/register", label: "Join free", hint: "Create your business account" }} />
            </Dropdown>
          </div>
          <Button asChild className="rounded-full"><Link href="/register">Join free</Link></Button>
        </div>
      </Container>

      <nav className="hidden border-t border-ink-100 lg:block" aria-label="Main">
        <Container className="flex h-11 items-stretch gap-7">
          {/* mega dropdown: all categories */}
          <div className="group relative flex items-stretch">
            <Link href="/categories" className="-ml-px flex items-center gap-2 bg-ink-900 px-4 text-sm font-semibold text-white">
              <LayoutGrid className="size-4" /> All categories <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 translate-y-1 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <div className="grid w-136 grid-cols-2 gap-1 rounded-b-lg border border-ink-100 bg-white p-3 shadow-card">
                {CATEGORIES.map((c) => {
                  const Icon = categoryIcon(c.slug);
                  return (
                    <Link key={c.slug} href={`/listings?category=${c.slug}`} className="flex items-start gap-3 rounded-md p-3 hover:bg-brand-50">
                      <Icon className="mt-0.5 size-5 shrink-0 text-brand-600" strokeWidth={1.6} />
                      <span><span className="block text-sm font-semibold text-ink-900">{c.name}</span><span className="block text-xs text-ink-500">{c.examples}</span></span>
                    </Link>
                  );
                })}
                <Link href="/categories" className="col-span-2 mt-1 rounded-md border-t border-ink-100 px-3 pt-3 text-sm font-semibold text-brand-600 hover:underline">View all categories &rarr;</Link>
              </div>
            </div>
          </div>

          <Link href="/listings" className="flex items-center text-sm font-medium text-ink-700 transition-colors hover:text-brand-600">Browse listings</Link>
          {MENUS.map((m) =>
            m.items ? (
              <div key={m.label} className="flex items-stretch text-sm font-medium text-ink-700 hover:text-brand-600">
                <Dropdown trigger={<Link href={m.href}>{m.label}</Link>}>
                  {m.items.map((i) => <MenuLink key={i.label} item={i} />)}
                </Dropdown>
              </div>
            ) : (
              <Link key={m.label} href={m.href} className="flex items-center text-sm font-medium text-ink-700 transition-colors hover:text-brand-600">{m.label}</Link>
            ),
          )}
        </Container>
      </nav>

      {open && (
        <div className="max-h-[75vh] overflow-y-auto border-t border-ink-100 bg-white lg:hidden">
          <Container className="space-y-1 py-3">
            <form onSubmit={search} role="search" className="mb-3 flex h-11 overflow-hidden rounded-full border-2 border-brand-500 md:hidden">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className="min-w-0 flex-1 px-4 text-sm outline-none" />
              <button type="submit" aria-label="Search" className="bg-brand-500 px-4 text-white"><Search className="size-4" /></button>
            </form>
            {[{ href: "/listings", label: "Browse listings" }, ...MENUS.map((m) => ({ href: m.href, label: m.label })), { href: "/categories", label: "All categories" }, { href: "/login", label: "Sign in" }].map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-800 hover:bg-ink-50">{n.label}</Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
