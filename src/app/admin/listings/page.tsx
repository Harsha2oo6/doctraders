"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Package } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ApiError, apiFetch, apiList, useApi } from "@/lib/api-client";
import { LISTING_STATUS_LABELS, LISTING_STATUSES, type ListingStatus } from "@/lib/constants";
import { formatPrice, formatQty } from "@/lib/format";
import type { AdminListing } from "@/lib/types";
import { Button, ConfirmDialog, DataTable, ErrorState, PageHeader, Select, StatusBadge, Tabs, useToast } from "@/components/ui";

const LIMIT = 20;

export default function AdminListingsPage() {
  const toast = useToast();
  const [status, setStatus] = useState<"all" | ListingStatus>("all");
  const [kind, setKind] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminListing>();
  const [busy, setBusy] = useState(false);
  const list = useApi(
    () => apiList<AdminListing>("/admin/listings", { query: { status: status === "all" ? undefined : status, kind, q, page, limit: LIMIT } }),
    [status, kind, q, page],
  );
  const counts = (list.data?.counts ?? {}) as Record<string, number>;

  async function toggle() {
    if (!target) return;
    const next = target.status === "blocked" ? "active" : "blocked";
    setBusy(true);
    try {
      await apiFetch(`/admin/listings/${target.id}`, { method: "PATCH", body: { status: next } });
      toast(next === "blocked" ? "Listing blocked. It is hidden from the site." : "Listing unblocked. It is live again.");
      setTarget(undefined);
      list.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update the listing.", "error");
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo<ColumnDef<AdminListing>[]>(() => [
    {
      id: "cover", header: "", enableSorting: false,
      cell: ({ row }) => row.original.images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element -- small thumbnail
        <img src={row.original.images[0]} alt="" className="size-10 rounded-md border border-ink-100 object-cover" />
      ) : (
        <span className="grid size-10 place-items-center rounded-md border border-ink-100 bg-ink-50"><Package className="size-4 text-ink-300" /></span>
      ),
    },
    {
      accessorKey: "title", header: "Listing",
      cell: ({ row }) => (
        <Link href={`/listings/${row.original.id}`} target="_blank" className="font-medium text-ink-900 hover:text-brand-600">
          {row.original.title}
          <span className="block text-xs font-normal text-ink-500">{formatQty(row.original.quantity, row.original.unit)} · {formatPrice(row.original.price, row.original.unit)}</span>
        </Link>
      ),
    },
    { accessorKey: "kind", header: "Type", cell: (c) => <StatusBadge domain="kind" status={c.getValue<string>()} /> },
    {
      id: "owner", header: "Owner", accessorFn: (l) => l.owner.name,
      cell: ({ row }) => (
        <Link href={`/admin/users/${row.original.owner.id}`} className="whitespace-nowrap hover:text-brand-600">
          {row.original.owner.name}
          <span className="block text-xs text-ink-500">{row.original.owner.businessName ?? ""} · {row.original.owner.mobile}</span>
        </Link>
      ),
    },
    { accessorKey: "enquiryCount", header: "Enquiries" },
    { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge domain="listing" status={c.getValue<string>()} /> },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => row.original.status === "closed" ? null : (
        <Button size="sm" variant="outline" onClick={() => setTarget(row.original)}>{row.original.status === "blocked" ? "Unblock" : "Block"}</Button>
      ),
    },
  ], []);

  const blocking = target?.status !== "blocked";

  return (
    <>
      <PageHeader title="Listings" description="Block fake or misleading listings. Blocked listings disappear from the site." />
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <Tabs
          className="mb-0"
          active={status}
          onChange={(s) => { setStatus(s as typeof status); setPage(1); }}
          tabs={[{ key: "all", label: "All", count: counts.all }, ...LISTING_STATUSES.map((s) => ({ key: s, label: LISTING_STATUS_LABELS[s], count: counts[s] }))]}
        />
        <Select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} aria-label="Type" className="w-44">
          <option value="">Offers and requirements</option>
          <option value="offer">Offers</option>
          <option value="requirement">Requirements</option>
        </Select>
      </div>
      {list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={list.data?.data ?? []}
          loading={list.loading}
          searchPlaceholder="Search title, city, owner…"
          search={{ value: q, onChange: (v) => { setQ(v); setPage(1); } }}
          paging={{ page, limit: LIMIT, total: list.data?.total ?? 0, onPage: setPage }}
        />
      )}
      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(undefined)}
        onConfirm={toggle}
        busy={busy}
        tone={blocking ? "danger" : "primary"}
        confirmLabel={blocking ? "Block" : "Unblock"}
        title={blocking ? "Block this listing?" : "Unblock this listing?"}
      >
        &ldquo;{target?.title}&rdquo; {blocking ? "will disappear from the site, and the owner cannot reopen it." : "will be live again."}
      </ConfirmDialog>
    </>
  );
}
