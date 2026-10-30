"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { INDIAN_STATES, UNIT_LABELS, UNITS, type ListingKind } from "@/lib/constants";
import { applyApiError } from "@/lib/form-errors";
import { useMeta } from "@/lib/meta";
import type { PublicListing } from "@/lib/types";
import { listingSchema, type ListingInput, type ListingValues } from "@/lib/validation";
import { ImageUploader } from "@/components/listings/image-uploader";
import { Button, Checkbox, Field, FormError, Input, Select, Textarea, useToast } from "@/components/ui";

type Props =
  | { mode: "create"; kind: ListingKind; defaults?: Partial<ListingInput> }
  | { mode: "edit"; listing: PublicListing };

/** Post / edit a listing. Same Zod schema as POST /api/v1/listings. */
export function ListingForm(props: Props) {
  const router = useRouter();
  const toast = useToast();
  const { meta } = useMeta();
  const kind = props.mode === "create" ? props.kind : props.listing.kind;
  const l = props.mode === "edit" ? props.listing : undefined;
  const [onRequest, setOnRequest] = useState(l ? !l.price : false);
  const [error, setError] = useState<string>();

  const { register, handleSubmit, control, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ListingInput, unknown, ListingValues>({
    resolver: zodResolver(listingSchema) as unknown as Resolver<ListingInput, unknown, ListingValues>,
    defaultValues: l
      ? {
          kind, title: l.title, category: l.category, description: l.description, quantity: l.quantity, unit: l.unit,
          price: l.price ?? "", minOrderQuantity: l.minOrderQuantity ?? "", city: l.city, state: l.state as ListingInput["state"], images: l.images,
        }
      : { kind, unit: "bag", images: [], category: "", ...(props.mode === "create" ? props.defaults : {}) },
  });

  async function onSubmit(v: ListingValues) {
    setError(undefined);
    const price = onRequest ? undefined : v.price;
    try {
      if (props.mode === "create") {
        const created = await apiFetch<PublicListing>("/listings", { body: { ...v, price } });
        toast(kind === "offer" ? "Your product is live." : "Your requirement is live.");
        router.push(`/dashboard/listings?tab=${created.kind}`);
      } else {
        const { kind: _k, ...fields } = v;
        await apiFetch<PublicListing>(`/listings/${props.listing.id}`, {
          method: "PATCH",
          body: { ...fields, price: price ?? null, minOrderQuantity: v.minOrderQuantity ?? null },
        });
        toast("Changes saved.");
        router.push(`/dashboard/listings?tab=${kind}`);
      }
      router.refresh();
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  const offer = kind === "offer";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
      <Field label="Title" required hint={offer ? "e.g. Basmati rice 1121, 25 kg bags" : "e.g. Need 500 bags of basmati 1121"} error={errors.title?.message} className="sm:col-span-2">
        <Input {...register("title")} />
      </Field>
      <Field label="Category" required error={errors.category?.message}>
        <Select {...register("category")}>
          <option value="" disabled>Select…</option>
          {meta?.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-[1fr_8rem] gap-3">
        <Field label={offer ? "Quantity available" : "Quantity needed"} required error={errors.quantity?.message}>
          <Input type="number" min="0" step="any" inputMode="decimal" {...register("quantity")} />
        </Field>
        <Field label="Unit" required error={errors.unit?.message}>
          <Select {...register("unit")}>{UNITS.map((u) => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}</Select>
        </Field>
      </div>
      <Field label="Description" required hint="Grade, variety, packing, moisture, delivery terms…" error={errors.description?.message} className="sm:col-span-2">
        <Textarea rows={5} {...register("description")} />
      </Field>
      <Field label={offer ? "Price per unit (₹)" : "Target price per unit (₹)"} optional error={errors.price?.message}>
        <Input type="number" min="0" step="any" inputMode="decimal" disabled={onRequest} {...register("price")} />
      </Field>
      <div className="flex items-end pb-2">
        <Checkbox label="Price on request" checked={onRequest} onChange={(e) => setOnRequest(e.target.checked)} />
      </div>
      <Field label={offer ? "Minimum order" : "Minimum lot"} optional error={errors.minOrderQuantity?.message}>
        <Input type="number" min="0" step="any" inputMode="decimal" {...register("minOrderQuantity")} />
      </Field>
      <div className="hidden sm:block" />
      <Field label="City" required error={errors.city?.message}><Input {...register("city")} /></Field>
      <Field label="State" required error={errors.state?.message}>
        <Select defaultValue="" {...register("state")}>
          <option value="" disabled>Select…</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>
      <Field as="div" label="Photos" required={offer} optional={!offer} className="sm:col-span-2">
        <Controller
          control={control}
          name="images"
          render={({ field }) => <ImageUploader value={(field.value as string[]) ?? []} onChange={field.onChange} error={errors.images?.message} />}
        />
      </Field>
      <div className="sm:col-span-2"><FormError>{error}</FormError></div>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : props.mode === "create" ? (offer ? "Post product" : "Post requirement") : "Save changes"}</Button>
      </div>
    </form>
  );
}
