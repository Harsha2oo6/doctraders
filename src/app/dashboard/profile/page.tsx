"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart, Store } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { useMe, type Me } from "@/lib/me";
import { useMeta } from "@/lib/meta";
import {
  businessSchema, checkSellerBusiness, emailField, mobileField,
  type BusinessInput,
} from "@/lib/validation";
import { BusinessFields } from "@/components/business-fields";
import { PasswordCard } from "@/components/password-card";
import { Button, Card, CardBody, CardHeader, CardTitle, Field, FormError, Input, PageHeader, Spinner, StatusBadge, useToast } from "@/components/ui";

const profileSchema = (seller: { current: boolean }) =>
  z
    .object({ name: z.string().trim().min(2, "Enter your full name"), email: emailField, mobile: mobileField, business: businessSchema })
    .superRefine((v, ctx) => {
      if (seller.current) checkSellerBusiness(v.business, ctx);
    });
type ProfileInput = { name: string; email: string; mobile: string; business: BusinessInput };
type ProfileValues = z.output<ReturnType<typeof profileSchema>>;

export default function ProfilePage() {
  const { me } = useMe();
  if (!me) return <Spinner />;
  return (
    <>
      <PageHeader title="Profile" description="Your contact details stay private. Only the Doctraders team can see them." />
      <div className="space-y-4">
        <ProfileForm me={me} />
        <PasswordCard />
      </div>
    </>
  );
}

function ProfileForm({ me }: { me: Me }) {
  const { setMe } = useMe();
  const toast = useToast();
  const { meta } = useMeta();
  const [addRole, setAddRole] = useState<"buyer" | "seller">();
  const [error, setError] = useState<string>();
  const isSeller = me.roles.includes("seller") || addRole === "seller";
  const sellerRef = useRef(isSeller);
  sellerRef.current = isSeller;
  const [schema] = useState(() => profileSchema(sellerRef));
  const missing = (["seller", "buyer"] as const).filter((r) => !me.roles.includes(r));

  const defaultValues = useMemo<ProfileInput>(
    () => ({
      name: me.name,
      email: me.email,
      mobile: me.mobile,
      business: {
        name: me.business?.name ?? "",
        type: (me.business?.type ?? "") as BusinessInput["type"],
        categories: me.business?.categories ?? [],
        address: me.business?.address ?? "",
        city: me.business?.city ?? "",
        state: (me.business?.state ?? "") as BusinessInput["state"],
        pincode: me.business?.pincode ?? "",
        gstNumber: me.business?.gstNumber ?? "",
        yearsInBusiness: me.business?.yearsInBusiness ?? "",
      },
    }),
    [me],
  );

  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ProfileInput, unknown, ProfileValues>({
    resolver: zodResolver(schema) as unknown as Resolver<ProfileInput, unknown, ProfileValues>,
    defaultValues,
  });

  async function onSubmit(v: ProfileValues) {
    setError(undefined);
    try {
      const updated = await apiFetch<Me>("/auth/me", { method: "PATCH", body: { ...v, ...(addRole ? { addRole } : {}) } });
      setMe(updated);
      setAddRole(undefined);
      toast(addRole ? `You are now also a ${addRole}.` : "Profile saved.");
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Card>
        <CardHeader><CardTitle>Your details</CardTitle></CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" required error={errors.name?.message} className="sm:col-span-2"><Input autoComplete="name" {...register("name")} /></Field>
          <Field label="Mobile number" required error={errors.mobile?.message}><Input type="tel" inputMode="numeric" {...register("mobile")} /></Field>
          <Field label="Email" required error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Roles</CardTitle>
          <span className="flex gap-1">{me.roles.map((r) => <StatusBadge key={r} domain="role" status={r} />)}</span>
        </CardHeader>
        <CardBody className="space-y-3">
          {missing.length === 0 ? (
            <p className="text-sm text-ink-600">You can both buy and sell from this account.</p>
          ) : (
            missing.map((r) => {
              const Icon = r === "seller" ? Store : ShoppingCart;
              const on = addRole === r;
              return (
                <div key={r} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-100 p-4">
                  <span className="flex items-start gap-3">
                    <Icon className="mt-0.5 size-5 text-brand-600" />
                    <span>
                      <span className="block font-semibold text-ink-900">Also register as {r}</span>
                      <span className="block text-xs text-ink-500">{r === "seller" ? "Post your products as offers. Business type, categories, address and pincode become required below." : "Post requirements for what you need to buy."}</span>
                    </span>
                  </span>
                  <Button type="button" size="sm" variant={on ? "secondary" : "outline"} onClick={() => setAddRole(on ? undefined : r)}>{on ? "Selected" : `Add ${r} role`}</Button>
                </div>
              );
            })
          )}
          {addRole && <p className="text-xs text-ink-500">Click &ldquo;Save changes&rdquo; to add the {addRole} role.</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your business</CardTitle></CardHeader>
        <CardBody>
          <BusinessFields register={register} errors={errors} seller={isSeller} categories={meta?.categories} />
        </CardBody>
      </Card>

      <FormError>{error}</FormError>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}
