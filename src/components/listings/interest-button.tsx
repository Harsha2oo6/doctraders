"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { apiFetch, useApi } from "@/lib/api-client";
import { unitText } from "@/lib/format";
import { useMe } from "@/lib/me";
import type { PublicListing } from "@/lib/types";
import { enquirySchema, type EnquiryInput, type EnquiryValues } from "@/lib/validation";
import { applyApiError } from "@/lib/form-errors";
import { Button, Dialog, Field, FormError, Input, Textarea } from "@/components/ui";

type Viewer = { isOwner: boolean; enquiryId: string | null };

/**
 * "I'm interested" on the listing page (DESIGN.md 6.8):
 * logged out → login · own listing → hidden · missing role → link to profile · already sent → disabled.
 */
export function InterestButton({ listing }: { listing: PublicListing }) {
  const { me, loading } = useMe();
  const viewer = useApi(
    async () => (me ? (await apiFetch<PublicListing & { viewer?: Viewer }>(`/listings/${listing.id}`)).viewer ?? null : null),
    [me?.id, listing.id],
  );
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const big = "w-full rounded-full";
  if (loading || (me && viewer.loading)) return <Button size="lg" className={big} disabled>I&apos;m interested</Button>;
  if (!me) return <Button asChild size="lg" className={big}><Link href={`/login?next=/listings/${listing.id}`}>I&apos;m interested</Link></Button>;

  const isAdmin = me.roles.includes("admin") || me.roles.includes("superadmin");
  if (isAdmin) return <Button asChild size="lg" variant="outline" className={big}><Link href="/admin/listings">Manage in admin</Link></Button>;
  if (viewer.data?.isOwner) return null;

  const needed = listing.kind === "offer" ? "buyer" : "seller";
  if (!me.roles.includes(needed)) {
    return (
      <div className="space-y-2 rounded-lg bg-brand-50 p-4 text-sm text-brand-700">
        <p>Only {needed}s can show interest in {listing.kind === "offer" ? "offers" : "requirements"}.</p>
        <Link href="/dashboard/profile" className="font-semibold underline">Add the {needed} role in your profile</Link>
      </div>
    );
  }

  if (sent || viewer.data?.enquiryId) {
    return (
      <div className="space-y-2">
        <Button size="lg" className={big} disabled>Interest sent</Button>
        {sent && <p className="rounded-lg bg-green-50 p-4 text-sm text-success">Thanks! The Doctraders team will contact you shortly.</p>}
        <p className="text-center text-xs text-ink-500"><Link href="/dashboard/enquiries" className="font-semibold underline">See my enquiries</Link></p>
      </div>
    );
  }

  return (
    <>
      <Button size="lg" className={big} onClick={() => setOpen(true)}>I&apos;m interested</Button>
      <InterestDialog listing={listing} open={open} onClose={() => setOpen(false)} onSent={() => { setSent(true); setOpen(false); }} />
    </>
  );
}

function InterestDialog({ listing, open, onClose, onSent }: { listing: PublicListing; open: boolean; onClose: () => void; onSent: () => void }) {
  const [error, setError] = useState<string>();
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<EnquiryInput, unknown, EnquiryValues>({
    resolver: zodResolver(enquirySchema) as unknown as Resolver<EnquiryInput, unknown, EnquiryValues>,
    defaultValues: { listingId: listing.id, quantity: listing.minOrderQuantity ?? undefined, message: "" },
  });

  async function onSubmit(v: EnquiryValues) {
    setError(undefined);
    try {
      await apiFetch("/enquiries", { body: v });
      onSent();
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  const unit = unitText(listing.unit);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="I'm interested"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="interest-form" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send interest"}</Button>
        </>
      }
    >
      <form id="interest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <p className="text-sm text-ink-600">{listing.title}</p>
        <Field label={`Quantity (${unit})`} required hint={listing.minOrderQuantity ? `Minimum order ${listing.minOrderQuantity.toLocaleString("en-IN")} ${unit}` : undefined} error={errors.quantity?.message}>
          <Input type="number" min="0" step="any" inputMode="decimal" {...register("quantity")} />
        </Field>
        <Field label="Message" optional hint="Grade, delivery place, timing… The Doctraders team reads this, not the other party." error={errors.message?.message}>
          <Textarea rows={3} {...register("message")} />
        </Field>
        <FormError>{error}</FormError>
        <p className="flex items-start gap-2 text-xs text-ink-500"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-info" />Your contact details stay private. Doctraders will call you and handle the deal.</p>
      </form>
    </Dialog>
  );
}
