"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validation";
import { Button, Card, CardBody, CardHeader, CardTitle, Field, FormError, Input, useToast } from "@/components/ui";

/** "Change password" card, used on the buyer/seller profile and the admin account page. */
export function PasswordCard() {
  const toast = useToast();
  const [error, setError] = useState<string>();
  const { register, handleSubmit, reset, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(v: ChangePasswordInput) {
    setError(undefined);
    try {
      await apiFetch("/auth/change-password", { body: v });
      reset({ currentPassword: "", newPassword: "" });
      toast("Password changed.");
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Current password" error={errors.currentPassword?.message}><Input type="password" autoComplete="current-password" {...register("currentPassword")} /></Field>
          <Field label="New password" hint="At least 8 characters" error={errors.newPassword?.message}><Input type="password" autoComplete="new-password" {...register("newPassword")} /></Field>
          <div className="sm:col-span-2"><FormError>{error}</FormError></div>
          <div className="flex justify-end sm:col-span-2"><Button type="submit" variant="outline" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Change password"}</Button></div>
        </form>
      </CardBody>
    </Card>
  );
}
