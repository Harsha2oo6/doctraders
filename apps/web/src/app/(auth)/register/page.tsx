import type { Metadata } from "next";
import { RegisterWizard } from "@/components/register/register-wizard";

export const metadata: Metadata = { title: "Register Free" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-3xl font-semibold text-ink-900">Register free</h1>
      <p className="mb-6 text-sm text-ink-600">No joining fee. For direct buyers, sellers and logistics providers only. Brokers and agents are not allowed.</p>
      <RegisterWizard />
    </>
  );
}
