"use client";

import { ClipboardList, Package, Search } from "lucide-react";
import Link from "next/link";
import { apiList, useApi } from "@/lib/api-client";
import { useMe } from "@/lib/me";
import type { PublicListing } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, CardTitle, PageHeader, Spinner, Stat, StatusBadge } from "@/components/ui";

export default function DashboardHome() {
  const { me } = useMe();
  const seller = !!me?.roles.includes("seller");
  const buyer = !!me?.roles.includes("buyer");
  const active = useApi(() => apiList<PublicListing>("/me/listings", { query: { status: "active", limit: 1 } }));
  const enquiries = useApi(() => apiList("/me/enquiries", { query: { limit: 1 } }));
  const deals = useApi(() => apiList("/me/deals", { query: { status: "active", limit: 1 } }));
  const recent = useApi(() => apiList<PublicListing>("/me/listings", { query: { limit: 5 } }));

  return (
    <>
      <PageHeader
        title={`Welcome, ${me?.name.split(" ")[0] ?? ""}`}
        description="Your trading activity at a glance."
        actions={
          <div className="flex flex-wrap gap-2">
            {seller && <Button asChild><Link href="/dashboard/listings/new?kind=offer"><Package className="size-4" />Post a product</Link></Button>}
            {buyer && <Button asChild variant={seller ? "outline" : "primary"}><Link href="/dashboard/listings/new?kind=requirement"><ClipboardList className="size-4" />Post a requirement</Link></Button>}
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="My active listings" value={active.data ? String(active.data.total) : "–"} />
        <Stat label="My enquiries" value={enquiries.data ? String(enquiries.data.total) : "–"} hint="Interests you sent" />
        <Stat label="My active deals" value={deals.data ? String(deals.data.total) : "–"} />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent listings</CardTitle>
          <Link href="/listings" className="flex items-center gap-1 text-sm font-semibold text-ink-800 hover:text-ink-950"><Search className="size-4" />Browse the market</Link>
        </CardHeader>
        <CardBody className="divide-y divide-ink-100 p-0">
          {recent.loading ? (
            <Spinner />
          ) : !recent.data?.data.length ? (
            <p className="p-5 text-sm text-ink-500">You have not posted anything yet.</p>
          ) : (
            recent.data.data.map((l) => (
              <Link key={l.id} href={`/dashboard/listings/${l.id}/edit`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-50">
                <span className="font-medium text-ink-900">{l.title}</span>
                <StatusBadge domain="listing" status={l.status} />
              </Link>
            ))
          )}
        </CardBody>
      </Card>
    </>
  );
}
