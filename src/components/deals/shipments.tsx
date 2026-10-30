"use client";

import { Plus, Truck } from "lucide-react";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api-client";
import { SHIPMENT_STATUS_LABELS, SHIPMENT_STATUSES } from "@/lib/constants";
import { formatDateTime, formatQty, unitText } from "@/lib/format";
import type { Shipment } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, CardTitle, Field, FormError, Input, StagePills, Textarea, Timeline, useToast } from "@/components/ui";

const STEPS = SHIPMENT_STATUSES.map((s) => ({ key: s, label: SHIPMENT_STATUS_LABELS[s] }));
const NEXT: Record<string, { status: "shipped" | "reached"; label: string } | undefined> = {
  packed: { status: "shipped", label: "Mark as shipped" },
  shipped: { status: "reached", label: "Mark as reached" },
};

/**
 * Shipment lots with stage pills + history. With `canEdit` (deal's seller or admin, active deal)
 * shows "Add shipment update" and one next-step button per lot. Calls the shared /api/v1/deals/:id/shipments.
 */
export function ShipmentLots({ dealId, shipments, unit, remaining, canEdit, onChange }: {
  dealId: string; shipments: Shipment[]; unit: string; remaining: number; canEdit: boolean; onChange: () => void;
}) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState<string>();

  async function add() {
    setError(undefined);
    const quantity = Number(qty);
    if (!(quantity > 0)) return setError("Enter the quantity in this lot");
    if (quantity > remaining) return setError(`Only ${formatQty(remaining, unit)} is left to ship`);
    setBusy("add");
    try {
      await apiFetch(`/deals/${dealId}/shipments`, { body: { quantity, note: note || undefined } });
      toast("Shipment lot added as packed.");
      setQty(""); setNote(""); setAdding(false);
      onChange();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not add the shipment.");
    } finally {
      setBusy(undefined);
    }
  }

  async function advance(lot: Shipment) {
    const next = NEXT[lot.status];
    if (!next) return;
    setBusy(lot.id);
    try {
      await apiFetch(`/deals/${dealId}/shipments/${lot.id}`, { method: "PATCH", body: { status: next.status } });
      toast(`${formatQty(lot.quantity, unit)} marked as ${next.status}.`);
      onChange();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update the shipment.", "error");
    } finally {
      setBusy(undefined);
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Shipments</CardTitle>
        {canEdit && remaining > 0 && !adding && (
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="size-4" />Add shipment update</Button>
        )}
      </CardHeader>
      <CardBody className="space-y-4">
        {adding && (
          <div className="space-y-3 rounded-lg border border-ink-100 bg-ink-50 p-4">
            <Field label={`Quantity in this lot (${unitText(unit)})`} required hint={`${formatQty(remaining, unit)} left to ship`}>
              <Input type="number" min="0" step="any" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} />
            </Field>
            <Field label="Note" optional hint="Truck number, transporter, expected arrival…">
              <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <FormError>{error}</FormError>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => { setAdding(false); setError(undefined); }}>Cancel</Button>
              <Button size="sm" onClick={add} disabled={busy === "add"}>{busy === "add" ? "Saving…" : "Add as packed"}</Button>
            </div>
          </div>
        )}

        {shipments.length === 0 ? (
          <p className="text-sm text-ink-500">{canEdit ? "No shipments yet. Add a lot when goods are packed." : "No shipments yet. You will be notified when the seller packs and ships."}</p>
        ) : (
          <ul className="space-y-4">
            {shipments.map((lot, i) => {
              const next = NEXT[lot.status];
              return (
                <li key={lot.id} className="space-y-3 rounded-lg border border-ink-100 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-2 font-semibold text-ink-900"><Truck className="size-4 text-ink-500" />Lot {i + 1}: {formatQty(lot.quantity, unit)}</p>
                    <StagePills steps={STEPS} current={lot.status} />
                  </div>
                  {lot.note && <p className="text-sm text-ink-700">{lot.note}</p>}
                  <Timeline items={[...lot.history].reverse().map((h, j) => ({ key: `${h.at}-${j}`, text: SHIPMENT_STATUS_LABELS[h.status], meta: formatDateTime(h.at) }))} />
                  {canEdit && next && (
                    <Button size="lg" className="w-full sm:w-auto" onClick={() => advance(lot)} disabled={busy === lot.id}>{busy === lot.id ? "Saving…" : next.label}</Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
