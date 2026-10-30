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
