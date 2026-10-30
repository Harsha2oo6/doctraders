"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { apiFetch, useApi } from "@/lib/api-client";
import type { PublicListing } from "@/lib/types";
import { ListingForm } from "@/components/listings/listing-form";
import { Card, CardBody, ErrorState, PageHeader, Spinner, StatusBadge } from "@/components/ui";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, refetch } = useApi(() => apiFetch<PublicListing>(`/listings/${id}`), [id]);

  if (loading) return <Spinner />;
  if (error || !data) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <>
      <Link href={`/dashboard/listings?tab=${data.kind}`} className="mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" />My listings</Link>
      <PageHeader title="Edit listing" description={data.title} actions={<StatusBadge domain="listing" status={data.status} />} />
      <Card>
        <CardBody className="p-6">
          <ListingForm mode="edit" listing={data} />
        </CardBody>
      </Card>
    </>
  );
}
