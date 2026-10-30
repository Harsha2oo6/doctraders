"use client";

import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { ApiError, apiFetch, useApi } from "@/lib/api-client";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS, type PaymentMethod } from "@/lib/constants";
import { formatDate, formatDateTime, formatINR, formatQty, unitText } from "@/lib/format";
import type { AdminDeal } from "@/lib/types";
import { PartyCard } from "@/components/admin/party-card";
import { DealProgressBars } from "@/components/deals/deal-progress";
import { ShipmentLots } from "@/components/deals/shipments";
import {
  Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, Dialog, ErrorState, Field, FormError, Input,
  PageHeader, Select, Spinner, StatusBadge, Textarea, useToast,
} from "@/components/ui";

type Confirm = "complete" | "cancel" | "commission" | null;

export default function AdminDealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const q = useApi(() => apiFetch<AdminDeal>(`/admin/deals/${id}`), [id]);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notes, setNotes] = useState<string>();

  if (q.loading && !q.data) return <Spinner />;
  if (q.error || !q.data) return <ErrorState message={q.error?.message} onRetry={q.refetch} />;
  const d = q.data;
  const active = d.status === "active";

  async function patch(body: object, done: string) {
    setBusy(true);
    try {
      await apiFetch(`/admin/deals/${id}`, { method: "PATCH", body });
      toast(done);
      setConfirm(null);
      q.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not save.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function removePayment(paymentId: string) {
    setBusy(true);
    try {
      await apiFetch(`/admin/deals/${id}/payments/${paymentId}`, { method: "DELETE" });
      toast("Payment removed.");
      q.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not remove the payment.", "error");
    } finally {
      setBusy(false);
    }
  }

  const incomplete = d.paidPercent < 100 || d.reachedPercent < 100;

  return (
    <>
      <Link href="/admin/deals" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" />Deals</Link>
      <PageHeader
        title={d.title}
        description={`${d.code} · created ${formatDate(d.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge domain="deal" status={d.status} />
            <span className="text-sm font-semibold text-ink-900">{formatINR(d.totalValue)}</span>
            <StatusBadge domain="commission" status={d.commissionStatus} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
            <CardBody><DealProgressBars d={d} /></CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Payments</CardTitle>
              {d.status !== "cancelled" && d.balanceAmount > 0 && <Button size="sm" variant="outline" onClick={() => setPayOpen(true)}><Plus className="size-4" />Record payment</Button>}
            </CardHeader>
            <CardBody className="divide-y divide-ink-100 p-0">
              {d.payments.length === 0 ? (
                <p className="p-5 text-sm text-ink-500">No payments yet.</p>
              ) : (
                d.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span>
                      <span className="font-medium text-ink-900">{formatINR(p.amount)}</span>
                      <span className="block text-xs text-ink-500">{formatDate(p.paidAt)}{p.method ? ` · ${PAYMENT_METHOD_LABELS[p.method]}` : ""}{p.note ? ` · ${p.note}` : ""}</span>
                    </span>
                    {d.status !== "cancelled" && <Button size="sm" variant="ghost" aria-label="Remove payment" disabled={busy} onClick={() => removePayment(p.id)}><Trash2 className="size-4" /></Button>}
                  </div>
                ))
              )}
              <div className="flex justify-between px-5 py-3 text-sm"><span className="text-ink-500">Balance</span><span className="font-semibold text-ink-900">{formatINR(d.balanceAmount)}</span></div>
            </CardBody>
          </Card>

          <ShipmentLots dealId={d.id} shipments={d.shipments} unit={d.unit} remaining={d.remainingQuantity} canEdit={active} onChange={q.refetch} />

          <div className="grid gap-4 xl:grid-cols-2">
            <PartyCard role="buyer" party={d.buyer} />
            <PartyCard role="seller" party={d.seller} />
          </div>
        </div>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Deal</CardTitle>
              {d.status !== "cancelled" && <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)} aria-label="Edit numbers"><Pencil className="size-4" /></Button>}
            </CardHeader>
            <CardBody className="space-y-4">
              <dl className="divide-y divide-ink-100 rounded-lg border border-ink-100 text-sm">
                <Row k="Quantity" v={formatQty(d.quantity, d.unit)} />
                <Row k="Price" v={`${formatINR(d.pricePerUnit)} / ${unitText(d.unit)}`} />
                <Row k="Value" v={formatINR(d.totalValue)} />
                <Row k={`Commission (${d.commissionPercent}%)`} v={formatINR(d.commissionAmount)} />
              </dl>
              <div className="flex flex-col gap-2">
                {active && <Button onClick={() => setConfirm("complete")}>Mark completed</Button>}
                {d.status === "completed" && d.commissionStatus === "due" && <Button variant="secondary" onClick={() => setConfirm("commission")}>Mark commission paid</Button>}
                {active && <Button variant="outline" onClick={() => setConfirm("cancel")}>Cancel deal</Button>}
              </div>
            </CardBody>
          </Card>

          <Card className="h-fit">
            <CardHeader><CardTitle>Admin notes</CardTitle></CardHeader>
            <CardBody className="space-y-2">
              <Textarea value={notes ?? d.adminNotes ?? ""} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Only admins see this." aria-label="Admin notes" />
              <div className="flex justify-end">
                <Button size="sm" variant="outline" disabled={busy || notes === undefined} onClick={() => patch({ adminNotes: notes?.trim() || null }, "Notes saved.").then(() => setNotes(undefined))}>Save notes</Button>
              </div>
            </CardBody>
          </Card>

          <Card className="h-fit">
            <CardHeader><CardTitle>Links</CardTitle></CardHeader>
            <CardBody className="space-y-1 text-sm">
              <Link href={`/admin/enquiries/${d.enquiryId}`} className="block font-semibold text-ink-800 hover:text-brand-600">Original enquiry →</Link>
              <Link href={`/listings/${d.listingId}`} className="block font-semibold text-ink-800 hover:text-brand-600">Listing →</Link>
              <p className="pt-2 text-xs text-ink-500">Updated {formatDateTime(d.updatedAt)}</p>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog open={confirm === "complete"} onClose={() => setConfirm(null)} busy={busy} tone="primary" confirmLabel="Mark completed" title="Mark this deal completed?"
        onConfirm={() => patch({ status: "completed" }, "Deal completed. Commission is now due.")}>
        {incomplete ? (
          <p className="rounded-lg bg-amber-100 p-3 text-warning">Only {d.paidPercent}% is paid and {d.reachedPercent}% has reached the buyer. You can still complete it.</p>
        ) : (
          <p>Fully paid and delivered.</p>
        )}
        <p className="mt-2">Commission of {formatINR(d.commissionAmount)} becomes due and both parties are notified.</p>
      </ConfirmDialog>
      <ConfirmDialog open={confirm === "cancel"} onClose={() => setConfirm(null)} busy={busy} confirmLabel="Cancel deal" title="Cancel this deal?"
        onConfirm={() => patch({ status: "cancelled" }, "Deal cancelled.")}>
        The deal stops here. Payments and shipments stay recorded. This cannot be undone.
      </ConfirmDialog>
      <ConfirmDialog open={confirm === "commission"} onClose={() => setConfirm(null)} busy={busy} tone="primary" confirmLabel="Mark paid" title="Commission received?"
        onConfirm={() => patch({ commissionStatus: "paid" }, "Commission marked paid.")}>
        Mark {formatINR(d.commissionAmount)} commission as paid.
      </ConfirmDialog>

      <PaymentDialog open={payOpen} onClose={() => setPayOpen(false)} deal={d} onSaved={() => { setPayOpen(false); q.refetch(); }} />
      <EditDialog open={editOpen} onClose={() => setEditOpen(false)} deal={d} onSaved={() => { setEditOpen(false); q.refetch(); }} />
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium text-ink-900">{v}</dd></div>;
}

function PaymentDialog({ open, onClose, deal, onSaved }: { open: boolean; onClose: () => void; deal: AdminDeal; onSaved: () => void }) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "">("bank");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function save() {
    setError(undefined); setErrors({});
    setBusy(true);
    try {
      await apiFetch(`/admin/deals/${deal.id}/payments`, { body: { amount: Number(amount) || amount, method: method || undefined, paidAt, note: note || undefined } });
      toast("Payment recorded. The seller was notified.");
      setAmount(""); setNote("");
      onSaved();
    } catch (e) {
      if (e instanceof ApiError) { setErrors(e.fields); setError(e.message); } else setError("Could not save the payment.");
    } finally {
      setBusy(false);
    }
  }

  const half = Math.round(deal.totalValue / 2);
  return (
    <Dialog open={open} onClose={onClose} title="Record payment"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Record payment"}</Button></>}>
      <Field label="Amount (₹)" required hint={`Balance ${formatINR(deal.balanceAmount)}`} error={errors.amount}>
        <Input type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2 text-xs">
        {deal.paidAmount === 0 && <button type="button" className="cursor-pointer rounded-full border border-ink-200 px-3 py-1 hover:bg-ink-50" onClick={() => setAmount(String(half))}>50% · {formatINR(half)}</button>}
        <button type="button" className="cursor-pointer rounded-full border border-ink-200 px-3 py-1 hover:bg-ink-50" onClick={() => setAmount(String(deal.balanceAmount))}>Full balance · {formatINR(deal.balanceAmount)}</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Method" optional error={errors.method}>
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            <option value="">—</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
          </Select>
        </Field>
        <Field label="Paid on" optional error={errors.paidAt}><Input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} /></Field>
      </div>
      <Field label="Note" optional hint="UTR / cheque no. Only admins see this." error={errors.note}><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
      <FormError>{error}</FormError>
    </Dialog>
  );
}

function EditDialog({ open, onClose, deal, onSaved }: { open: boolean; onClose: () => void; deal: AdminDeal; onSaved: () => void }) {
  const toast = useToast();
  const [v, setV] = useState({ quantity: String(deal.quantity), pricePerUnit: String(deal.pricePerUnit), commissionPercent: String(deal.commissionPercent) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const total = (Number(v.quantity) || 0) * (Number(v.pricePerUnit) || 0);

  async function save() {
    setError(undefined); setErrors({});
    setBusy(true);
    try {
      await apiFetch(`/admin/deals/${deal.id}`, { method: "PATCH", body: { quantity: Number(v.quantity), pricePerUnit: Number(v.pricePerUnit), commissionPercent: Number(v.commissionPercent) } });
      toast("Deal updated. Totals recalculated.");
      onSaved();
    } catch (e) {
      if (e instanceof ApiError) { setErrors(e.fields); setError(e.message); } else setError("Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit deal numbers"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={`Quantity (${unitText(deal.unit)})`} error={errors.quantity}><Input type="number" step="any" value={v.quantity} onChange={(e) => setV({ ...v, quantity: e.target.value })} /></Field>
        <Field label="Price / unit (₹)" error={errors.pricePerUnit}><Input type="number" step="any" value={v.pricePerUnit} onChange={(e) => setV({ ...v, pricePerUnit: e.target.value })} /></Field>
        <Field label="Commission %" error={errors.commissionPercent}><Input type="number" step="0.01" value={v.commissionPercent} onChange={(e) => setV({ ...v, commissionPercent: e.target.value })} /></Field>
      </div>
      <p className="text-sm text-ink-600">New value {formatINR(total)} · commission {formatINR((total * (Number(v.commissionPercent) || 0)) / 100)}</p>
      <FormError>{error}</FormError>
    </Dialog>
  );
}
