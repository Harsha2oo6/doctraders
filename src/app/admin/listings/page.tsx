"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import * as sample from "@/lib/sample-data";
import type { Listing } from "@/lib/sample-data";
import { Button, DataTable, PageHeader, Spinner, StatusBadge } from "@/components/ui";

export default function ListingsPage() {
  const { data, loading } = { data: sample.listings, loading: false };
  const [rows, setRows] = useState<Listing[]>([]);
  useEffect(() => { if (data) setRows(data); }, [data]);

  const setStatus = (id: string, status: Listing["status"]) => setRows((r) => r.map((l) => (l.id === id ? { ...l, status } : l)));
  const remove = (id: string) => setRows((r) => r.filter((l) => l.id !== id));

  const columns = useMemo<ColumnDef<Listing>[]>(() => [
    { accessorKey: "product", header: "Product", cell: (c) => <span className="font-medium">{c.getValue<string>()}</span> },
    { accessorKey: "kind", header: "Type", cell: (c) => <span className="capitalize">{c.getValue<string>()}</span> },
    { accessorKey: "companyAlias", header: "Posted by" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge status={c.getValue<string>()} /> },
    {
      id: "actions", header: "", enableSorting: false,
      cell: ({ row }) => {
        const l = row.original;
        return (
          <div className="flex gap-2">
            {l.status === "blocked"
              ? <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "active")}>Unblock</Button>
              : <Button size="sm" variant="outline" onClick={() => setStatus(l.id, "blocked")}>Block</Button>}
            <Button size="sm" variant="danger" onClick={() => remove(l.id)}>Remove</Button>
          </div>
        );
      },
    },
  ], []);

  return (
    <>
      <PageHeader title="Listings" description="Block or remove fake or misleading listings." />
      {loading ? <Spinner /> : <DataTable columns={columns} data={rows} searchPlaceholder="Search listings…" />}
    </>
  );
}
