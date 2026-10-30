import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { Spinner } from "@/components/ui";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 text-3xl font-semibold text-ink-900">Welcome back</h1>
      <p className="mb-6 text-sm text-ink-600">Log in to your Doctraders account. Buyers, sellers and the Doctraders team all sign in here.</p>
      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
