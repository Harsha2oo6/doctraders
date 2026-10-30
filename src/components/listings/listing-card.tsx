import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LISTING_KIND_LABELS } from "@/lib/constants";
import { formatPrice, formatQty } from "@/lib/format";
import type { PublicListing } from "@/lib/types";
import { categoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui";

/** DESIGN.md 5.9 product card. The owner is only ever shown as an alias. */
export function ListingCard({ listing: l }: { listing: PublicListing }) {
  const Icon = categoryIcon(l.category);
  const cover = l.images[0];
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-ink-100 bg-white transition hover:shadow-card">
      <div className="relative grid aspect-[4/3] place-items-center bg-linear-to-br from-ink-50 to-ink-100">
        {cover ? (
          <Image src={cover} alt={l.title} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw" className="h-full w-full object-cover" />
        ) : (
          <Icon className="size-14 text-ink-300 transition group-hover:scale-110" strokeWidth={1.2} />
        )}
        <Badge tone={l.kind === "offer" ? "brand" : "neutral"} className="absolute left-2 top-2">{LISTING_KIND_LABELS[l.kind]}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-ink-900">
          <Link href={`/listings/${l.id}`} className="after:absolute after:inset-0">{l.title}</Link>
        </h3>
        <p className="text-base font-bold text-ink-900">{formatPrice(l.price, l.unit)}</p>
        <p className="text-xs text-ink-500">
          Qty: {formatQty(l.quantity, l.unit)}
          {l.minOrderQuantity ? ` · Min. order ${formatQty(l.minOrderQuantity, l.unit)}` : ""}
        </p>
        <p className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="size-3.5" />{l.city}, {l.state}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-xs text-ink-600">{l.owner.alias}</span>
          <span className="rounded-full border border-ink-900 px-3 py-1.5 text-xs font-semibold text-ink-900 transition group-hover:bg-ink-900 group-hover:text-white">View details</span>
        </div>
      </div>
    </article>
  );
}
