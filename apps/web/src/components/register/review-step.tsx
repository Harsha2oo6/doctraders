"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import type { RegistrationContext } from "@doctraders/machines";
import { COMPANY_TYPE_LABEL, consentSchema, type ConsentStep } from "@doctraders/schemas";
import { Button, Checkbox } from "@doctraders/ui";

export function ReviewStep({ context, submitting, onBack, onSubmit }: {
  context: RegistrationContext; submitting: boolean; onBack: () => void; onSubmit: (c: ConsentStep) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ConsentStep>({ resolver: zodResolver(consentSchema) });
  const rows: [string, string | undefined][] = [
    ["Company", context.company?.companyName],
    ["Type", context.company && COMPANY_TYPE_LABEL[context.company.companyType]],
    ["Country", context.company?.country],
    ["Contact", context.account?.contactName],
    ["Email", context.account?.email],
    ["Phone", context.account?.phone],
    ["Documents", `${Object.keys(context.files).length} uploaded`],
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <h2 className="text-xl font-semibold text-ink-900">Review and submit</h2>
      <dl className="divide-y divide-ink-100 rounded-lg border border-ink-100 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium text-ink-900">{v}</dd></div>
        ))}
      </dl>
      <div className="space-y-3">
        <Checkbox label={<>I accept the <Link href="/terms" target="_blank" className="underline">Terms and Conditions</Link>.</>} error={errors.acceptTerms?.message} {...register("acceptTerms")} />
        <Checkbox label={<>I consent to the processing of my data as per the <Link href="/privacy" target="_blank" className="underline">Privacy Policy</Link>.</>} error={errors.acceptPrivacy?.message} {...register("acceptPrivacy")} />
        <Checkbox label={<>I accept the <Link href="/commission-policy" target="_blank" className="underline">Commission Policy</Link>, including commission on deals with parties introduced here.</>} error={errors.acceptCommission?.message} {...register("acceptCommission")} />
      </div>
      {context.error && <p role="alert" className="text-sm text-danger">{context.error}</p>}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>Back</Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit for verification"}</Button>
      </div>
    </form>
  );
}
