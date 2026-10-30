"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { COMPANY_TYPES, COMPANY_TYPE_LABEL, COUNTRIES, companyStepSchema, type CompanyStep } from "@doctraders/schemas";
import { Button, Checkbox, Field, Input, Select } from "@doctraders/ui";

export function CompanyStepForm({ defaults, onNext, onBack }: { defaults?: CompanyStep; onNext: (v: CompanyStep) => void; onBack: () => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CompanyStep>({
    resolver: zodResolver(companyStepSchema),
    defaultValues: defaults,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4" noValidate>
      <h2 className="text-xl font-semibold text-ink-900">Your company</h2>
      <Field label="Company name" error={errors.companyName?.message}><Input autoComplete="organization" {...register("companyName")} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company type" error={errors.companyType?.message}>
          <Select defaultValue="" {...register("companyType")}>
            <option value="" disabled>Select…</option>
            {COMPANY_TYPES.map((t) => <option key={t} value={t}>{COMPANY_TYPE_LABEL[t]}</option>)}
          </Select>
        </Field>
        <Field label="Country" error={errors.country?.message}>
          <Select defaultValue="" {...register("country")}>
            <option value="" disabled>Select…</option>
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
      </div>
      <Checkbox
        label="I confirm my company buys, sells or provides logistics directly. I am not a broker or agent."
        error={errors.isDirectParty?.message}
        {...register("isDirectParty")}
      />
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
