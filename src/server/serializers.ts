import "server-only";
import {
  CATEGORY_EXAMPLES, ENQUIRY_PARTY_STATUS, aliasFor,
  type EnquiryStatus, type ListingKind, type TradeRole,
} from "@/lib/constants";
import type { AdminDeal, AdminEnquiry, AdminListing, AppNotification, ContactCard, PartyDeal, PartyEnquiry, PublicListing } from "@/lib/types";

/**
 * Privacy rules live here (README §3.6–3.8):
 *  - party/public responses never include the other side's name, email, mobile, business name, address or GST;
 *    they get an alias ("Seller #48213") instead
 *  - commission fields and admin notes are admin-only
 *  - passwordHash / reset tokens never leave the server
 */

type Id = { toString(): string };
type MaybeDate = Date | string | null | undefined;

const sid = (v: Id | null | undefined) => (v == null ? null : String(v));
const iso = (d: MaybeDate) => (d ? new Date(d).toISOString() : null);
const pct = (part: number, whole: number) => (whole > 0 ? Math.min(100, Math.round((part / whole) * 100)) : 0);

/* ---------------- users ---------------- */

type BusinessLike = {
  name?: string | null; type?: string | null; categories?: string[] | null; address?: string | null;
  city?: string | null; state?: string | null; pincode?: string | null; gstNumber?: string | null;
  yearsInBusiness?: number | null;
};
export type UserLike = {
  _id: Id; name: string; email: string; mobile: string; roles: string[]; status: string; publicCode?: string | null;
  business?: BusinessLike | null; lastLoginAt?: MaybeDate; createdAt?: MaybeDate; updatedAt?: MaybeDate;
  createdBy?: Id | null;
};
type CodeLike = { publicCode?: string | null };

function business(b: BusinessLike | null | undefined) {
  if (!b) return null;
  return {
    name: b.name ?? null,
    type: b.type ?? null,
    categories: b.categories ?? [],
    address: b.address ?? null,
    city: b.city ?? null,
    state: b.state ?? null,
    pincode: b.pincode ?? null,
    gstNumber: b.gstNumber ?? null,
    yearsInBusiness: b.yearsInBusiness ?? null,
  };
}

/** The logged-in user's own full profile. */
export function selfUser(u: UserLike) {
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    roles: u.roles,
    status: u.status,
    publicCode: u.publicCode ?? null,
    business: business(u.business),
    lastLoginAt: iso(u.lastLoginAt),
    createdAt: iso(u.createdAt),
    updatedAt: iso(u.updatedAt),
  };
}

/** ADMIN ONLY: full profile. */
export function adminUser(u: UserLike) {
  return { ...selfUser(u), createdBy: sid(u.createdBy) };
}

/** ADMIN ONLY: compact contact card for enquiry/deal screens. */
export function contactCard(u: UserLike | null | undefined): ContactCard | null {
  if (!u) return null;
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    status: u.status as ContactCard["status"],
    publicCode: u.publicCode ?? null,
    businessName: u.business?.name ?? null,
    businessType: u.business?.type ?? null,
    address: u.business?.address ?? null,
    city: u.business?.city ?? null,
    state: u.business?.state ?? null,
    pincode: u.business?.pincode ?? null,
    gstNumber: u.business?.gstNumber ?? null,
  };
}

/** What anyone may know about the other party. */
export function alias(u: CodeLike | null | undefined, role: TradeRole) {
  return { alias: aliasFor(role, u?.publicCode ?? "00000") };
}

/* ---------------- categories ---------------- */

type CategoryLike = { _id: Id; name: string; slug: string; active?: boolean | null; order?: number | null };

export function publicCategory(c: CategoryLike) {
  return { id: String(c._id), name: c.name, slug: c.slug, order: c.order ?? 0, examples: CATEGORY_EXAMPLES[c.slug] ?? null };
}

export function adminCategory(c: CategoryLike & { createdAt?: MaybeDate; updatedAt?: MaybeDate }, listingCount?: number) {
  return { ...publicCategory(c), active: c.active ?? true, listingCount: listingCount ?? null, createdAt: iso(c.createdAt) };
}

/* ---------------- listings ---------------- */

export type ListingLike = {
  _id: Id; kind: string; ownerId: Id; title: string; category: string; description: string; quantity: number;
  unit: string; price?: number | null; minOrderQuantity?: number | null; city: string; state: string;
  images?: string[] | null; status: string; enquiryCount?: number | null; createdAt?: MaybeDate; updatedAt?: MaybeDate;
};

