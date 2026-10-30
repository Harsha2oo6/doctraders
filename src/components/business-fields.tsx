"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPES, INDIAN_STATES } from "@/lib/constants";
import type { MetaCategory } from "@/lib/meta";
import type { BusinessInput } from "@/lib/validation";
import { Field, Input, Select, Spinner } from "@/components/ui";

type WithBusiness = { business: BusinessInput };

/**
 * "Your business" fields for register and profile. `seller` switches the README §1 rules:
 * sellers must give type, categories, address and pincode; buyer-only accounts may skip them.
 */
export function BusinessFields<T extends WithBusiness>({
  register, errors, seller, categories,
}: {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  seller: boolean;
  categories: MetaCategory[] | undefined;
}) {
  // react-hook-form's generic paths can't see through T here; the field names below all exist on BusinessInput.
  const reg = register as unknown as UseFormRegister<WithBusiness>;
  const e = (errors as FieldErrors<WithBusiness>).business;
  const req = seller ? { required: true } : { optional: true };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Business name" required error={e?.name?.message} className="sm:col-span-2">
        <Input autoComplete="organization" {...reg("business.name")} />
      </Field>
      <Field label="Business type" {...req} error={e?.type?.message}>
        <Select defaultValue="" {...reg("business.type")}>
          <option value="">Select…</option>
          {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{BUSINESS_TYPE_LABELS[t]}</option>)}
        </Select>
      </Field>
      <Field label="Years in business" optional error={e?.yearsInBusiness?.message}>
        <Input type="number" min="0" inputMode="numeric" {...reg("business.yearsInBusiness")} />
      </Field>

      <Field as="div" label="Product categories" {...req} hint={seller ? "Choose at least one." : undefined} error={e?.categories?.message} className="sm:col-span-2">
        {!categories ? (
          <Spinner />
        ) : (
          <div className="grid gap-2 rounded-lg border border-ink-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <label key={c.slug} className="flex items-start gap-2 text-sm text-ink-800">
                <input type="checkbox" value={c.slug} className="mt-0.5 size-4 accent-ink-900" {...reg("business.categories")} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        )}
      </Field>

      <Field label="Full address" {...req} error={e?.address?.message} className="sm:col-span-2">
        <Input autoComplete="street-address" {...reg("business.address")} />
      </Field>
      <Field label="City" required error={e?.city?.message}>
        <Input autoComplete="address-level2" {...reg("business.city")} />
      </Field>
      <Field label="State" required error={e?.state?.message}>
        <Select defaultValue="" {...reg("business.state")}>
          <option value="" disabled>Select…</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>
      <Field label="Pincode" {...req} error={e?.pincode?.message}>
        <Input inputMode="numeric" maxLength={6} autoComplete="postal-code" {...reg("business.pincode")} />
      </Field>
      <Field label="GST number" optional hint="15 characters, checked if you enter it." error={e?.gstNumber?.message}>
        <Input className="uppercase" maxLength={15} {...reg("business.gstNumber")} />
      </Field>
    </div>
  );
}
