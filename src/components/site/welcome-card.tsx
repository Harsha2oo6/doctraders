"use client";

import { EyeOff, Handshake, Wallet } from "lucide-react";
import Link from "next/link";
import { homeFor, useMe } from "@/lib/me";
import { Button } from "@/components/ui";

/** DESIGN.md 7.1 welcome card (right column of the home hero). Shows "Hi, name" when logged in. */
export function WelcomeCard() {
  const { me } = useMe();
  return (
    <aside className="flex flex-col rounded-lg border border-ink-100 bg-white p-5">
      {me ? (
        <>
          <p className="text-lg font-bold text-ink-900">Hi, {me.name.split(" ")[0]}</p>
          <p className="mt-1 text-sm text-ink-500">Good to see you again.</p>
          <Button asChild className="mt-4 rounded-full"><Link href={homeFor(me.roles)}>Go to dashboard</Link></Button>
        </>
      ) : (
        <>
          <p className="text-lg font-bold text-ink-900">Welcome to Doctraders</p>
          <p className="mt-1 text-sm text-ink-500">Buy and sell agro products across India.</p>
          <Button asChild className="mt-4 rounded-full"><Link href="/register">Join free</Link></Button>
          <Button asChild variant="outline" className="mt-2 rounded-full"><Link href="/login">Sign in</Link></Button>
        </>
      )}
      <ul className="mt-5 space-y-3 border-t border-ink-100 pt-5 text-sm text-ink-700">
        <li className="flex gap-2.5"><Handshake className="size-4 shrink-0 translate-y-0.5 text-info" />Doctraders handles the deal for you</li>
        <li className="flex gap-2.5"><EyeOff className="size-4 shrink-0 translate-y-0.5 text-info" />Your contact details stay private</li>
        <li className="flex gap-2.5"><Wallet className="size-4 shrink-0 translate-y-0.5 text-info" />Commission only after completion</li>
      </ul>
      <Link href="#rfq" className="mt-auto rounded-lg bg-brand-50 p-3 text-sm hover:bg-brand-100">
        <span className="block font-semibold text-ink-900">Looking for a product?</span>
        <span className="text-brand-700">Post a requirement &rarr;</span>
      </Link>
    </aside>
  );
}
