"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { apiList, useApi } from "@/lib/api-client";
import { DEAL_STATUS_LABELS, DEAL_STATUSES, type DealStatus } from "@/lib/constants";
import { formatINR, percent } from "@/lib/format";
import type { AdminDeal } from "@/lib/types";
import { DataTable, ErrorState, PageHeader, StatusBadge, Tabs } from "@/components/ui";

const LIMIT = 20;

const columns: ColumnDef<AdminDeal>[] = [
  { accessorKey: "code", header: "Code", cell: ({ row }) => <Link href={`/admin/deals/${row.original.id}`} className="whitespace-nowrap font-medium text-ink-900 hover:text-brand-600">{row.original.code}</Link> },
  { accessorKey: "title", header: "Title", cell: (c) => <span className="line-clamp-2">{c.getValue<string>()}</span> },
  { id: "buyer", header: "Buyer", accessorFn: (d) => d.buyer?.name ?? "", cell: ({ row }) => <span className="whitespace-nowrap">{row.original.buyer?.name ?? "—"}<span className="block text-xs text-ink-500">{row.original.buyer?.businessName}</span></span> },
  { id: "seller", header: "Seller", accessorFn: (d) => d.seller?.name ?? "", cell: ({ row }) => <span className="whitespace-nowrap">{row.original.seller?.name ?? "—"}<span className="block text-xs text-ink-500">{row.original.seller?.businessName}</span></span> },
  { accessorKey: "totalValue", header: "Value", cell: (c) => <span className="whitespace-nowrap">{formatINR(c.getValue<number>())}</span> },
  { accessorKey: "paidPercent", header: "Paid", cell: (c) => percent(c.getValue<number>()) },
  { accessorKey: "shippedPercent", header: "Shipped", cell: (c) => percent(c.getValue<number>()) },
  { accessorKey: "commissionStatus", header: "Commission", cell: ({ row }) => <span className="whitespace-nowrap"><StatusBadge domain="commission" status={row.original.commissionStatus} /> <span className="text-xs text-ink-500">{formatINR(row.original.commissionAmount)}</span></span> },
];

export default function AdminDealsPage() {
  const [status, setStatus] = useState<"all" | DealStatus>("active");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const list = useApi(() => apiList<AdminDeal>("/admin/deals", { query: { status: status === "all" ? undefined : status, q, page, limit: LIMIT } }), [status, q, page]);
  const counts = (list.data?.counts ?? {}) as Record<string, number>;

  return (
    <>
      <PageHeader title="Deals" description="Agreed deals: record payments, follow shipments and track commission." />
      <Tabs
        active={status}
        onChange={(s) => { setStatus(s as typeof status); setPage(1); }}
        tabs={[...DEAL_STATUSES.map((s) => ({ key: s, label: DEAL_STATUS_LABELS[s], count: counts[s] })), { key: "all", label: "All", count: counts.all }]}
      />
      {list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={list.data?.data ?? []}
          loading={list.loading}
          searchPlaceholder="Search code, title, name…"
          search={{ value: q, onChange: (v) => { setQ(v); setPage(1); } }}
          paging={{ page, limit: LIMIT, total: list.data?.total ?? 0, onPage: setPage }}
          rowHref={(d) => `/admin/deals/${d.id}`}
        />
      )}
    </>
  );
}
