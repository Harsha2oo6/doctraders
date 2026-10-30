import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui";

export const metadata: Metadata = { title: "Register Free" };

// TEMPORARY (Prompt 1): the old 4-step KYC wizard was removed. Prompt 3 adds the one-page form.
export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-3xl font-semibold text-ink-900">Register free</h1>
      <p className="mb-6 text-sm text-ink-600">No joining fee. For direct buyers and sellers.</p>
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <p className="text-ink-600">Registration opens shortly.</p>
        </CardBody>
      </Card>
      <p className="mt-6 text-center text-sm text-ink-600">Already registered? <Link href="/login" className="font-semibold text-ink-900 underline">Log in</Link></p>
    </>
  );
}
