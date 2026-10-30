"use client";

import Link from "next/link";
import * as sample from "@/lib/sample-data";
import { Button, Card, CardBody, CardHeader, CardTitle, PageHeader, Spinner, Stat, StatusBadge } from "@/components/ui";

export default function DashboardHome() {
  const user = { companyName: "Your business" }; // TEMPORARY until Prompt 3
  const enquiries = { data: sample.enquiries, loading: false };
  const deals = { data: sample.deals, loading: false };
  const listings = { data: sample.listings, loading: false };

  if (enquiries.loading || deals.loading || listings.loading) return <Spinner />;
  const newEnquiries = enquiries.data?.filter((e) => e.status === "new").length ?? 0;
  const activeDeals = deals.data?.filter((d) => d.stage !== "completed" && d.stage !== "cancelled").length ?? 0;

  return (
    <>
      <PageHeader title={`Welcome, ${user?.companyName}`} description="Your trading activity at a glance." actions={<Button asChild><Link href="/dashboard/post">Post requirement / offer</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="New enquiries" value={String(newEnquiries)} />
        <Stat label="Active deals" value={String(activeDeals)} />
        <Stat label="Live listings" value={String(listings.data?.filter((l) => l.status === "active").length ?? 0)} />
      </div>
      <Card className="mt-6">
        <CardHeader><CardTitle>Recent enquiries</CardTitle></CardHeader>
        <CardBody className="divide-y divide-ink-100 p-0">
          {enquiries.data?.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
              <div><p className="font-medium text-ink-900">{e.product}</p><p className="text-ink-500">{e.from}</p></div>
              <StatusBadge status={e.status} />
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
