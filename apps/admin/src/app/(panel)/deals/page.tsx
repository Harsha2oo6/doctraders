"use client";

import { api, useApi } from "@doctraders/api-client";
import { PageHeader, Spinner } from "@doctraders/ui";
import { DealCard } from "@/components/deal-card";

export default function DealsPage() {
  const { data, loading } = useApi(api.deals);
  return (
    <>
      <PageHeader title="Deals and commission" description="Move deals through the pipeline and record commission." />
      {loading ? <Spinner /> : <div className="space-y-4">{data?.map((d) => <DealCard key={d.id} deal={d} />)}</div>}
    </>
  );
}
