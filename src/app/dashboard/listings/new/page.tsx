"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { UNITS, type ListingKind, type Unit } from "@/lib/constants";
import { useMe } from "@/lib/me";
import { ListingForm } from "@/components/listings/listing-form";
import { Button, Card, CardBody, EmptyState, PageHeader, Spinner } from "@/components/ui";

function NewListing() {
  const { me } = useMe();
  const params = useSearchParams();
  const canSell = !!me?.roles.includes("seller");
  const canBuy = !!me?.roles.includes("buyer");
  const asked = params.get("kind") as ListingKind | null;
  const kind: ListingKind = asked === "offer" || asked === "requirement" ? asked : canSell ? "offer" : "requirement";
  const allowed = kind === "offer" ? canSell : canBuy;

  // Prefill from the home page "Post a requirement" box.
  const unit = params.get("unit");
  const qty = Number(params.get("quantity"));
  const defaults = {
    ...(params.get("title") ? { title: params.get("title")! } : {}),
    ...(qty > 0 ? { quantity: qty } : {}),
    ...(unit && (UNITS as readonly string[]).includes(unit) ? { unit: unit as Unit } : {}),
  };

  if (!me) return <Spinner />;
  if (!allowed) {
    return (
      <EmptyState
        title={kind === "offer" ? "Posting products needs the seller role" : "Posting requirements needs the buyer role"}
        action={<Button asChild><Link href="/dashboard/profile">Add the {kind === "offer" ? "seller" : "buyer"} role</Link></Button>}
      >
        You can add it from your profile in a minute.
      </EmptyState>
    );
  }

  return (
    <>
      <PageHeader
        title={kind === "offer" ? "Post a product" : "Post a requirement"}
        description={kind === "offer" ? "Sellers post what they have. Photos help buyers decide." : "Tell sellers what you need. The Doctraders team will find you a match."}
      />
      <Card>
        <CardBody className="p-6">
          <ListingForm mode="create" kind={kind} defaults={defaults} />
        </CardBody>
      </Card>
    </>
  );
}

export default function NewListingPage() {
  return <Suspense fallback={<Spinner />}><NewListing /></Suspense>;
}
