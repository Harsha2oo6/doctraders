import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = { title: "Register Free" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-3xl font-semibold text-ink-900">Register free</h1>
      <p className="mb-6 text-sm text-ink-600">No joining fee. Your account is active as soon as you register. Commission is charged only after a deal is completed.</p>
      <RegisterForm />
    </>
  );
}
