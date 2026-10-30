"use client";

import { api, useApi } from "@doctraders/api-client";
import { Card, CardBody, EmptyState, PageHeader, Spinner, StatusBadge } from "@doctraders/ui";

/** Enquiry inbox. Other parties appear as "Verified Buyer/Seller #id" until a deal starts. */
export default function EnquiriesPage() {
  const { data, loading } = useApi(api.enquiries);
  return (
    <>
      <PageHeader title="Enquiries" description="People interested in your listings, and your own interest sent." />
      {loading ? <Spinner /> : !data?.length ? <EmptyState title="No enquiries yet" /> : (
        <div className="space-y-3">
          {data.map((e) => (
            <Card key={e.id}>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink-900">{e.product}</p>
                  <p className="text-sm text-ink-500">{e.from} · {e.createdAt}</p>
                  <p className="mt-2 text-sm text-ink-700">{e.message}</p>
                </div>
                <StatusBadge status={e.status} />
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
