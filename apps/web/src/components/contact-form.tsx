"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@doctraders/api-client";
import { MockProvider } from "@doctraders/mock";
import { contactSchema, type ContactInput } from "@doctraders/schemas";
import { Button, Field, Input, Textarea } from "@doctraders/ui";

function Form() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  if (sent) return <p className="rounded-lg bg-green-50 p-4 text-success">Thank you. We will reply by email shortly.</p>;

  return (
    <form onSubmit={handleSubmit(async (v) => { await api.post("/api/contact", v); setSent(true); })} className="space-y-4" noValidate>
      <Field label="Your name" error={errors.name?.message}><Input {...register("name")} /></Field>
      <Field label="Email" error={errors.email?.message}><Input type="email" {...register("email")} /></Field>
      <Field label="Message" error={errors.message?.message}><Textarea {...register("message")} /></Field>
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send message"}</Button>
    </form>
  );
}

export function ContactForm() {
  return <MockProvider><Form /></MockProvider>;
}
