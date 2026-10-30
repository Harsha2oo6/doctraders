"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api-client";
import { useMe, type Me } from "@/lib/me";
import { PasswordCard } from "@/components/password-card";
import { Button, Card, CardBody, CardHeader, CardTitle, Field, FormError, Input, PageHeader, Spinner, useToast } from "@/components/ui";

export default function AdminAccountPage() {
  const { me } = useMe();
  if (!me) return <Spinner />;
  return (
    <>
      <PageHeader title="Account" description="Your own admin login." />
      <div className="space-y-4">
        <DetailsCard me={me} />
        <PasswordCard />
      </div>
    </>
  );
}

function DetailsCard({ me }: { me: Me }) {
  const { setMe } = useMe();
  const toast = useToast();
  const [name, setName] = useState(me.name);
  const [mobile, setMobile] = useState(me.mobile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    setErrors({});
    setBusy(true);
    try {
      setMe(await apiFetch<Me>("/auth/me", { method: "PATCH", body: { name, mobile } }));
      toast("Account saved.");
    } catch (err) {
      if (err instanceof ApiError) { setErrors(err.fields); setError(err.message); } else setError("Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
      <CardBody>
        <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="Full name" required error={errors.name}><Input value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" /></Field>
          <Field label="Mobile number" required error={errors.mobile}><Input type="tel" inputMode="numeric" value={mobile} onChange={(ev) => setMobile(ev.target.value)} /></Field>
          <Field label="Email" hint="This is the email you log in with." className="sm:col-span-2"><Input value={me.email} disabled /></Field>
          <div className="sm:col-span-2"><FormError>{error}</FormError></div>
          <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save changes"}</Button></div>
        </form>
      </CardBody>
    </Card>
  );
}