const ownerRole = (kind: string): TradeRole => (kind === "offer" ? "seller" : "buyer");

/** Public / party view: owner shown as an alias only. */
export function publicListing(l: ListingLike, owner: CodeLike | null | undefined): PublicListing {
  return {
    id: String(l._id),
    kind: l.kind as ListingKind,
    title: l.title,
    category: l.category,
    description: l.description,
    quantity: l.quantity,
    unit: l.unit,
    price: l.price ?? null,
    minOrderQuantity: l.minOrderQuantity ?? null,
    city: l.city,
    state: l.state,
    images: l.images ?? [],
    status: l.status,
    owner: alias(owner, ownerRole(l.kind)),
    createdAt: iso(l.createdAt),
    updatedAt: iso(l.updatedAt),
  } as PublicListing;
}

/** ADMIN ONLY: + enquiry count + owner's contact details. */
export function adminListing(l: ListingLike, owner: UserLike | null | undefined): AdminListing {
  return { ...publicListing(l, owner), enquiryCount: l.enquiryCount ?? 0, owner: { ...alias(owner, ownerRole(l.kind)), ...contactCard(owner) } } as AdminListing;
}

/* ---------------- enquiries ---------------- */

export type EnquiryLike = {
  _id: Id; listingId: Id; listingKind: string; listingTitle: string; fromUserId: Id; ownerId: Id; buyerId: Id; sellerId: Id;
  quantity: number; message?: string | null; status: string; dealId?: Id | null;
  notes?: { _id?: Id; text: string; byId: Id; byName: string; at?: MaybeDate }[] | null;
  statusHistory?: { status: string; byId: Id; at?: MaybeDate }[] | null;
  createdAt?: MaybeDate; updatedAt?: MaybeDate;
};

/** Party view: party status only ("received", "in_discussion"…), no notes, other side as alias. */
export function partyEnquiry(e: EnquiryLike, viewerId: Id, counterparty: CodeLike | null | undefined): PartyEnquiry {
  const myRole: TradeRole = String(e.buyerId) === String(viewerId) ? "buyer" : "seller";
  return {
    id: String(e._id),
    listingId: String(e.listingId),
    listingKind: e.listingKind as ListingKind,
    listingTitle: e.listingTitle,
    quantity: e.quantity,
    message: e.message ?? null,
    myRole,
    counterparty: alias(counterparty, myRole === "buyer" ? "seller" : "buyer"),
    status: ENQUIRY_PARTY_STATUS[e.status as EnquiryStatus] ?? "received",
    dealId: sid(e.dealId),
    createdAt: iso(e.createdAt),
    updatedAt: iso(e.updatedAt),
  } as PartyEnquiry;
}

/** ADMIN ONLY: full detail with both parties' contact details, notes and history. */
export function adminEnquiry(
  e: EnquiryLike,
  ctx: { buyer?: UserLike | null; seller?: UserLike | null; listing?: ListingLike | null; listingOwner?: UserLike | null },
): AdminEnquiry {
  return {
    id: String(e._id),
    listingId: String(e.listingId),
    listingKind: e.listingKind as ListingKind,
    listingTitle: e.listingTitle,
    listing: ctx.listing ? adminListing(ctx.listing, ctx.listingOwner ?? null) : null,
    fromUserId: String(e.fromUserId),
    fromRole: (String(e.fromUserId) === String(e.buyerId) ? "buyer" : "seller") as TradeRole,
    quantity: e.quantity,
    message: e.message ?? null,
    status: e.status as EnquiryStatus,
    buyer: contactCard(ctx.buyer),
    seller: contactCard(ctx.seller),
    notes: (e.notes ?? [])
      .map((n) => ({ id: sid(n._id), text: n.text, byId: String(n.byId), byName: n.byName, at: iso(n.at) }))
      .reverse(),
    statusHistory: (e.statusHistory ?? []).map((h) => ({ status: h.status, byId: String(h.byId), at: iso(h.at) })).reverse(),
    dealId: sid(e.dealId),
    createdAt: iso(e.createdAt),
    updatedAt: iso(e.updatedAt),
  } as AdminEnquiry;
}

/* ---------------- deals ---------------- */

export type DealLike = {
  _id: Id; code: string; enquiryId: Id; listingId: Id; title: string; buyerId: Id; sellerId: Id;
  quantity: number; unit: string; pricePerUnit: number; totalValue: number;
  commissionPercent: number; commissionAmount: number; commissionStatus: string;
  payments?: { _id?: Id; amount: number; method?: string | null; note?: string | null; paidAt?: MaybeDate; byId: Id }[] | null;
  shipments?: {
    _id?: Id; quantity: number; status: string; note?: string | null;
    history?: { status: string; at?: MaybeDate; byId: Id }[] | null; createdAt?: MaybeDate;
  }[] | null;
  status: string; adminNotes?: string | null; createdBy?: Id | null; createdAt?: MaybeDate; updatedAt?: MaybeDate;
};

