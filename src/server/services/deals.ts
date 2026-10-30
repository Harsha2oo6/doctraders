import "server-only";
import type { FilterQuery, Types } from "mongoose";
import { DEAL_STATUSES, SHIPMENT_STATUSES, type DealStatus, type ShipmentStatus } from "@/lib/constants";
import { formatINR, formatQty } from "@/lib/format";
import type { DealCreateValues, DealUpdateInput, PaymentValues, ShipmentCreateValues } from "@/lib/validation";
import { appUrl, layout } from "../email";
import { isAdmin } from "../guard";
import { HttpError } from "../http";
import { later } from "../later";
import { DealModel, EnquiryModel, nextDealCode, UserModel, type DealDoc, type User } from "../models";
import { notify, notifyAdmins } from "../notify";
import { adminDeal, partyDeal, type DealLike } from "../serializers";
import { escapeRegex } from "./listings";

const round2 = (n: number) => Math.round(n * 100) / 100;
const totals = (quantity: number, price: number, pct: number) => {
  const totalValue = round2(quantity * price);
  return { totalValue, commissionAmount: round2((totalValue * pct) / 100) };
};
const EPS = 0.005;

async function usersById(ids: { toString(): string }[]) {
  const users = await UserModel.find({ _id: { $in: [...new Set(ids.map(String))] } }).lean();
  return new Map(users.map((u) => [String(u._id), u]));
}

async function adminView(d: DealLike) {
  const users = await usersById([d.buyerId, d.sellerId]);
  return adminDeal(d, { buyer: users.get(String(d.buyerId)), seller: users.get(String(d.sellerId)) });
}

async function partyView(d: DealLike, viewer: User) {
  const otherId = String(d.buyerId) === String(viewer._id) ? d.sellerId : d.buyerId;
  const other = await UserModel.findById(otherId, { publicCode: 1 }).lean();
  return partyDeal(d, viewer._id, other);
}

/** Admin gets the full deal, the seller the party view. */
const viewFor = (d: DealLike, user: User) => (isAdmin(user) ? adminView(d) : partyView(d, user));

/* ---------------- admin ---------------- */

export async function createDeal(admin: User, input: DealCreateValues) {
  const enquiry = await EnquiryModel.findById(input.enquiryId);
  if (!enquiry) throw new HttpError(404, "Enquiry not found.");
  if (enquiry.dealId || (await DealModel.exists({ enquiryId: enquiry._id }))) {
    throw new HttpError(409, "A deal already exists for this enquiry.");
  }
  const deal = await DealModel.create({
    code: await nextDealCode(),
    enquiryId: enquiry._id,
    listingId: enquiry.listingId,
    title: enquiry.listingTitle,
    buyerId: enquiry.buyerId,
    sellerId: enquiry.sellerId,
    quantity: input.quantity,
    unit: input.unit,
    pricePerUnit: input.pricePerUnit,
    commissionPercent: input.commissionPercent,
    ...totals(input.quantity, input.pricePerUnit, input.commissionPercent),
    commissionStatus: "pending",
    status: "active",
    adminNotes: input.adminNotes,
    createdBy: admin._id,
  });
  enquiry.status = "deal_closed";
  enquiry.dealId = deal._id;
  enquiry.statusHistory.push({ status: "deal_closed", byId: admin._id, at: new Date() });
  await enquiry.save();

  const link = `/dashboard/deals/${deal._id}`;
  later(() =>
    notify([deal.buyerId, deal.sellerId], {
      type: "deal_created",
      title: `Deal ${deal.code} created`,
      body: `${deal.title}: ${formatQty(deal.quantity, deal.unit)} at ${formatINR(deal.pricePerUnit)} each`,
      link,
    }),
  );
  return adminView(deal);
}

