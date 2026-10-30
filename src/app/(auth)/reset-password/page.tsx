"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { passwordField } from "@/lib/validation";
import { Button, Card, CardBody, Field, FormError, Input, Spinner } from "@/components/ui";

const schema = z
  .object({ password: passwordField, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });
type Values = z.infer<typeof schema>;

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setError(undefined);
    try {
      await apiFetch("/auth/reset-password", { body: { token, password: values.password } });
      setDone(true);
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  if (done) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <h2 className="text-2xl font-semibold text-ink-900">Password changed</h2>
          <p className="text-ink-600">You can now log in with your new password.</p>
          <Button asChild><Link href="/login">Log in</Link></Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="p-6">
        {!token ? (
          <p role="alert" className="text-sm text-danger">This reset link is incomplete. <Link href="/forgot-password" className="font-semibold underline">Ask for a new one</Link>.</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Field label="New password" hint="At least 8 characters" error={errors.password?.message}><Input type="password" autoComplete="new-password" {...register("password")} /></Field>
            <Field label="Repeat new password" error={errors.confirm?.message}><Input type="password" autoComplete="new-password" {...register("confirm")} /></Field>
            <FormError>{error}</FormError>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save new password"}</Button>
            <p className="text-center text-sm"><Link href="/forgot-password" className="font-semibold text-ink-900 underline">Link expired? Ask for a new one</Link></p>
          </form>
        )}
      </CardBody>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-3xl font-semibold text-ink-900">Choose a new password</h1>
      <p className="mb-6 text-sm text-ink-600">Pick a password you have not used here before.</p>
      <Suspense fallback={<Spinner />}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
