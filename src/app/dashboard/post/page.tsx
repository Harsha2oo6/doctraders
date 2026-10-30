"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CATEGORIES, DELIVERY_TERMS, PAYMENT_TERMS, UNITS } from "@/lib/constants";
import { listingSchema, type ListingInput, type ListingValues } from "@/lib/validation";
import { Button, Card, CardBody, Checkbox, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";

export default function PostListingPage() {
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ListingInput, unknown, ListingValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { kind: "offer", unit: "MT", deliveryTerms: "FOB", paymentTerms: "LC at sight", priceOnRequest: false },
  });
  const onRequest = watch("priceOnRequest");

  if (done) {
    return (
      <Card><CardBody className="space-y-3 p-8 text-center">
        <h1 className="text-2xl font-semibold text-ink-900">Listing submitted</h1>
        <p className="text-ink-600">It is now live and will be shown to matching verified companies.</p>
        <Button asChild><Link href="/dashboard/marketplace">View marketplace</Link></Button>
      </CardBody></Card>
    );
  }

  return (
    <>
      <PageHeader title="Post a requirement or offer" description="Buyers post requirements. Sellers post offers." />
      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit(() => setDone(true) /* TEMPORARY: Prompt 4 connects POST /api/v1/listings */)} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="I want to post a" error={errors.kind?.message}>
              <Select {...register("kind")}><option value="offer">Offer (I sell)</option><option value="requirement">Requirement (I buy)</option></Select>
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <Select defaultValue="" {...register("category")}><option value="" disabled>Select…</option>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</Select>
            </Field>
            <Field label="Product" error={errors.product?.message} className="sm:col-span-2"><Input {...register("product")} /></Field>
            <Field label="Specification" error={errors.specification?.message} className="sm:col-span-2"><Textarea {...register("specification")} /></Field>
            <Field label="Quantity" error={errors.quantity?.message}><Input type="number" min="0" {...register("quantity")} /></Field>
            <Field label="Unit"><Select {...register("unit")}>{UNITS.map((u) => <option key={u}>{u}</option>)}</Select></Field>
            <Field label="Price" hint="e.g. ₹92,400 / MT"><Input disabled={onRequest} {...register("price")} /></Field>
            <div className="flex items-end pb-2"><Checkbox label="Price on request" {...register("priceOnRequest")} /></div>
            <Field label="Port or location" error={errors.location?.message}><Input {...register("location")} /></Field>
            <Field label="Valid until" error={errors.validUntil?.message}><Input type="date" {...register("validUntil")} /></Field>
            <Field label="Delivery terms"><Select {...register("deliveryTerms")}>{DELIVERY_TERMS.map((t) => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Payment terms"><Select {...register("paymentTerms")}>{PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}</Select></Field>
            <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting…" : "Submit listing"}</Button></div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
