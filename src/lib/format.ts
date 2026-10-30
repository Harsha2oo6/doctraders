/** Rupee amount with Indian digit grouping, e.g. 4,62,00,000 -> "₹4,62,00,000". */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Compact form for big totals: ₹4.62 Cr, ₹12.5 L. */
export function formatINRCompact(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(2).replace(/\.?0+$/, "")} L`;
  return formatINR(amount);
}

const UNIT_TEXT: Record<string, string> = { other: "unit" };
export const unitText = (unit: string) => UNIT_TEXT[unit] ?? unit;

/** "2,000 bag", "25 tonne". */
export function formatQty(qty: number, unit: string): string {
  return `${qty.toLocaleString("en-IN")} ${unitText(unit)}`;
}

/** "₹2,450 / bag" or "Price on request". */
export function formatPrice(price: number | null | undefined, unit: string): string {
  return price ? `${formatINR(price)} / ${unitText(unit)}` : "Price on request";
}

const IST = "Asia/Kolkata";

/** "29 Oct 2026". */
export function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
}

/** "29 Oct 2026, 3:40 pm". */
export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = new Date(d);
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }).toLowerCase();
  return `${formatDate(date)}, ${time}`;
}

/** "5 min ago", "3 h ago", "2 days ago", then the date. */
export function timeAgo(d: string | Date): string {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} day${s < 2 * 86400 ? "" : "s"} ago`;
  return formatDate(d);
}

/** Whole-number percent: "50%". */
export const percent = (n: number) => `${Math.round(n)}%`;
