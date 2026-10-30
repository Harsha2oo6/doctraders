"use client";

import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ApiError, apiFetch, apiList, useApi } from "@/lib/api-client";
import type { ListingKind } from "@/lib/constants";
import { formatDate, formatPrice, formatQty } from "@/lib/format";
import { useMe } from "@/lib/me";
import type { PublicListing } from "@/lib/types";
import { Button, Card, CardBody, ConfirmDialog, EmptyState, ErrorState, PageHeader, Pager, Spinner, StatusBadge, Tabs, useToast } from "@/components/ui";

const LIMIT = 20;

function MyListings() {
  const { me } = useMe();
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const kinds: ListingKind[] = [...(me?.roles.includes("seller") ? ["offer" as const] : []), ...(me?.roles.includes("buyer") ? ["requirement" as const] : [])];
  const tabParam = params.get("tab") as ListingKind | null;
  const tab: ListingKind = tabParam && kinds.includes(tabParam) ? tabParam : kinds[0] ?? "offer";
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string>();
  const [toDelete, setToDelete] = useState<PublicListing>();

  const list = useApi(() => apiList<PublicListing>("/me/listings", { query: { kind: tab, page, limit: LIMIT } }), [tab, page]);

  async function setStatus(l: PublicListing, status: "active" | "closed") {
    setBusy(l.id);
    try {
      await apiFetch(`/listings/${l.id}`, { method: "PATCH", body: { status } });
      toast(status === "closed" ? "Listing closed. It is no longer shown to others." : "Listing is live again.");
      list.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not update the listing.", "error");
    } finally {
      setBusy(undefined);
    }
  }

  async function remove() {
    if (!toDelete) return;
    setBusy(toDelete.id);
    try {
      const r = await apiFetch<{ deleted: boolean; closed: boolean }>(`/listings/${toDelete.id}`, { method: "DELETE" });
      toast(r.deleted ? "Listing deleted." : "This listing already has enquiries, so it was closed instead of deleted.");
      setToDelete(undefined);
      list.refetch();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not delete the listing.", "error");
    } finally {
      setBusy(undefined);
    }
  }

  const newHref = `/dashboard/listings/new?kind=${tab}`;

  return (
    <>
      <PageHeader
        title={tab === "offer" ? "My products" : "My requirements"}
        description="Everything you have posted. Live listings are visible to everyone; your name and contacts stay hidden."
        actions={<Button asChild><Link href={newHref}><Plus className="size-4" />{tab === "offer" ? "Post a product" : "Post a requirement"}</Link></Button>}
      />
      {kinds.length > 1 && (
        <Tabs
          active={tab}
          onChange={(k) => { setPage(1); router.replace(`/dashboard/listings?tab=${k}`); }}
          tabs={[{ key: "offer", label: "My products" }, { key: "requirement", label: "My requirements" }]}
        />
      )}

      {list.loading && !list.data ? (
        <Spinner />
      ) : list.error ? (
        <ErrorState message={list.error.message} onRetry={list.refetch} />
      ) : !list.data?.data.length ? (
        <EmptyState
          title={tab === "offer" ? "No products yet" : "No requirements yet"}
          action={<Button asChild><Link href={newHref}>{tab === "offer" ? "Post a product" : "Post a requirement"}</Link></Button>}
        >
          {tab === "offer" ? "Post what you sell with photos. It goes live straight away." : "Tell sellers what you need. It goes live straight away."}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {list.data.data.map((l) => (
            <Card key={l.id}>
              <CardBody className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  {l.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small thumbnail
                    <img src={l.images[0]} alt="" className="size-16 shrink-0 rounded-md border border-ink-100 object-cover" />
                  ) : (
                    <span className="grid size-16 shrink-0 place-items-center rounded-md border border-ink-100 bg-ink-50"><Package className="size-6 text-ink-300" /></span>
                  )}
                  <div className="min-w-0">
                    <Link href={l.status === "active" ? `/listings/${l.id}` : `/dashboard/listings/${l.id}/edit`} className="font-semibold text-ink-900 hover:text-brand-600">{l.title}</Link>
                    <p className="text-sm text-ink-500">{formatQty(l.quantity, l.unit)} · {formatPrice(l.price, l.unit)} · {formatDate(l.createdAt)}</p>
                    {l.status === "blocked" && <p className="mt-2 text-sm text-danger">Blocked by Doctraders. Contact support if you think this is a mistake.</p>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge domain="listing" status={l.status} />
                  <Button asChild size="sm" variant="outline"><Link href={`/dashboard/listings/${l.id}/edit`}><Pencil className="size-4" />Edit</Link></Button>
                  {l.status === "active" && <Button size="sm" variant="outline" disabled={busy === l.id} onClick={() => setStatus(l, "closed")}>Close</Button>}
                  {l.status === "closed" && <Button size="sm" variant="outline" disabled={busy === l.id} onClick={() => setStatus(l, "active")}>Reopen</Button>}
                  <Button size="sm" variant="ghost" disabled={busy === l.id} onClick={() => setToDelete(l)} aria-label="Delete"><Trash2 className="size-4" /></Button>
                </div>
              </CardBody>
            </Card>
          ))}
          {list.data.total > LIMIT && <Pager page={page} limit={LIMIT} total={list.data.total} onPage={setPage} />}
        </div>
      )}

      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(undefined)} onConfirm={remove} busy={!!busy} title="Delete this listing?" confirmLabel="Delete">
        &ldquo;{toDelete?.title}&rdquo; will be removed. If someone already showed interest, it is closed instead so the Doctraders team keeps the history.
      </ConfirmDialog>
    </>
  );
}

export default function MyListingsPage() {
  return <Suspense fallback={<Spinner />}><MyListings /></Suspense>;
}
