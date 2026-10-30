"use client";

import { Check } from "lucide-react";
import * as sample from "@/lib/sample-data";
import { formatINR } from "@/lib/format";
import { DEAL_STAGES } from "@/lib/sample-data";
import { Card, CardBody, EmptyState, PageHeader, Spinner, StatusBadge, cn } from "@/components/ui";

export default function MyDealsPage() {
  const { data, loading } = { data: sample.deals, loading: false };
  return (
    <>
      <PageHeader title="My deals" description="Track each deal from enquiry to completion." />
      {loading ? <Spinner /> : !data?.length ? <EmptyState title="No deals yet" /> : (
        <div className="space-y-4">
          {data.map((d) => {
            const idx = DEAL_STAGES.indexOf(d.stage as (typeof DEAL_STAGES)[number]);
            return (
              <Card key={d.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-ink-900">{d.product}</p>
                      <p className="text-sm text-ink-500">{formatINR(d.value)} · commission {d.commissionPercent}%</p>
                    </div>
                    {d.commissionStatus !== "not-applicable" && <StatusBadge status={d.commissionStatus} />}
                  </div>
                  <ol className="flex flex-wrap gap-2 text-xs">
                    {DEAL_STAGES.map((s, i) => (
                      <li key={s} className={cn("flex items-center gap-1 rounded-full px-3 py-1 capitalize", i <= idx ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-400")}>
                        {i < idx && <Check className="size-3" />}{s}
                      </li>
                    ))}
                  </ol>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
