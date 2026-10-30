import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { SessionProvider } from "@/lib/session";

export const metadata: Metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <SessionProvider>
      <div className="mx-auto max-w-md">
        <h1 className="mb-1 text-3xl font-semibold text-ink-900">Welcome back</h1>
        <p className="mb-6 text-sm text-ink-600">Log in to your Doctraders account.</p>
        <LoginForm />
      </div>
    </SessionProvider>
  );
}
