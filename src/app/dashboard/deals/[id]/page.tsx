"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { apiFetch, useApi } from "@/lib/api-client";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { formatDate, formatINR, formatQty, unitText } from "@/lib/format";
import type { PartyDeal } from "@/lib/types";
import { DealProgressBars } from "@/components/deals/deal-progress";
import { ShipmentLots } from "@/components/deals/shipments";
import { Card, CardBody, CardHeader, CardTitle, ErrorState, PageHeader, Spinner, StatusBadge } from "@/components/ui";

/** Party view of a deal. Sellers post shipment updates on active deals; buyers read only. */
export default function MyDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const q = useApi(() => apiFetch<PartyDeal>(`/me/deals/${id}`), [id]);

  if (q.loading && !q.data) return <Spinner />;
  if (q.error || !q.data) return <ErrorState message={q.error?.message} onRetry={q.refetch} />;
  const d = q.data;

  return (
    <>
      <Link href="/dashboard/deals" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" />My deals</Link>
      <PageHeader title={d.title} description={`${d.code} · ${formatDate(d.createdAt)} · You are the ${d.myRole}`} actions={<StatusBadge domain="deal" status={d.status} />} />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
            <CardBody><DealProgressBars d={d} /></CardBody>
          </Card>
          <ShipmentLots
            dealId={d.id}
            shipments={d.shipments}
            unit={d.unit}
            remaining={d.remainingQuantity}
            canEdit={d.myRole === "seller" && d.status === "active"}
            onChange={q.refetch}
          />
        </div>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
            <CardBody>
              <dl className="divide-y divide-ink-100 rounded-lg border border-ink-100 text-sm">
                <Row k={d.myRole === "buyer" ? "Seller" : "Buyer"} v={d.counterparty.alias} />
                <Row k="Quantity" v={formatQty(d.quantity, d.unit)} />
                <Row k="Price" v={`${formatINR(d.pricePerUnit)} / ${unitText(d.unit)}`} />
                <Row k="Value" v={formatINR(d.totalValue)} />
                <Row k="Balance" v={formatINR(d.balanceAmount)} />
              </dl>
              <p className="mt-3 text-xs text-ink-500">Questions about this deal? The Doctraders team is your contact.</p>
            </CardBody>
          </Card>
          <Card className="h-fit">
            <CardHeader><CardTitle>Payments</CardTitle></CardHeader>
            <CardBody className="divide-y divide-ink-100 p-0">
              {d.payments.length === 0 ? (
                <p className="p-5 text-sm text-ink-500">No payments recorded yet.</p>
              ) : (
                d.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span className="text-ink-500">{formatDate(p.paidAt)}{p.method ? ` · ${PAYMENT_METHOD_LABELS[p.method]}` : ""}</span>
                    <span className="font-medium text-ink-900">{formatINR(p.amount)}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium text-ink-900">{v}</dd></div>;
}
