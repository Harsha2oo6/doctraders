import { MapPin } from "lucide-react";
import Link from "next/link";
import type { Listing } from "@doctraders/schemas";
import { Badge, VerifiedBadge } from "@doctraders/ui";
import { categoryIcon } from "./category-icon";

/**
 * Product card (Alibaba style): image area, title, price, minimum order, location, verified seller.
 * The real company name is never shown. Contact needs an approved account.
 */
export function ListingCard({ listing: l }: { listing: Listing }) {
  const Icon = categoryIcon(l.category);
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white transition hover:shadow-card">
      <div className="relative grid aspect-[4/3] place-items-center bg-linear-to-br from-ink-50 to-ink-100">
        <Icon className="size-14 text-ink-300 transition group-hover:scale-110" strokeWidth={1.2} />
        <Badge tone={l.kind === "offer" ? "brand" : "neutral"} className="absolute left-2 top-2 capitalize">{l.kind}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-ink-900">{l.product}</h3>
        <p className="text-base font-bold text-ink-900">{l.price}</p>
        <p className="text-xs text-ink-500">Min. order: {l.quantity.toLocaleString()} {l.unit} · {l.deliveryTerms}</p>
        <p className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="size-3.5" />{l.location}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="flex flex-col gap-1 text-xs text-ink-600">{l.companyAlias}<VerifiedBadge /></span>
          <Link href="/register" className="rounded-full border border-ink-900 px-3 py-1.5 text-xs font-semibold text-ink-900 transition hover:bg-ink-900 hover:text-white">
            {l.kind === "offer" ? "Contact supplier" : "Send quotation"}
          </Link>
        </div>
      </div>
    </article>
  );
}
