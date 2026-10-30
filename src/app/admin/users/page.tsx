"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ApiError, apiFetch, apiList, useApi } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Me } from "@/lib/me";
import { Button, ConfirmDialog, DataTable, ErrorState, PageHeader, StatusBadge, Tabs, useToast } from "@/components/ui";

const LIMIT = 20;
type Filter = "all" | "buyer" | "seller" | "blocked";

/** Filter tab → API query. */
const QUERY: Record<Filter, { role?: string; status?: string }> = { all: {}, buyer: { role: "buyer" }, seller: { role: "seller" }, blocked: { status: "blocked" } };

export default function AdminUsersPage() {
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<Me>();
  const [busy, setBusy] = useState(false);
  const list = useApi(() => apiList<Me>("/admin/users", { query: { ...QUERY[filter], q, page, limit: LIMIT } }), [filter, q, page]);

  async function toggle() {
    if (!target) return;
    const status = target.status === "blocked" ? "active" : "blocked";
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${target.id}`, { method: "PATCH", body: { status } });
      toast(status === "blocked" ? `${target.name} is blocked.` : `${target.name} is unblocked.`);
      setTarget(undefined);
      list.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update the user.", "error");
    } finally {
      setBusy(false);
    }
  }

  const columns = useMemo<ColumnDef<Me>[]>(() => [
    {
      accessorKey: "name", header: "Name",
      cell: ({ row }) => (
        <Link href={`/admin/users/${row.original.id}`} className="font-medium text-ink-900 hover:text-brand-600">
          {row.original.name}
          <span className="block text-xs font-normal text-ink-500">{row.original.business?.name ?? "—"}</span>
        </Link>
      ),
    },
    { accessorKey: "mobile", header: "Mobile" },
    { accessorKey: "email", header: "Email" },
    { id: "place", header: "City", accessorFn: (u) => [u.business?.city, u.business?.state].filter(Boolean).join(", ") },
    {
      id: "roles", header: "Roles", enableSorting: false,
      cell: ({ row }) => <span className="flex gap-1">{row.original.roles.map((r) => <StatusBadge key={r} domain="role" status={r} />)}</span>,
    },
    { accessorKey: "createdAt", header: "Joined", cell: (c) => <span className="whitespace-nowrap">{formatDate(c.getValue<string>())}</span> },
    { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge domain="account" status={c.getValue<string>()} /> },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setTarget(row.original)}>{row.original.status === "blocked" ? "Unblock" : "Block"}</Button>,
    },
  ], []);

  const blocking = target?.status !== "blocked";

  return (
    <>
      <PageHeader title="Users" description="Everyone who registered to buy or sell." />
      <Tabs
        active={filter}
        onChange={(f) => { setFilter(f as Filter); setPage(1); }}
        tabs={[{ key: "all", label: "All" }, { key: "buyer", label: "Buyers" }, { key: "seller", label: "Sellers" }, { key: "blocked", label: "Blocked" }]}
      />
      {list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : (
        <DataTable
          columns={columns}
          data={list.data?.data ?? []}
          loading={list.loading}
          searchPlaceholder="Search name, business, mobile, email…"
          search={{ value: q, onChange: (v) => { setQ(v); setPage(1); } }}
          paging={{ page, limit: LIMIT, total: list.data?.total ?? 0, onPage: setPage }}
          rowHref={(u) => `/admin/users/${u.id}`}
        />
      )}
      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(undefined)}
        onConfirm={toggle}
        busy={busy}
        tone={blocking ? "danger" : "primary"}
        confirmLabel={blocking ? "Block" : "Unblock"}
        title={blocking ? `Block ${target?.name}?` : `Unblock ${target?.name}?`}
      >
        {blocking ? "They are logged out on their next request and their listings disappear from the site." : "They can log in again and their live listings come back."}
      </ConfirmDialog>
    </>
  );
}
