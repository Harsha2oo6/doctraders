"use client";

import { DEAL_STAGES } from "@/lib/constants";
import { formatINR } from "@/lib/format";
import type { Deal } from "@/lib/sample-data";
import { Badge, Card, CardBody, StatusBadge, cn } from "@/components/ui";

// TEMPORARY (Prompt 1): read-only card on sample data. Prompt 6 replaces it with the deals table + detail page.
export function DealCard({ deal }: { deal: Deal }) {
  const cancelled = deal.stage === "cancelled";
  const idx = DEAL_STAGES.indexOf(deal.stage as (typeof DEAL_STAGES)[number]);
  const amount = (deal.value * deal.commissionPercent) / 100;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-ink-900">{deal.product}</p>
            <p className="text-sm text-ink-500">{deal.seller} → {deal.buyer}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-ink-900">{formatINR(deal.value)}</p>
            <p className="text-ink-500">Commission {deal.commissionPercent}% = {formatINR(amount)}</p>
          </div>
        </div>

        <ol className="flex flex-wrap gap-2 text-xs">
          {DEAL_STAGES.map((s, i) => (
            <li key={s} className={cn("rounded-full px-3 py-1 capitalize", !cancelled && i <= idx ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-400")}>{s}</li>
          ))}
          {cancelled && <li><Badge tone="danger">Cancelled</Badge></li>}
        </ol>

        {deal.commissionStatus !== "not-applicable" && (
          <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
            <StatusBadge status={deal.commissionStatus} />
          </div>
        )}
      </CardBody>
    </Card>
  );
}
