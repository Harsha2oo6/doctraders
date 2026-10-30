"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { accountStepSchema, type AccountStep } from "@doctraders/schemas";
import { Button, Field, Input } from "@doctraders/ui";

export function AccountStepForm({ defaults, onNext }: { defaults?: AccountStep; onNext: (v: AccountStep) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<AccountStep>({
    resolver: zodResolver(accountStepSchema),
    defaultValues: defaults,
  });
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4" noValidate>
      <h2 className="text-xl font-semibold text-ink-900">Your account</h2>
      <Field label="Contact person" error={errors.contactName?.message}><Input autoComplete="name" {...register("contactName")} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
        <Field label="Phone" error={errors.phone?.message}><Input type="tel" autoComplete="tel" {...register("phone")} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register("password")} /></Field>
        <Field label="Confirm password" error={errors.confirmPassword?.message}><Input type="password" autoComplete="new-password" {...register("confirmPassword")} /></Field>
      </div>
      <div className="flex justify-end"><Button type="submit">Continue</Button></div>
    </form>
  );
}
