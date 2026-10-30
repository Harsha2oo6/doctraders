"use client";

import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import * as sample from "@/lib/sample-data";
import { DEFAULT_CATEGORIES as CATEGORIES } from "@/lib/constants";
import { Badge, Button, Card, CardBody, EmptyState, Input, PageHeader, Select, Spinner } from "@/components/ui";

export default function MarketplacePage() {
  const { data, loading } = { data: sample.listings, loading: false };
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState("");
  const [interested, setInterested] = useState<Set<string>>(new Set());

  const results = useMemo(
    () => (data ?? []).filter((l) =>
      l.status === "active" &&
      (!category || l.category === category) &&
      (!kind || l.kind === kind) &&
      `${l.product} ${l.location} ${l.country}`.toLowerCase().includes(q.toLowerCase())),
    [data, q, category, kind],
  );

  async function showInterest(id: string) {
    void id; // TEMPORARY: Prompt 5 connects POST /api/v1/enquiries
    setInterested((s) => new Set(s).add(id));
  }

  return (
    <>
      <PageHeader title="Marketplace" description="Search verified requirements and offers. Company names stay hidden until a deal is initiated through Doctraders." />
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_12rem_12rem]">
        <Input placeholder="Search product, port, country…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </Select>
        <Select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type">
          <option value="">Offers and requirements</option>
          <option value="offer">Offers</option>
          <option value="requirement">Requirements</option>
        </Select>
      </div>
      {loading ? <Spinner /> : results.length === 0 ? <EmptyState title="No listings match">Try different filters.</EmptyState> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((l) => (
            <Card key={l.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-sans text-base font-semibold text-ink-900">{l.product}</h3>
                  <Badge tone={l.kind === "offer" ? "brand" : "neutral"} className="capitalize">{l.kind}</Badge>
                </div>
                <p className="text-sm text-ink-600">{l.specification}</p>
                <dl className="grid grid-cols-2 gap-2 text-xs text-ink-500">
                  <div><dt>Quantity</dt><dd className="font-semibold text-ink-900">{l.quantity.toLocaleString()} {l.unit}</dd></div>
                  <div><dt>Price</dt><dd className="font-semibold text-ink-900">{l.price}</dd></div>
                  <div><dt>Terms</dt><dd className="font-semibold text-ink-900">{l.deliveryTerms} · {l.paymentTerms}</dd></div>
                  <div><dt>Valid until</dt><dd className="font-semibold text-ink-900">{l.validUntil}</dd></div>
                </dl>
                <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="flex items-center gap-1 text-xs text-ink-500"><MapPin className="size-3.5" />{l.location} · {l.companyAlias}</span>
                  <Button size="sm" disabled={interested.has(l.id)} onClick={() => showInterest(l.id)}>{interested.has(l.id) ? "Interest sent" : "I am interested"}</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
