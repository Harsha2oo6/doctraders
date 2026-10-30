"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, ShoppingCart, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { apiFetch } from "@/lib/api-client";
import { applyApiError } from "@/lib/form-errors";
import { useMe, type Me } from "@/lib/me";
import { useMeta } from "@/lib/meta";
import { registerFormSchema, type RegisterFormInput, type RegisterFormValues } from "@/lib/validation";
import { BusinessFields } from "@/components/business-fields";
import { Button, Card, CardBody, Checkbox, ChoiceCards, Field, FormError, Input } from "@/components/ui";

type Choice = "sell" | "buy" | "both";
const ROLES_FOR: Record<Choice, ("buyer" | "seller")[]> = { sell: ["seller"], buy: ["buyer"], both: ["buyer", "seller"] };

export function RegisterForm() {
  const router = useRouter();
  const { setMe } = useMe();
  const { meta } = useMeta();
  const [choice, setChoice] = useState<Choice>();
  const [error, setError] = useState<string>();
  const { register, handleSubmit, setValue, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerFormSchema) as unknown as Resolver<RegisterFormInput, unknown, RegisterFormValues>,
    defaultValues: { roles: [], business: { categories: [] } },
  });

  const seller = choice === "sell" || choice === "both";

  async function onSubmit(values: RegisterFormValues) {
    setError(undefined);
    const { acceptTerms: _t, acceptPrivacy: _p, acceptCommission: _c, ...body } = values;
    try {
      const { user } = await apiFetch<{ user: Me; token: string }>("/auth/register", { body });
      setMe(user);
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      setError(applyApiError(e, setFieldError));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div>
        <ChoiceCards<Choice>
          name="role"
          value={choice}
          onChange={(c) => {
            setChoice(c);
            setValue("roles", ROLES_FOR[c], { shouldValidate: !!errors.roles });
          }}
          options={[
            { value: "sell", title: "I want to sell", hint: "Post your products as offers", icon: Store },
            { value: "buy", title: "I want to buy", hint: "Post what you need as requirements", icon: ShoppingCart },
            { value: "both", title: "Both", hint: "Buy and sell from one account", icon: ArrowLeftRight },
          ]}
        />
        {errors.roles && <p role="alert" className="mt-2 text-xs text-danger">{errors.roles.message}</p>}
      </div>

      <Card>
        <CardBody className="space-y-8 p-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900">Your details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required error={errors.name?.message} className="sm:col-span-2"><Input autoComplete="name" {...register("name")} /></Field>
              <Field label="Mobile number" required hint="10-digit Indian mobile" error={errors.mobile?.message}><Input type="tel" inputMode="numeric" autoComplete="tel-national" {...register("mobile")} /></Field>
              <Field label="Email" required error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
              <Field label="Password" required hint="At least 8 characters" error={errors.password?.message} className="sm:col-span-2"><Input type="password" autoComplete="new-password" {...register("password")} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-ink-900">Your business</h2>
            {!choice && <p className="text-sm text-ink-500">Choose sell, buy or both above to see which details are required.</p>}
            <BusinessFields register={register} errors={errors} seller={seller} categories={meta?.categories} />
          </section>

          <section className="space-y-3 border-t border-ink-100 pt-6">
            <Checkbox label={<>I accept the <Link href="/terms" target="_blank" className="font-semibold underline">Terms &amp; Conditions</Link>.</>} error={errors.acceptTerms?.message} {...register("acceptTerms")} />
            <Checkbox label={<>I agree to the <Link href="/privacy" target="_blank" className="font-semibold underline">Privacy Policy</Link> and to Doctraders contacting me about my listings.</>} error={errors.acceptPrivacy?.message} {...register("acceptPrivacy")} />
            <Checkbox label={<>I accept the <Link href="/commission-policy" target="_blank" className="font-semibold underline">Commission Policy</Link> (commission is due only after a deal is completed).</>} error={errors.acceptCommission?.message} {...register("acceptCommission")} />
          </section>

          <FormError>{error}</FormError>
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create free account"}</Button>
          </div>
        </CardBody>
      </Card>
      <p className="text-center text-sm text-ink-600">Already registered? <Link href="/login" className="font-semibold text-ink-900 underline">Log in</Link></p>
    </form>
  );
}
