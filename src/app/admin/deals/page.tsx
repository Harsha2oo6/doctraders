"use client";

import * as sample from "@/lib/sample-data";
import { PageHeader, Spinner } from "@/components/ui";
import { DealCard } from "@/components/admin/deal-card";

export default function DealsPage() {
  const { data, loading } = { data: sample.deals, loading: false };
  return (
    <>
      <PageHeader title="Deals and commission" description="Move deals through the pipeline and record commission." />
      {loading ? <Spinner /> : <div className="space-y-4">{data?.map((d) => <DealCard key={d.id} deal={d} />)}</div>}
    </>
  );
}