export async function adminListDeals(opts: { status?: DealStatus; commissionStatus?: string; q?: string; page: number; limit: number }) {
  const base: FilterQuery<DealDoc> = {};
  if (opts.commissionStatus) base.commissionStatus = opts.commissionStatus;
  if (opts.q?.trim()) {
    const re = new RegExp(escapeRegex(opts.q.trim()), "i");
    const ids = (await UserModel.find({ $or: [{ name: re }, { "business.name": re }, { mobile: re }] }, { _id: 1 }).lean()).map((u) => u._id);
    base.$or = [{ code: re }, { title: re }, { buyerId: { $in: ids } }, { sellerId: { $in: ids } }];
  }
  const filter = opts.status ? { ...base, status: opts.status } : base;
  const [rows, total, grouped] = await Promise.all([
    DealModel.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    DealModel.countDocuments(filter),
    DealModel.aggregate<{ _id: DealStatus; n: number }>([{ $match: base }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const users = await usersById(rows.flatMap((r) => [r.buyerId, r.sellerId]));
  const counts = Object.fromEntries(DEAL_STATUSES.map((s) => [s, grouped.find((g) => g._id === s)?.n ?? 0])) as Record<DealStatus, number>;
  return {
    items: rows.map((d) => adminDeal(d, { buyer: users.get(String(d.buyerId)), seller: users.get(String(d.sellerId)) })),
    page: opts.page,
    limit: opts.limit,
    total,
    counts: { all: Object.values(counts).reduce((a, b) => a + b, 0), ...counts },
  };
}

async function findDeal(id: string) {
  const d = await DealModel.findById(id);
  if (!d) throw new HttpError(404, "Deal not found.");
  return d;
}

export async function adminGetDeal(id: string) {
  return adminView(await findDeal(id));
}

export async function adminUpdateDeal(admin: User, id: string, input: DealUpdateInput & { quantity?: number; pricePerUnit?: number; commissionPercent?: number }) {
  const d = await findDeal(id);
  const changesNumbers = input.quantity !== undefined || input.pricePerUnit !== undefined || input.commissionPercent !== undefined;

  if (changesNumbers) {
    if (d.status === "cancelled") throw new HttpError(409, "This deal is cancelled.");
    const quantity = input.quantity ?? d.quantity;
    const price = input.pricePerUnit ?? d.pricePerUnit;
    const pct = input.commissionPercent ?? d.commissionPercent;
    const allocated = d.shipments.reduce((s, x) => s + x.quantity, 0);
    if (quantity + EPS < allocated) {
      throw new HttpError(400, `Quantity cannot be less than what is already in shipment lots (${allocated}).`, { quantity: `At least ${allocated}` });
    }
    const t = totals(quantity, price, pct);
    const paid = d.payments.reduce((s, p) => s + p.amount, 0);
    if (t.totalValue + EPS < paid) {
      throw new HttpError(400, `The deal value cannot be less than what is already paid (${formatINR(paid)}).`, { pricePerUnit: "Below the amount already paid" });
    }
    Object.assign(d, { quantity, pricePerUnit: price, commissionPercent: pct, ...t });
  }
  if (input.adminNotes !== undefined) d.adminNotes = input.adminNotes ?? undefined;

  let completed = false;
  if (input.status && input.status !== d.status) {
    if (d.status !== "active") throw new HttpError(409, `Only an active deal can be ${input.status}.`);
    d.status = input.status;
    if (input.status === "completed") {
      if (d.commissionStatus === "pending") d.commissionStatus = "due";
      completed = true;
    }
  }
  if (input.commissionStatus === "paid") {
    if (d.status !== "completed") throw new HttpError(409, "Commission can be marked paid only after the deal is completed.");
    d.commissionStatus = "paid";
  }
  await d.save();

  if (completed) {
    later(() =>
      notify([d.buyerId, d.sellerId], { type: "deal_completed", title: `Deal ${d.code} completed`, body: d.title, link: `/dashboard/deals/${d._id}` }),
    );
  }
  return adminView(d);
}

export async function addPayment(admin: User, id: string, input: PaymentValues) {
  const d = await findDeal(id);
  if (d.status === "cancelled") throw new HttpError(409, "This deal is cancelled.");
  const paid = d.payments.reduce((s, p) => s + p.amount, 0);
  if (paid + input.amount > d.totalValue + EPS) {
    throw new HttpError(400, `This is more than the balance of ${formatINR(d.totalValue - paid)}.`, { amount: `Max ${formatINR(d.totalValue - paid)}` });
  }
  d.payments.push({ amount: input.amount, method: input.method, note: input.note, paidAt: input.paidAt ?? new Date(), byId: admin._id });
  await d.save();
  const pct = Math.round(((paid + input.amount) / d.totalValue) * 100);
  later(() =>
    notify([d.sellerId], {
      type: "payment_added",
      title: `Payment recorded on ${d.code}`,
      body: `${formatINR(input.amount)} received. ${pct}% of the deal is now paid.`,
      link: `/dashboard/deals/${d._id}`,
    }),
  );
  return adminView(d);
}

export async function deletePayment(id: string, paymentId: string) {
  const d = await findDeal(id);
  const p = d.payments.id(paymentId);
  if (!p) throw new HttpError(404, "Payment not found.");
  p.deleteOne();
  await d.save();
  return adminView(d);
}

/* ---------------- buyer / seller ---------------- */

const partyFilter = (user: User): FilterQuery<DealDoc> => ({ $or: [{ buyerId: user._id }, { sellerId: user._id }] });

export async function myDeals(user: User, opts: { status?: DealStatus; page: number; limit: number }) {
  const filter: FilterQuery<DealDoc> = { ...partyFilter(user), ...(opts.status ? { status: opts.status } : {}) };
  const [rows, total] = await Promise.all([
    DealModel.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    DealModel.countDocuments(filter),
  ]);
  const others = await usersById(rows.map((d) => (String(d.buyerId) === String(user._id) ? d.sellerId : d.buyerId)));
  return {
    items: rows.map((d) => partyDeal(d, user._id, others.get(String(String(d.buyerId) === String(user._id) ? d.sellerId : d.buyerId)))),
    page: opts.page,
    limit: opts.limit,
    total,
  };
}

export async function myDeal(user: User, id: string) {
  const d = await DealModel.findOne({ _id: id, ...partyFilter(user) }).lean();
  if (!d) throw new HttpError(404, "Deal not found.");
  return partyView(d, user);
}

/** The deal's seller or an admin may manage shipments, only while the deal is active. */
async function shipmentDeal(user: User, id: string) {
  const d = await findDeal(id);
  if (!isAdmin(user) && String(d.sellerId) !== String(user._id)) {
    if (String(d.buyerId) === String(user._id)) throw new HttpError(403, "Only the seller can post shipment updates.");
    throw new HttpError(404, "Deal not found.");
  }
  if (d.status !== "active") throw new HttpError(409, "Shipments can only be updated on an active deal.");
  return d;
}

function announceShipment(d: DealLike & { _id: Types.ObjectId }, text: string) {
  const title = `${d.code}: ${text}`;
  const mail = layout({
    title,
    paragraphs: [`Shipment update on deal ${d.code} (${d.title}).`],
    button: { label: "Open deal", url: appUrl(`/admin/deals/${d._id}`) },
  });
  later(() =>
    Promise.all([
      notifyAdmins({ type: "shipment_update", title, body: d.title, link: `/admin/deals/${d._id}` }, { email: { subject: title, ...mail } }),
      notify([d.buyerId as Types.ObjectId], { type: "shipment_update", title, body: d.title, link: `/dashboard/deals/${d._id}` }),
    ]),
  );
}

export async function addShipment(user: User, id: string, input: ShipmentCreateValues) {
  const d = await shipmentDeal(user, id);
  const allocated = d.shipments.reduce((s, x) => s + x.quantity, 0);
  const remaining = round2(d.quantity - allocated);
  if (input.quantity > remaining + EPS) {
    throw new HttpError(400, `Only ${formatQty(remaining, d.unit)} is left to ship on this deal.`, { quantity: `Max ${remaining}` });
  }
  d.shipments.push({ quantity: input.quantity, status: "packed", note: input.note, history: [{ status: "packed", at: new Date(), byId: user._id }], createdAt: new Date() });
  await d.save();
  announceShipment(d, `${formatQty(input.quantity, d.unit)} packed`);
  return viewFor(d, user);
}

export async function updateShipment(user: User, id: string, shipmentId: string, input: { status: "shipped" | "reached"; note?: string }) {
  const d = await shipmentDeal(user, id);
  const lot = d.shipments.id(shipmentId);
  if (!lot) throw new HttpError(404, "Shipment lot not found.");
  const from = SHIPMENT_STATUSES.indexOf(lot.status as ShipmentStatus);
  const to = SHIPMENT_STATUSES.indexOf(input.status);
  if (to <= from) throw new HttpError(409, `This lot is already ${lot.status}. Shipments only move forward (packed → shipped → reached).`);
  lot.status = input.status;
  if (input.note) lot.note = input.note;
  lot.history.push({ status: input.status, at: new Date(), byId: user._id });
  await d.save();
  announceShipment(d, `${formatQty(lot.quantity, d.unit)} ${input.status}`);
  return viewFor(d, user);
}
