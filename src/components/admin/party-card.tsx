import { Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { BUSINESS_TYPE_LABELS, type BusinessType } from "@/lib/constants";
import type { ContactCard } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, CardTitle, StatusBadge } from "@/components/ui";

/** DESIGN.md 6.5 party card (ADMIN ONLY): full contact details + Call / WhatsApp / Email. */
export function PartyCard({ role, party, note }: { role: "buyer" | "seller"; party: ContactCard | null; note?: string }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{role === "buyer" ? "Buyer" : "Seller"}</CardTitle>
        <span className="flex items-center gap-1">
          {note && <span className="text-xs text-ink-500">{note}</span>}
          <StatusBadge domain="role" status={role} />
          {party?.status === "blocked" && <StatusBadge domain="account" status="blocked" />}
        </span>
      </CardHeader>
      <CardBody>
        {!party ? (
          <p className="text-sm text-ink-500">This account no longer exists.</p>
        ) : (
          <>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-500">Name</dt><dd className="font-medium text-ink-900"><Link href={`/admin/users/${party.id}`} className="hover:text-brand-600">{party.name}</Link></dd></div>
              <div><dt className="text-ink-500">Business</dt><dd className="font-medium text-ink-900">{party.businessName ?? "—"}{party.businessType ? ` · ${BUSINESS_TYPE_LABELS[party.businessType as BusinessType] ?? party.businessType}` : ""}</dd></div>
              <div><dt className="text-ink-500">Mobile</dt><dd className="font-medium text-ink-900">{party.mobile}</dd></div>
              <div><dt className="text-ink-500">Email</dt><dd className="break-all font-medium text-ink-900">{party.email}</dd></div>
              <div><dt className="text-ink-500">City / State</dt><dd className="font-medium text-ink-900">{[party.city, party.state].filter(Boolean).join(", ") || "—"}</dd></div>
              <div><dt className="text-ink-500">GST</dt><dd className="font-medium text-ink-900">{party.gstNumber ?? "—"}</dd></div>
              {party.address && <div className="sm:col-span-2"><dt className="text-ink-500">Address</dt><dd className="font-medium text-ink-900">{party.address}{party.pincode ? ` – ${party.pincode}` : ""}</dd></div>}
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline"><a href={`tel:+91${party.mobile}`}><Phone className="size-4" />Call</a></Button>
              <Button asChild size="sm" variant="outline"><a href={`https://wa.me/91${party.mobile}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a></Button>
              <Button asChild size="sm" variant="outline"><a href={`mailto:${party.email}`}><Mail className="size-4" />Email</a></Button>
            </div>
          </>
        )}
      </CardBody>
    </Card>
  );
}
