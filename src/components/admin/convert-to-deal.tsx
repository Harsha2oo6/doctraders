"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { UNIT_LABELS, UNITS } from "@/lib/constants";
import { applyApiError } from "@/lib/form-errors";
import { formatINR } from "@/lib/format";
import type { AdminDeal, AdminEnquiry } from "@/lib/types";
import { dealCreateSchema, type DealCreateInput, type DealCreateValues } from "@/lib/validation";
import { Button, Dialog, Field, FormError, Input, Select, Textarea, useToast } from "@/components/ui";

const DEFAULT_COMMISSION = 2;

/** "Convert to deal" on the admin enquiry page → POST /api/v1/admin/deals → deal page. */
export function ConvertToDealButton({ enquiry }: { enquiry: AdminEnquiry }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const { register, handleSubmit, watch, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<DealCreateInput, unknown, DealCreateValues>({
    resolver: zodResolver(dealCreateSchema) as unknown as Resolver<DealCreateInput, unknown, DealCreateValues>,
    defaultValues: {
      enquiryId: enquiry.id,
      quantity: enquiry.quantity,
      unit: enquiry.listing?.unit ?? "bag",
      pricePerUnit: enquiry.listing?.price ?? undefined,
      commissionPercent: DEFAULT_COMMISSION,
      adminNotes: "",
    },
  });

  const [qty, price, pct] = [Number(watch("quantity")) || 0, Number(watch("pricePerUnit")) || 0, Number(watch("commissionPercent")) || 0];
  const total = Math.round(qty * price * 100) / 100;
  const commission = Math.round(((total * pct) / 100) * 100) / 100;

  async function onSubmit(v: DealCreateValues) {
    setError(undefined);
    try {
      const deal = await apiFetch<AdminDeal>("/admin/deals", { body: v });
      toast(`Deal ${deal.code} created. Buyer and seller were notified.`);
      router.push(`/admin/deals/${deal.id}`);
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={enquiry.status === "dropped"} title={enquiry.status === "dropped" ? "Move the enquiry out of Dropped first" : undefined}>
        <Handshake className="size-4" />Convert to deal
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Convert to deal"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="deal-form" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create deal"}</Button>
          </>
        }
      >
        <form id="deal-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <p className="text-sm text-ink-600 sm:col-span-2">{enquiry.listingTitle}</p>
          <Field label="Quantity" required error={errors.quantity?.message}><Input type="number" min="0" step="any" {...register("quantity")} /></Field>
          <Field label="Unit" required error={errors.unit?.message}>
            <Select {...register("unit")}>{UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}</Select>
          </Field>
          <Field label="Agreed price per unit (₹)" required error={errors.pricePerUnit?.message}><Input type="number" min="0" step="any" {...register("pricePerUnit")} /></Field>
          <Field label="Commission %" required error={errors.commissionPercent?.message}><Input type="number" min="0" max="100" step="0.01" {...register("commissionPercent")} /></Field>
          <Field label="Admin notes" optional className="sm:col-span-2" error={errors.adminNotes?.message}><Textarea rows={2} {...register("adminNotes")} /></Field>
          <dl className="divide-y divide-ink-100 rounded-lg border border-ink-100 text-sm sm:col-span-2">
            <div className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-500">Deal value</dt><dd className="text-right font-medium text-ink-900">{formatINR(total)}</dd></div>
            <div className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-500">Commission ({pct}%)</dt><dd className="text-right font-medium text-ink-900">{formatINR(commission)}</dd></div>
          </dl>
          <div className="sm:col-span-2"><FormError>{error}</FormError></div>
        </form>
      </Dialog>
    </>
  );
}
