"use client";

import Link from "next/link";
import { apiFetch, apiList, useApi } from "@/lib/api-client";
import { formatDate, formatINR, formatINRCompact } from "@/lib/format";
import type { AdminDeal, AdminEnquiry } from "@/lib/types";
import { Card, CardBody, CardHeader, CardTitle, ErrorState, PageHeader, Spinner, Stat, StatusBadge } from "@/components/ui";

/** Shape of GET /api/v1/admin/stats (see docs/API.md). */
type Stats = {
  enquiries: { new: number; inDiscussion: number; total: number };
  deals: { active: number; completed: number; cancelled: number; activeValue: number };
  commission: { dueAmount: number; dueCount: number; paidAmount: number; paidCount: number };
  users: { total: number; buyers: number; sellers: number; blocked: number };
  listings: { active: number; activeOffers: number; activeRequirements: number };
};

export default function OverviewPage() {
  const stats = useApi(() => apiFetch<Stats>("/admin/stats"));
  const latest = useApi(() => apiList<AdminEnquiry>("/admin/enquiries", { query: { limit: 5 } }));
  const due = useApi(() => apiList<AdminDeal>("/admin/deals", { query: { commissionStatus: "due", limit: 5 } }));

  if (stats.loading && !stats.data) return <Spinner />;
  if (stats.error || !stats.data) return <ErrorState message={stats.error?.message} onRetry={stats.refetch} />;
  const s = stats.data;

  return (
    <>
      <PageHeader title="Overview" description="What needs your attention today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New enquiries" value={String(s.enquiries.new)} hint={`${s.enquiries.total} in total`} />
        <Stat label="In discussion" value={String(s.enquiries.inDiscussion)} />
        <Stat label="Active deals" value={String(s.deals.active)} hint={`${formatINRCompact(s.deals.activeValue)} value`} />
        <Stat label="Commission due" value={formatINRCompact(s.commission.dueAmount)} hint={`${s.commission.dueCount} deals`} />
        <Stat label="Commission paid" value={formatINRCompact(s.commission.paidAmount)} hint={`${s.commission.paidCount} deals`} />
        <Stat label="Users" value={String(s.users.total)} hint={`${s.users.buyers} buyers · ${s.users.sellers} sellers`} />
        <Stat label="Active listings" value={String(s.listings.active)} hint={`${s.listings.activeOffers} offers · ${s.listings.activeRequirements} requirements`} />
        <Stat label="Completed deals" value={String(s.deals.completed)} />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Latest enquiries</CardTitle>
            <Link href="/admin/enquiries" className="text-sm font-semibold text-ink-800 hover:text-ink-950">View all</Link>
          </CardHeader>
          <CardBody className="divide-y divide-ink-100 p-0">
            {latest.loading && !latest.data ? (
              <Spinner />
            ) : latest.error ? (
              <p className="p-5 text-sm text-danger">{latest.error.message}</p>
            ) : !latest.data?.data.length ? (
              <p className="p-5 text-sm text-ink-500">No enquiries yet.</p>
            ) : (
              latest.data.data.map((e) => (
                <Link key={e.id} href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900">{e.listingTitle}</span>
                    <span className="block text-ink-500">{e.buyer?.name ?? "—"} → {e.seller?.name ?? "—"} · {formatDate(e.createdAt)}</span>
                  </span>
                  <StatusBadge domain="enquiry" status={e.status} />
                </Link>
              ))
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Commission due</CardTitle>
            <Link href="/admin/deals" className="text-sm font-semibold text-ink-800 hover:text-ink-950">View deals</Link>
          </CardHeader>
          <CardBody className="divide-y divide-ink-100 p-0">
            {due.loading && !due.data ? (
              <Spinner />
            ) : due.error ? (
              <p className="p-5 text-sm text-danger">{due.error.message}</p>
            ) : !due.data?.data.length ? (
              <p className="p-5 text-sm text-ink-500">No commission due.</p>
            ) : (
              due.data.data.map((d) => (
                <Link key={d.id} href={`/admin/deals/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900">{d.title}</span>
                    <span className="block text-ink-500">{d.code}</span>
                  </span>
                  <span className="text-ink-700">{formatINR(d.commissionAmount)}</span>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
