"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Button, Card, CardBody, Field, Input } from "@/components/ui";

// TEMPORARY (Prompt 1): the form validates but does not sign in yet. Prompt 3 connects it to /api/v1/auth/login.
export function LoginForm() {
  const [error, setError] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  return (
    <Card>
      <CardBody className="p-6">
        <form onSubmit={handleSubmit(() => setError("Sign in is not connected yet."))} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
          <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" {...register("password")} /></Field>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Log in"}</Button>
          <p className="text-center text-sm"><Link href="/register" className="font-semibold text-ink-900 underline">Register free</Link></p>
        </form>
      </CardBody>
    </Card>
  );
}
