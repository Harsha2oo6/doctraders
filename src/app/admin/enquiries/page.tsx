"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useState } from "react";
import { apiList, useApi } from "@/lib/api-client";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { AdminEnquiry } from "@/lib/types";
import { DataTable, ErrorState, PageHeader, StatusBadge, Tabs } from "@/components/ui";

const LIMIT = 20;

const columns: ColumnDef<AdminEnquiry>[] = [
  { accessorKey: "createdAt", header: "Date", cell: (c) => <span className="whitespace-nowrap text-ink-600">{formatDate(c.getValue<string>())}</span> },
  {
    accessorKey: "listingTitle", header: "Listing",
    cell: ({ row }) => (
      <Link href={`/admin/enquiries/${row.original.id}`} className="font-medium text-ink-900 hover:text-brand-600">
        {row.original.listingTitle}
        <span className="block text-xs font-normal text-ink-500">{row.original.listingKind === "offer" ? "Offer" : "Requirement"} · from {row.original.fromRole}</span>
      </Link>
    ),
  },
  { accessorKey: "quantity", header: "Qty", cell: (c) => c.getValue<number>().toLocaleString("en-IN") },
  { id: "buyer", header: "Buyer", accessorFn: (e) => e.buyer?.name ?? "", cell: ({ row }) => <Party p={row.original.buyer} /> },
  { id: "seller", header: "Seller", accessorFn: (e) => e.seller?.name ?? "", cell: ({ row }) => <Party p={row.original.seller} /> },
  { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge domain="enquiry" status={c.getValue<string>()} /> },
];

function Party({ p }: { p: AdminEnquiry["buyer"] }) {
  if (!p) return <span className="text-ink-400">—</span>;
  return <span className="whitespace-nowrap">{p.name}<span className="block text-xs text-ink-500">{p.businessName ?? ""} · {p.mobile}</span></span>;
}

/** The middleman's inbox: every "I'm interested" with both parties' contacts. */
export default function AdminEnquiriesPage() {
  const [status, setStatus] = useState<"all" | EnquiryStatus>("new");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const list = useApi(
    () => apiList<AdminEnquiry>("/admin/enquiries", { query: { status: status === "all" ? undefined : status, q, page, limit: LIMIT } }),
    [status, q, page],
  );
  const counts = (list.data?.counts ?? {}) as Record<string, number>;

  return (
    <>
      <PageHeader title="Enquiries" description="Everyone who clicked “I'm interested”. Call both sides, update the status, then convert to a deal." />
      <Tabs
        active={status}
        onChange={(s) => { setStatus(s as typeof status); setPage(1); }}
        tabs={[
          { key: "all", label: "All", count: counts.all },
          ...ENQUIRY_STATUSES.map((s) => ({ key: s, label: ENQUIRY_STATUS_LABELS[s], count: counts[s] })),
        ]}
      />
      {list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={list.data?.data ?? []}
          loading={list.loading}
          searchPlaceholder="Search listing, name, business, mobile…"
          search={{ value: q, onChange: (v) => { setQ(v); setPage(1); } }}
          paging={{ page, limit: LIMIT, total: list.data?.total ?? 0, onPage: setPage }}
          rowHref={(e) => `/admin/enquiries/${e.id}`}
        />
      )}
    </>
  );
}
