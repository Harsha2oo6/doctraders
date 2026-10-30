"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { api, useApi } from "@doctraders/api-client";
import type { UserAccount } from "@doctraders/schemas";
import { Button, DataTable, PageHeader, Spinner, StatusBadge } from "@doctraders/ui";

const columns: ColumnDef<UserAccount>[] = [
  { accessorKey: "companyName", header: "Company" },
  { accessorKey: "companyType", header: "Type", cell: (c) => <span className="capitalize">{c.getValue<string>()}</span> },
  { accessorKey: "country", header: "Country" },
  { accessorKey: "createdAt", header: "Submitted" },
  { accessorKey: "status", header: "Status", cell: (c) => <StatusBadge status={c.getValue<string>()} /> },
  { id: "action", header: "", enableSorting: false, cell: (c) => <Button asChild size="sm" variant="outline"><Link href={`/registrations/${c.row.original.id}`}>Review</Link></Button> },
];

export default function RegistrationsPage() {
  const { data, loading } = useApi(api.users);
  return (
    <>
      <PageHeader title="Registrations" description="Review documents, then approve or reject with a reason." />
      {loading ? <Spinner /> : <DataTable columns={columns} data={data ?? []} searchPlaceholder="Search company or country…" />}
    </>
  );
}
