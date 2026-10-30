"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation";
import { Button, Card, CardBody, Field, FormError, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setError(undefined);
    try {
      await apiFetch("/auth/forgot-password", { body: values });
      setSent(true);
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-3xl font-semibold text-ink-900">Forgot password</h1>
      <p className="mb-6 text-sm text-ink-600">Enter the email you registered with. We will send you a link to choose a new password.</p>
      {sent ? (
        <Card>
          <CardBody className="space-y-3 p-8 text-center">
            <MailCheck className="mx-auto size-12 text-success" />
            <h2 className="text-2xl font-semibold text-ink-900">Check your email</h2>
            <p className="text-ink-600">If an account exists for that email, a reset link is on its way. The link works for 1 hour.</p>
            <Button asChild variant="outline"><Link href="/login">Back to login</Link></Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
              <FormError>{error}</FormError>
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send reset link"}</Button>
              <p className="text-center text-sm"><Link href="/login" className="font-semibold text-ink-900 underline">Back to login</Link></p>
            </form>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
