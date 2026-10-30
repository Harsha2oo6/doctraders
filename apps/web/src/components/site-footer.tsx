import Link from "next/link";
import { Container, Logo } from "@doctraders/ui";

const COLS = [
  { title: "Buy on Doctraders", links: [["Browse listings", "/listings"], ["Post a requirement", "/register"], ["For Buyers", "/buyers"], ["How it works", "/how-it-works"]] },
  { title: "Sell on Doctraders", links: [["Post an offer", "/register"], ["For Sellers", "/sellers"], ["Logistics providers", "/logistics"], ["Commission policy", "/commission-policy"]] },
  { title: "Company", links: [["About", "/about"], ["Contact", "/contact"], ["FAQ", "/faq"], ["Products", "/categories"]] },
  { title: "Legal", links: [["Terms & Conditions", "/terms"], ["Privacy Policy", "/privacy"], ["Disclaimer", "/disclaimer"]] },
] as const;

/** Light gray footer, like Alibaba's: link columns, then a small legal line. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-white text-ink-600">
      <Container className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm">Verified buyers and verified sellers. Free to join. Commission only after a deal is completed.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-ink-900">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map(([label, href]) => (
                <li key={label}><Link href={href} className="transition-colors hover:text-brand-600">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-ink-100 bg-ink-50">
        <Container className="space-y-1 py-5 text-xs text-ink-500">
          <p>Doctraders verifies documents but does not guarantee any deal and does not hold or handle payments between parties. Brokers and agents are not allowed.</p>
          <p>© {new Date().getFullYear()} Doctraders. All rights reserved.</p>
        </Container>
      </div>
    </footer>
  );
}
