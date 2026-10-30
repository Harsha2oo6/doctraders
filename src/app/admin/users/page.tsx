"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as sample from "@/lib/sample-data";
import type { UserAccount } from "@/lib/sample-data";
import { DataTable, PageHeader, Spinner, StatusBadge, VerifiedBadge } from "@/components/ui";

const columns: ColumnDef<UserAccount>[] = [
  { accessorKey: "companyName", header: "Company", cell: (c) => <span className="flex items-center gap-2 font-medium">{c.getValue<string>()}{c.row.original.status === "approved" && <VerifiedBadge />}</span> },
  { accessorKey: "contactName", header: "Contact" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "companyType", header: "Type", cell: (c) => <span className="capitalize">{c.getValue<string>()}</span> },
  { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge status={c.getValue<string>()} /> },
];

export default function UsersPage() {
  const { data, loading } = { data: sample.users, loading: false };
  return (
    <>
      <PageHeader title="Users" description="All registered companies." />
      {loading ? <Spinner /> : <DataTable columns={columns} data={data ?? []} searchPlaceholder="Search users…" />}
    </>
  );
}
