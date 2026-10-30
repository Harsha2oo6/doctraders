"use client";

import { useMemo } from "react";
import { createDealMachine, useMachine } from "@doctraders/machines";
import { DEAL_STAGES, formatINR, type Deal } from "@doctraders/schemas";
import { Badge, Button, Card, CardBody, StatusBadge, cn } from "@doctraders/ui";

/** One deal driven by the deal machine. Buttons are disabled when the machine cannot take that event. */
export function DealCard({ deal }: { deal: Deal }) {
  const machine = useMemo(() => createDealMachine(deal), [deal]);
  const [state, send] = useMachine(machine);

  const stage = state.matches("completed") ? "completed" : (state.value as string);
  const idx = DEAL_STAGES.indexOf(stage as (typeof DEAL_STAGES)[number]);
  const cancelled = state.matches("cancelled");
  const completed = state.matches("completed");
  const commissionPaid = state.matches({ completed: "paid" });
  const amount = (deal.value * deal.commissionPercent) / 100;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-ink-900">{deal.product}</p>
            <p className="text-sm text-ink-500">{deal.seller} → {deal.buyer}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-ink-900">{formatINR(deal.value)}</p>
            <p className="text-ink-500">Commission {deal.commissionPercent}% = {formatINR(amount)}</p>
          </div>
        </div>

        <ol className="flex flex-wrap gap-2 text-xs">
          {DEAL_STAGES.map((s, i) => (
            <li key={s} className={cn("rounded-full px-3 py-1 capitalize", !cancelled && i <= idx ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-400")}>{s}</li>
          ))}
          {cancelled && <li><Badge tone="danger">Cancelled</Badge></li>}
        </ol>

        <div className="flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
          {state.matches("agreement") && !state.context.agreementAccepted && (
            <Button size="sm" variant="outline" onClick={() => send({ type: "ACCEPT_AGREEMENT" })}>Record agreement accepted</Button>
          )}
          <Button size="sm" disabled={!state.can({ type: "ADVANCE" })} onClick={() => send({ type: "ADVANCE" })}>Advance stage</Button>
          <Button size="sm" variant="danger" disabled={!state.can({ type: "CANCEL" })} onClick={() => send({ type: "CANCEL" })}>Cancel</Button>
          {completed && (
            <>
              <Button size="sm" variant="secondary" disabled={!state.can({ type: "MARK_PAID" })} onClick={() => send({ type: "MARK_PAID" })}>Mark commission paid</Button>
              <StatusBadge status={commissionPaid ? "paid" : "due"} />
            </>
          )}
          {state.matches("agreement") && !state.context.agreementAccepted && <span className="text-xs text-warning">Cannot ship until both parties accept the commission agreement.</span>}
        </div>
      </CardBody>
    </Card>
  );
}
