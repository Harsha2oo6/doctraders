"use client";

import Link from "next/link";
import { useMe } from "@/lib/me";
import type { PublicListing } from "@/lib/types";
import { Button } from "@/components/ui";

/** "I'm interested" on the listing detail page. Logged out → login and come back. */
export function InterestButton({ listing }: { listing: PublicListing }) {
  const { me, loading } = useMe();
  if (loading) return <Button size="lg" className="w-full rounded-full" disabled>I&apos;m interested</Button>;
  if (!me) {
    return <Button asChild size="lg" className="w-full rounded-full"><Link href={`/login?next=/listings/${listing.id}`}>I&apos;m interested</Link></Button>;
  }
  return <Button size="lg" className="w-full rounded-full" disabled title="Available soon">I&apos;m interested</Button>;
}
