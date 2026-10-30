"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError, apiFetch } from "@/lib/api-client";
import { contactSchema, type ContactInput } from "@/lib/validation";
import { Button, Field, Input, Textarea } from "@/components/ui";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(v: ContactInput) {
    setError(undefined);
    try {
      await apiFetch("/contact", { body: v });
      setSent(true);
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError("Something went wrong", 0);
      for (const [k, m] of Object.entries(err.fields)) setFieldError(k as keyof ContactInput, { message: m });
      setError(err.message);
    }
  }

  if (sent) return <p className="rounded-lg bg-green-50 p-4 text-success">Thank you. We will reply by email shortly.</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Field label="Your name" error={errors.name?.message}><Input {...register("name")} /></Field>
      <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
      <Field label="Message" error={errors.message?.message}><Textarea {...register("message")} /></Field>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
