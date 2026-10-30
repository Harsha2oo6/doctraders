"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { homeFor, isAdminRole, useMe, type Me } from "@/lib/me";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Button, Card, CardBody, Field, FormError, Input } from "@/components/ui";

/** Only follow ?next= to our own pages, and only into the area this account can open. */
function safeNext(next: string | null, roles: readonly string[]) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return homeFor(roles);
  if (next.startsWith("/admin") && !isAdminRole(roles)) return homeFor(roles);
  if (next.startsWith("/dashboard") && isAdminRole(roles)) return homeFor(roles);
  return next;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { me, setMe } = useMe();
  const [error, setError] = useState<string>();
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  // Already signed in → go straight to the right area.
  useEffect(() => {
    if (me) router.replace(safeNext(params.get("next"), me.roles));
  }, [me, params, router]);

  async function onSubmit(values: LoginInput) {
    setError(undefined);
    try {
      const { user } = await apiFetch<{ user: Me; token: string }>("/auth/login", { body: values });
      setMe(user);
      router.replace(safeNext(params.get("next"), user.roles));
      router.refresh();
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <Card>
      <CardBody className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Email or mobile number" error={errors.identifier?.message}>
            <Input autoComplete="username" placeholder="you@business.com or 98765 43210" {...register("identifier")} />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...register("password")} />
          </Field>
          <FormError>{error}</FormError>
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Log in"}</Button>
          <p className="text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-ink-900 underline">Forgot password?</Link>
            <span className="mx-2 text-ink-300">·</span>
            <Link href="/register" className="font-semibold text-ink-900 underline">Register free</Link>
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
