"use client";

import { ArrowLeft, Handshake } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { ApiError, apiFetch, useApi } from "@/lib/api-client";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUSES, LISTING_KIND_LABELS, type EnquiryStatus } from "@/lib/constants";
import { formatDateTime, formatPrice, formatQty } from "@/lib/format";
import type { AdminEnquiry } from "@/lib/types";
import { ConvertToDealButton } from "@/components/admin/convert-to-deal";
import { PartyCard } from "@/components/admin/party-card";
import { Button, Card, CardBody, CardHeader, CardTitle, ErrorState, PageHeader, Select, Spinner, StatusBadge, Textarea, Timeline, useToast } from "@/components/ui";

export default function AdminEnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const q = useApi(() => apiFetch<AdminEnquiry>(`/admin/enquiries/${id}`), [id]);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string>();

  if (q.loading && !q.data) return <Spinner />;
  if (q.error || !q.data) return <ErrorState message={q.error?.message} onRetry={q.refetch} />;
  const e = q.data;
  const l = e.listing;
  const nameOf = (byId: string) => (byId === e.buyer?.id ? e.buyer.name : byId === e.seller?.id ? e.seller.name : e.notes.find((n) => n.byId === byId)?.byName ?? "Admin");

  async function setStatus(status: EnquiryStatus) {
    setSaving(true);
    try {
      await apiFetch(`/admin/enquiries/${id}`, { method: "PATCH", body: { status } });
      toast(`Status: ${ENQUIRY_STATUS_LABELS[status]}`);
      q.refetch();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not save the status.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    setNoteError(undefined);
    if (!note.trim()) return setNoteError("Write a note");
    setSaving(true);
    try {
      await apiFetch(`/admin/enquiries/${id}/notes`, { body: { text: note } });
      setNote("");
      toast("Note added.");
      q.refetch();
    } catch (err) {
      setNoteError(err instanceof ApiError ? err.message : "Could not add the note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Link href="/admin/enquiries" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" />Enquiries</Link>
      <PageHeader
        title={e.listingTitle}
        description={`Enquiry from the ${e.fromRole} · ${formatDateTime(e.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge domain="enquiry" status={e.status} />
            {e.dealId ? (
              <Button asChild variant="secondary"><Link href={`/admin/deals/${e.dealId}`}><Handshake className="size-4" />View deal</Link></Button>
            ) : (
              <ConvertToDealButton enquiry={e} />
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Listing</CardTitle>
              <StatusBadge domain="kind" status={e.listingKind} />
            </CardHeader>
            <CardBody>
              {!l ? (
                <p className="text-sm text-ink-500">The listing was deleted. Title at the time: {e.listingTitle}</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {l.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element -- small thumbnail
                    <img src={l.images[0]} alt="" className="size-20 shrink-0 rounded-md border border-ink-100 object-cover" />
                  )}
                  <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-ink-500">Title</dt><dd className="font-medium text-ink-900"><Link href={`/listings/${l.id}`} className="hover:text-brand-600" target="_blank">{l.title}</Link></dd></div>
                    <div><dt className="text-ink-500">Type</dt><dd className="font-medium text-ink-900">{LISTING_KIND_LABELS[l.kind]} · <StatusBadge domain="listing" status={l.status} /></dd></div>
                    <div><dt className="text-ink-500">Listed quantity</dt><dd className="font-medium text-ink-900">{formatQty(l.quantity, l.unit)}</dd></div>
                    <div><dt className="text-ink-500">Price</dt><dd className="font-medium text-ink-900">{formatPrice(l.price, l.unit)}</dd></div>
                    <div><dt className="text-ink-500">Wanted in this enquiry</dt><dd className="font-semibold text-brand-700">{formatQty(e.quantity, l.unit)}</dd></div>
                    <div><dt className="text-ink-500">Location</dt><dd className="font-medium text-ink-900">{l.city}, {l.state}</dd></div>
                  </dl>
                </div>
              )}
              {e.message && <p className="mt-4 rounded-lg bg-ink-50 p-3 text-sm text-ink-700"><span className="font-semibold">Message: </span>{e.message}</p>}
            </CardBody>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <PartyCard role="buyer" party={e.buyer} note={e.fromRole === "buyer" ? "Sent interest" : "Listing owner"} />
            <PartyCard role="seller" party={e.seller} note={e.fromRole === "seller" ? "Sent interest" : "Listing owner"} />
          </div>

          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Timeline
                empty="No notes yet. Write down what each side said."
                items={e.notes.map((n) => ({ key: n.id, text: <span className="whitespace-pre-line">{n.text}</span>, meta: `${n.byName} (admin) · ${formatDateTime(n.at)}` }))}
              />
              <div className="space-y-2 border-t border-ink-100 pt-4">
                <Textarea value={note} onChange={(ev) => setNote(ev.target.value)} placeholder="Spoke to seller, price ₹2,400 final…" aria-label="New note" />
                {noteError && <p role="alert" className="text-xs text-danger">{noteError}</p>}
                <div className="flex justify-end"><Button size="sm" onClick={addNote} disabled={saving}>{saving ? "Saving…" : "Add note"}</Button></div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Status</CardTitle>
              <StatusBadge domain="enquiry" status={e.status} />
            </CardHeader>
            <CardBody className="space-y-2">
              <Select value={e.status} disabled={saving || !!e.dealId} onChange={(ev) => setStatus(ev.target.value as EnquiryStatus)} aria-label="Enquiry status">
                {ENQUIRY_STATUSES.map((s) => <option key={s} value={s} disabled={s === "deal_closed"}>{ENQUIRY_STATUS_LABELS[s]}</option>)}
              </Select>
              <p className="text-xs text-ink-400">
                {e.dealId ? "A deal was created from this enquiry." : "Saves instantly. “Deal closed” is set automatically when you convert it to a deal. Buyers and sellers only see Received / In discussion / Deal done / Closed."}
              </p>
            </CardBody>
          </Card>

          <Card className="h-fit">
            <CardHeader><CardTitle>Status history</CardTitle></CardHeader>
            <CardBody>
              <Timeline items={e.statusHistory.map((h, i) => ({ key: `${h.at}-${i}`, text: ENQUIRY_STATUS_LABELS[h.status], meta: `${nameOf(h.byId)} · ${formatDateTime(h.at)}` }))} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
