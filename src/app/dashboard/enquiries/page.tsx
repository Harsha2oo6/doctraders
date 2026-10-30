"use client";

import Link from "next/link";
import { useState } from "react";
import { apiList, useApi } from "@/lib/api-client";
import { ENQUIRY_PARTY_STATUS_LABELS, ENQUIRY_PARTY_STATUSES, LISTING_KIND_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { PartyEnquiry } from "@/lib/types";
import { Button, Card, CardBody, EmptyState, ErrorState, PageHeader, Pager, Spinner, StatusBadge, Tabs } from "@/components/ui";

const LIMIT = 20;

/** Interests I sent. The other side appears only as an alias; Doctraders handles the conversation. */
export default function EnquiriesPage() {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const list = useApi(
    () => apiList<PartyEnquiry>("/me/enquiries", { query: { status: status === "all" ? undefined : status, page, limit: LIMIT } }),
    [status, page],
  );

  return (
    <>
      <PageHeader title="My enquiries" description="Listings you clicked “I'm interested” on. The Doctraders team contacts both sides and updates the status here." />
      <Tabs
        active={status}
        onChange={(s) => { setStatus(s); setPage(1); }}
        tabs={[{ key: "all", label: "All" }, ...ENQUIRY_PARTY_STATUSES.map((s) => ({ key: s, label: ENQUIRY_PARTY_STATUS_LABELS[s] }))]}
      />
      {list.loading && !list.data ? (
        <Spinner />
      ) : list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !list.data?.data.length ? (
        <EmptyState title="No enquiries yet" action={<Button asChild><Link href="/listings">Browse listings</Link></Button>}>
          Find an offer or requirement and click &ldquo;I&apos;m interested&rdquo;.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {list.data.data.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/listings/${e.listingId}`} className="font-semibold text-ink-900 hover:text-brand-600">{e.listingTitle}</Link>
                  <p className="text-sm text-ink-500">
                    {LISTING_KIND_LABELS[e.listingKind]} · Qty {e.quantity.toLocaleString("en-IN")} · {formatDate(e.createdAt)} · {e.counterparty.alias}
                  </p>
                  {e.message && <p className="mt-2 text-sm text-ink-700">{e.message}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge domain="enquiryParty" status={e.status} />
                  {e.dealId && <Button asChild size="sm" variant="outline"><Link href={`/dashboard/deals/${e.dealId}`}>View deal</Link></Button>}
                </div>
              </CardBody>
            </Card>
          ))}
          {list.data.total > LIMIT && <Pager page={page} limit={LIMIT} total={list.data.total} onPage={setPage} />}
        </div>
      )}
    </>
  );
}
