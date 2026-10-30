"use client";

import Link from "next/link";
import { api, useApi } from "@doctraders/api-client";
import { formatINR, formatINRCompact } from "@doctraders/schemas";
import { Badge, Card, CardBody, CardHeader, CardTitle, PageHeader, Spinner, Stat } from "@doctraders/ui";

export default function OverviewPage() {
  const users = useApi(api.users);
  const reports = useApi(api.reports);
  const deals = useApi(api.deals);

  if (users.loading || reports.loading || deals.loading) return <Spinner />;
  const pending = users.data?.filter((u) => u.status === "pending") ?? [];
  const due = deals.data?.filter((d) => d.commissionStatus === "due") ?? [];
  const t = reports.data!.totals;

  return (
    <>
      <PageHeader title="Overview" description="What needs your attention today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Pending approvals" value={String(pending.length)} />
        <Stat label="Total users" value={String(t.users)} />
        <Stat label="Deals" value={String(t.deals)} />
        <Stat label="Commission earned" value={formatINRCompact(t.commissionEarned)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Awaiting review</CardTitle></CardHeader>
          <CardBody className="divide-y divide-ink-100 p-0">
            {pending.map((u) => (
              <Link key={u.id} href={`/registrations/${u.id}`} className="flex items-center justify-between px-5 py-3 text-sm hover:bg-ink-50">
                <span><span className="font-medium text-ink-900">{u.companyName}</span><span className="block text-ink-500">{u.country} · {u.companyType}</span></span>
                <Badge tone="warning">Review</Badge>
              </Link>
            ))}
            {pending.length === 0 && <p className="p-5 text-sm text-ink-500">Nothing pending.</p>}
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Commission due</CardTitle></CardHeader>
          <CardBody className="divide-y divide-ink-100 p-0">
            {due.map((d) => (
              <div key={d.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-ink-900">{d.product}</span>
                <span className="text-ink-700">{formatINR((d.value * d.commissionPercent) / 100)}</span>
              </div>
            ))}
            {due.length === 0 && <p className="p-5 text-sm text-ink-500">No commission due.</p>}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
