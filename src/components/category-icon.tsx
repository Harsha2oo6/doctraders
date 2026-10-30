import { Apple, Bean, Beef, Candy, Coffee, Droplet, Flame, Nut, Package, Sprout, Wheat, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "rice-grains": Wheat,
  pulses: Bean,
  spices: Flame,
  "oilseeds-edible-oil": Droplet,
  "fruits-vegetables": Apple,
  "sugar-jaggery": Candy,
  "dry-fruits-nuts": Nut,
  "tea-coffee": Coffee,
  "animal-feed": Beef,
  "fertilizers-seeds": Sprout,
  other: Package,
};

/** One icon per category slug, used by the sidebar, tiles and product cards. */
export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? Package;
}
