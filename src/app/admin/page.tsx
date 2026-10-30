"use client";

import * as sample from "@/lib/sample-data";
import { formatINR, formatINRCompact } from "@/lib/format";
import { Card, CardBody, CardHeader, CardTitle, PageHeader, Stat } from "@/components/ui";

// TEMPORARY (Prompt 1): sample numbers. Prompt 7 rewires this to GET /api/v1/admin/stats.
export default function OverviewPage() {
  const users = sample.users;
  const deals = sample.deals;
  const due = deals.filter((d) => d.commissionStatus === "due");
  const earned = deals.filter((d) => d.commissionStatus === "paid").reduce((s, d) => s + (d.value * d.commissionPercent) / 100, 0);

  return (
    <>
      <PageHeader title="Overview" description="What needs your attention today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total users" value={String(users.length)} />
        <Stat label="Listings" value={String(sample.listings.length)} />
        <Stat label="Deals" value={String(deals.length)} />
        <Stat label="Commission earned" value={formatINRCompact(earned)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Latest enquiries</CardTitle></CardHeader>
          <CardBody className="divide-y divide-ink-100 p-0">
            {sample.enquiries.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="font-medium text-ink-900">{e.product}</span>
                <span className="text-ink-500">{e.from}</span>
              </div>
            ))}
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