/** Computed progress (not stored). */
export function dealProgress(d: DealLike) {
  const payments = d.payments ?? [];
  const shipments = d.shipments ?? [];
  const paidAmount = payments.reduce((s, p) => s + p.amount, 0);
  const allocatedQuantity = shipments.reduce((s, x) => s + x.quantity, 0);
  const shippedQuantity = shipments.filter((x) => x.status !== "packed").reduce((s, x) => s + x.quantity, 0);
  const reachedQuantity = shipments.filter((x) => x.status === "reached").reduce((s, x) => s + x.quantity, 0);
  return {
    paidAmount,
    paidPercent: pct(paidAmount, d.totalValue),
    balanceAmount: Math.max(0, d.totalValue - paidAmount),
    allocatedQuantity,
    remainingQuantity: Math.max(0, d.quantity - allocatedQuantity),
    shippedQuantity,
    shippedPercent: pct(shippedQuantity, d.quantity),
    reachedQuantity,
    reachedPercent: pct(reachedQuantity, d.quantity),
  };
}

const shipmentOut = (x: NonNullable<DealLike["shipments"]>[number], withBy: boolean) => ({
  id: sid(x._id),
  quantity: x.quantity,
  status: x.status,
  note: x.note ?? null,
  history: (x.history ?? []).map((h) => (withBy ? { status: h.status, at: iso(h.at), byId: String(h.byId) } : { status: h.status, at: iso(h.at) })),
  createdAt: iso(x.createdAt),
});

/** Party view: no commission, no admin notes, other side as alias. */
export function partyDeal(d: DealLike, viewerId: Id, counterparty: CodeLike | null | undefined): PartyDeal {
  const myRole: TradeRole = String(d.buyerId) === String(viewerId) ? "buyer" : "seller";
  return {
    id: String(d._id),
    code: d.code,
    title: d.title,
    listingId: String(d.listingId),
    myRole,
    counterparty: alias(counterparty, myRole === "buyer" ? "seller" : "buyer"),
    quantity: d.quantity,
    unit: d.unit,
    pricePerUnit: d.pricePerUnit,
    totalValue: d.totalValue,
    status: d.status,
    ...dealProgress(d),
    payments: (d.payments ?? []).map((p) => ({ id: sid(p._id), amount: p.amount, method: p.method ?? null, paidAt: iso(p.paidAt) })),
    shipments: (d.shipments ?? []).map((x) => shipmentOut(x, false)),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  } as PartyDeal;
}

/** ADMIN ONLY: everything, incl. commission and both parties' contact details. */
export function adminDeal(d: DealLike, ctx: { buyer?: UserLike | null; seller?: UserLike | null } = {}): AdminDeal {
  return {
    id: String(d._id),
    code: d.code,
    enquiryId: String(d.enquiryId),
    listingId: String(d.listingId),
    title: d.title,
    buyerId: String(d.buyerId),
    sellerId: String(d.sellerId),
    buyer: contactCard(ctx.buyer),
    seller: contactCard(ctx.seller),
    quantity: d.quantity,
    unit: d.unit,
    pricePerUnit: d.pricePerUnit,
    totalValue: d.totalValue,
    commissionPercent: d.commissionPercent,
    commissionAmount: d.commissionAmount,
    commissionStatus: d.commissionStatus,
    status: d.status,
    adminNotes: d.adminNotes ?? null,
    ...dealProgress(d),
    payments: (d.payments ?? []).map((p) => ({
      id: sid(p._id), amount: p.amount, method: p.method ?? null, note: p.note ?? null, paidAt: iso(p.paidAt), byId: String(p.byId),
    })),
    shipments: (d.shipments ?? []).map((x) => shipmentOut(x, true)),
    createdBy: sid(d.createdBy),
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  } as AdminDeal;
}

/* ---------------- notifications ---------------- */

type NotificationLike = { _id: Id; type: string; title: string; body?: string | null; link?: string | null; read: boolean; createdAt?: MaybeDate };

export function notificationOut(n: NotificationLike): AppNotification {
  return { id: String(n._id), type: n.type, title: n.title, body: n.body ?? null, link: n.link ?? null, read: n.read, createdAt: iso(n.createdAt) } as AppNotification;
}
