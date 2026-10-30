"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginInput } from "@doctraders/schemas";
import { Button, Card, CardBody, Field, Input, Logo } from "@doctraders/ui";
import { useSession } from "@/lib/session";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, isLoggedIn, hydrated, error } = useSession();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (hydrated && isLoggedIn) router.replace("/");
  }, [hydrated, isLoggedIn, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-ink-900 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center"><Logo dark /><p className="mt-1 text-sm text-ink-300">Admin panel</p></div>
        <Card>
          <CardBody className="p-6">
            <form onSubmit={handleSubmit(login)} className="space-y-4" noValidate>
              <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
              <Field label="Password" error={errors.password?.message}><Input type="password" {...register("password")} /></Field>
              {error && <p role="alert" className="text-sm text-danger">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>{isLoggingIn ? "Signing in…" : "Log in"}</Button>
              <p className="text-xs text-ink-500">Mock mode: any email and password works.</p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
