"use client";

import Link from "next/link";
import { useState } from "react";
import { apiList, useApi } from "@/lib/api-client";
import { DEAL_STATUS_LABELS, DEAL_STATUSES } from "@/lib/constants";
import { formatINR, formatQty } from "@/lib/format";
import type { PartyDeal } from "@/lib/types";
import { DealProgressBars } from "@/components/deals/deal-progress";
import { Button, Card, CardBody, EmptyState, ErrorState, PageHeader, Pager, Spinner, StatusBadge, Tabs } from "@/components/ui";

const LIMIT = 20;

export default function MyDealsPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const list = useApi(() => apiList<PartyDeal>("/me/deals", { query: { status: status === "all" ? undefined : status, page, limit: LIMIT } }), [status, page]);

  return (
    <>
      <PageHeader title="My deals" description="Deals the Doctraders team has agreed for you. Track payment and shipping here." />
      <Tabs
        active={status}
        onChange={(s) => { setStatus(s); setPage(1); }}
        tabs={[{ key: "all", label: "All" }, ...DEAL_STATUSES.map((s) => ({ key: s, label: DEAL_STATUS_LABELS[s] }))]}
      />
      {list.loading && !list.data ? (
        <Spinner />
      ) : list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !list.data?.data.length ? (
        <EmptyState title="No deals yet" action={<Button asChild><Link href="/listings">Browse listings</Link></Button>}>
          When the Doctraders team closes a deal for you, it appears here.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {list.data.data.map((d) => (
            <Card key={d.id}>
              <CardBody className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/dashboard/deals/${d.id}`} className="font-semibold text-ink-900 hover:text-brand-600">{d.title}</Link>
                    <p className="text-sm text-ink-500">{d.code} · {formatQty(d.quantity, d.unit)} · {formatINR(d.totalValue)} · {d.counterparty.alias}</p>
                    <p className="text-sm text-ink-700">You are the {d.myRole}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge domain="deal" status={d.status} />
                    <Button asChild size="sm" variant="outline"><Link href={`/dashboard/deals/${d.id}`}>Open</Link></Button>
                  </div>
                </div>
                <DealProgressBars d={d} />
              </CardBody>
            </Card>
          ))}
          {list.data.total > LIMIT && <Pager page={page} limit={LIMIT} total={list.data.total} onPage={setPage} />}
        </div>
      )}
    </>
  );
}
