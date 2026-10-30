import { formatINR, formatQty } from "@/lib/format";
import type { DealProgress } from "@/lib/types";
import { ProgressBar } from "@/components/ui";

/** Paid / Shipped / Reached bars for any deal (admin or party view). */
export function DealProgressBars({ d }: { d: DealProgress & { totalValue: number; quantity: number; unit: string } }) {
  return (
    <div className="space-y-3">
      <ProgressBar kind="paid" label="Paid" percent={d.paidPercent} detail={`${formatINR(d.paidAmount)} of ${formatINR(d.totalValue)}`} />
      <ProgressBar kind="shipped" label="Shipped" percent={d.shippedPercent} detail={`${formatQty(d.shippedQuantity, d.unit)} of ${formatQty(d.quantity, d.unit)}`} />
      <ProgressBar kind="reached" label="Reached" percent={d.reachedPercent} detail={`${formatQty(d.reachedQuantity, d.unit)} of ${formatQty(d.quantity, d.unit)}`} />
    </div>
  );
}
