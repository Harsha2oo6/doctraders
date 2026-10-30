"use client";

import { ArrowLeft, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { ApiError, apiFetch, useApi } from "@/lib/api-client";
import { BUSINESS_TYPE_LABELS, type BusinessType } from "@/lib/constants";
import { formatDate, formatDateTime, formatINR, formatPrice, formatQty } from "@/lib/format";
import type { Me } from "@/lib/me";
import { useMeta } from "@/lib/meta";
import type { AdminDeal, AdminEnquiry, AdminListing } from "@/lib/types";
import { Button, Card, CardBody, CardHeader, CardTitle, ConfirmDialog, ErrorState, PageHeader, Spinner, StatusBadge, Tabs, useToast } from "@/components/ui";

/** Shape of GET /api/v1/admin/users/:id. */
type Detail = {
  user: Me;
  listings: AdminListing[];
  enquiries: AdminEnquiry[];
  deals: AdminDeal[];
  totals: { listings: number; enquiries: number; deals: number };
};

export default function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const toast = useToast();
  const { meta } = useMeta();
  const q = useApi(() => apiFetch<Detail>(`/admin/users/${id}`), [id]);
  const [tab, setTab] = useState("listings");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  if (q.loading && !q.data) return <Spinner />;
  if (q.error || !q.data) return <ErrorState message={q.error?.message} onRetry={q.refetch} />;
  const { user: u, listings, enquiries, deals, totals } = q.data;
  const b = u.business;
  const blocked = u.status === "blocked";

  async function toggle() {
    setBusy(true);
    try {
      await apiFetch(`/admin/users/${id}`, { method: "PATCH", body: { status: blocked ? "active" : "blocked" } });
      toast(blocked ? "User unblocked." : "User blocked.");
      setConfirm(false);
      q.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update the user.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/admin/users" className="mb-3 inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900"><ArrowLeft className="size-4" />Users</Link>
      <PageHeader
        title={u.name}
        description={`${b?.name ?? ""} · joined ${formatDate(u.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {u.roles.map((r) => <StatusBadge key={r} domain="role" status={r} />)}
            <StatusBadge domain="account" status={u.status} />
            <Button variant="outline" onClick={() => setConfirm(true)}>{blocked ? "Unblock" : "Block"}</Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-4">
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { key: "listings", label: "Listings", count: totals.listings },
              { key: "enquiries", label: "Enquiries", count: totals.enquiries },
              { key: "deals", label: "Deals", count: totals.deals },
            ]}
          />
          <Card>
            <CardBody className="divide-y divide-ink-100 p-0">
              {tab === "listings" && (listings.length === 0 ? <Empty text="No listings." /> : listings.map((l) => (
                <Link key={l.id} href={`/listings/${l.id}`} target="_blank" className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900">{l.title}</span>
                    <span className="block text-ink-500">{formatQty(l.quantity, l.unit)} · {formatPrice(l.price, l.unit)} · {l.enquiryCount} {l.enquiryCount === 1 ? "enquiry" : "enquiries"}</span>
                  </span>
                  <StatusBadge domain="listing" status={l.status} />
                </Link>
              )))}
              {tab === "enquiries" && (enquiries.length === 0 ? <Empty text="No enquiries." /> : enquiries.map((e) => (
                <Link key={e.id} href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900">{e.listingTitle}</span>
                    <span className="block text-ink-500">{e.fromUserId === u.id ? "Sent interest" : "On their listing"} · Qty {e.quantity.toLocaleString("en-IN")} · {formatDate(e.createdAt)}</span>
                  </span>
                  <StatusBadge domain="enquiry" status={e.status} />
                </Link>
              )))}
              {tab === "deals" && (deals.length === 0 ? <Empty text="No deals." /> : deals.map((d) => (
                <Link key={d.id} href={`/admin/deals/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-ink-50">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink-900">{d.title}</span>
                    <span className="block text-ink-500">{d.code} · as {d.buyerId === u.id ? "buyer" : "seller"} · {formatINR(d.totalValue)}</span>
                  </span>
                  <StatusBadge domain="deal" status={d.status} />
                </Link>
              )))}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="h-fit">
            <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
            <CardBody>
              <dl className="grid gap-3 text-sm">
                <Item k="Mobile" v={u.mobile} />
                <Item k="Email" v={u.email} />
                <Item k="Last login" v={u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"} />
                <Item k="Public alias code" v={u.publicCode ?? "—"} />
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline"><a href={`tel:+91${u.mobile}`}><Phone className="size-4" />Call</a></Button>
                <Button asChild size="sm" variant="outline"><a href={`https://wa.me/91${u.mobile}`} target="_blank" rel="noreferrer"><MessageCircle className="size-4" />WhatsApp</a></Button>
                <Button asChild size="sm" variant="outline"><a href={`mailto:${u.email}`}><Mail className="size-4" />Email</a></Button>
              </div>
            </CardBody>
          </Card>
          <Card className="h-fit">
            <CardHeader><CardTitle>Business</CardTitle></CardHeader>
            <CardBody>
              <dl className="grid gap-3 text-sm">
                <Item k="Name" v={b?.name ?? "—"} />
                <Item k="Type" v={b?.type ? BUSINESS_TYPE_LABELS[b.type as BusinessType] ?? b.type : "—"} />
                <Item k="Categories" v={b?.categories.map((slug) => meta?.categories.find((c) => c.slug === slug)?.name ?? slug).join(", ") || "—"} />
                <Item k="Address" v={[b?.address, b?.pincode].filter(Boolean).join(" – ") || "—"} />
                <Item k="City / State" v={[b?.city, b?.state].filter(Boolean).join(", ") || "—"} />
                <Item k="GST" v={b?.gstNumber ?? "—"} />
                <Item k="Years in business" v={b?.yearsInBusiness != null ? String(b.yearsInBusiness) : "—"} />
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={toggle}
        busy={busy}
        tone={blocked ? "primary" : "danger"}
        confirmLabel={blocked ? "Unblock" : "Block"}
        title={blocked ? `Unblock ${u.name}?` : `Block ${u.name}?`}
      >
        {blocked ? "They can log in again and their live listings come back." : "They are logged out on their next request and their listings disappear from the site."}
      </ConfirmDialog>
    </>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-ink-500">{k}</dt><dd className="break-words font-medium text-ink-900">{v}</dd></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="p-5 text-sm text-ink-500">{text}</p>;
}
