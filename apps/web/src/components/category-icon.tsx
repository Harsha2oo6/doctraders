import { Hammer, Package, Shirt, Ship, UtensilsCrossed, Wheat, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  agro: Wheat,
  food: UtensilsCrossed,
  metals: Hammer,
  industrial: Package,
  textiles: Shirt,
  logistics: Ship,
};

/** One icon per category slug, used by the sidebar, tiles and product cards. */
export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Package;
}
