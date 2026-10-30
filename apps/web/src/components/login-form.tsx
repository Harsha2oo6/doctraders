"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@doctraders/schemas";
import { Button, Card, CardBody, Field, Input } from "@doctraders/ui";
import { useSession } from "@/lib/session";

export function LoginForm() {
  const router = useRouter();
  const { login, isLoggingIn, isLoggedIn, error, hydrated } = useSession();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (hydrated && isLoggedIn) router.replace("/dashboard");
  }, [hydrated, isLoggedIn, router]);

  return (
    <Card>
      <CardBody className="p-6">
        <form onSubmit={handleSubmit(login)} className="space-y-4" noValidate>
          <Field label="Email" error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
          <Field label="Password" error={errors.password?.message}><Input type="password" autoComplete="current-password" {...register("password")} /></Field>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoggingIn}>{isLoggingIn ? "Signing in…" : "Log in"}</Button>
          <p className="text-center text-sm"><Link href="/register" className="font-semibold text-ink-900 underline">Register free</Link></p>
        </form>
        <p className="mt-6 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
          Demo (mock) logins: any password works. <code>pending@x.com</code> shows a pending account, <code>rejected@x.com</code> a rejected one, anything else is approved.
        </p>
      </CardBody>
    </Card>
  );
}
