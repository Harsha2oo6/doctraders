import "server-only";
import type { FilterQuery, Types } from "mongoose";
import { ENQUIRY_PARTY_STATUS, ENQUIRY_STATUSES, LISTING_KIND_LABELS, type EnquiryPartyStatus, type EnquiryStatus } from "@/lib/constants";
import { formatQty } from "@/lib/format";
import type { EnquiryValues } from "@/lib/validation";
import { appUrl, layout } from "../email";
import { hasRole } from "../guard";
import { HttpError } from "../http";
import { later } from "../later";
import { EnquiryModel, ListingModel, UserModel, type EnquiryDoc, type User } from "../models";
import { notifyAdmins } from "../notify";
import { adminEnquiry, partyEnquiry } from "../serializers";
import { escapeRegex } from "./listings";

/** "I'm interested" — README §5 interest rules. */
export async function createEnquiry(user: User, input: EnquiryValues) {
  const listing = await ListingModel.findById(input.listingId);
  if (!listing) throw new HttpError(404, "This listing is not available.");
  const owner = await UserModel.findById(listing.ownerId);
  if (listing.status !== "active" || !owner || owner.status !== "active") {
    throw new HttpError(409, "This listing is closed and no longer takes interest.");
  }
  if (String(listing.ownerId) === String(user._id)) throw new HttpError(403, "You cannot show interest in your own listing.");
  const needed = listing.kind === "offer" ? "buyer" : "seller";
  if (!hasRole(user, needed)) {
    throw new HttpError(403, `Only ${needed}s can show interest in ${listing.kind === "offer" ? "offers" : "requirements"}. Add the ${needed} role in your profile.`);
  }
  if (await EnquiryModel.exists({ listingId: listing._id, fromUserId: user._id })) {
    throw new HttpError(409, "You have already shown interest in this listing.");
  }

  const buyer = listing.kind === "offer" ? user : owner;
  const seller = listing.kind === "offer" ? owner : user;
  let enquiry;
  try {
    enquiry = await EnquiryModel.create({
      listingId: listing._id,
      listingKind: listing.kind,
      listingTitle: listing.title,
      fromUserId: user._id,
      ownerId: owner._id,
      buyerId: buyer._id,
      sellerId: seller._id,
      quantity: input.quantity,
      message: input.message,
      status: "new",
      statusHistory: [{ status: "new", byId: user._id, at: new Date() }],
    });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) throw new HttpError(409, "You have already shown interest in this listing.");
    throw e;
  }
  await ListingModel.updateOne({ _id: listing._id }, { $inc: { enquiryCount: 1 } });

  const link = `/admin/enquiries/${enquiry._id}`;
  const fromRole = needed === "buyer" ? "Buyer" : "Seller";
  const mail = layout({
    title: `New enquiry: ${listing.title}`,
    paragraphs: [`${fromRole} ${user.name} is interested in this ${LISTING_KIND_LABELS[listing.kind].toLowerCase()}. Call both sides and move it forward.`],
    rows: [
      ["Listing", listing.title],
      ["Quantity wanted", formatQty(input.quantity, listing.unit)],
      ["Message", input.message],
      ["Buyer", `${buyer.name} (${buyer.business?.name ?? "—"})`],
      ["Buyer mobile", buyer.mobile],
      ["Seller", `${seller.name} (${seller.business?.name ?? "—"})`],
      ["Seller mobile", seller.mobile],
    ],
    button: { label: "Open enquiry", url: appUrl(link) },
  });
  later(() =>
    notifyAdmins(
      { type: "enquiry_new", title: `New enquiry: ${listing.title}`, body: `${fromRole} wants ${formatQty(input.quantity, listing.unit)}`, link },
      { email: { subject: `New enquiry: ${listing.title}`, ...mail } },
    ),
  );
  return partyEnquiry(enquiry, user._id, owner);
}

/** Enquiries I sent. `status` filters by the party status (received/in_discussion/deal_done/closed). */
export async function myEnquiries(user: User, opts: { listingId?: string; status?: EnquiryPartyStatus; page: number; limit: number }) {
  const filter: FilterQuery<EnquiryDoc> = { fromUserId: user._id };
  if (opts.listingId) filter.listingId = opts.listingId;
  if (opts.status) {
    filter.status = { $in: (Object.keys(ENQUIRY_PARTY_STATUS) as EnquiryStatus[]).filter((s) => ENQUIRY_PARTY_STATUS[s] === opts.status) };
  }
  const [rows, total] = await Promise.all([
    EnquiryModel.find(filter, { notes: 0 }).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    EnquiryModel.countDocuments(filter),
  ]);
  const owners = await UserModel.find({ _id: { $in: rows.map((r) => r.ownerId) } }, { publicCode: 1 }).lean();
  const byId = new Map(owners.map((o) => [String(o._id), o]));
  return { items: rows.map((e) => partyEnquiry(e, user._id, byId.get(String(e.ownerId)))), page: opts.page, limit: opts.limit, total };
}

async function usersById(ids: (Types.ObjectId | string)[]) {
  const users = await UserModel.find({ _id: { $in: [...new Set(ids.map(String))] } }).lean();
  return new Map(users.map((u) => [String(u._id), u]));
}

/** Admin inbox: ?status, ?q (listing title, names, business, mobile, email), counts per status for the tabs. */
export async function adminListEnquiries(opts: { status?: EnquiryStatus; q?: string; page: number; limit: number }) {
  const base: FilterQuery<EnquiryDoc> = {};
  if (opts.q?.trim()) {
    const re = new RegExp(escapeRegex(opts.q.trim()), "i");
    const matching = await UserModel.find({ $or: [{ name: re }, { "business.name": re }, { mobile: re }, { email: re }] }, { _id: 1 }).lean();
    const ids = matching.map((u) => u._id);
    base.$or = [{ listingTitle: re }, { buyerId: { $in: ids } }, { sellerId: { $in: ids } }];
  }
  const filter = opts.status ? { ...base, status: opts.status } : base;
  const [rows, total, grouped] = await Promise.all([
    EnquiryModel.find(filter, { notes: 0, statusHistory: 0 }).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    EnquiryModel.countDocuments(filter),
    EnquiryModel.aggregate<{ _id: EnquiryStatus; n: number }>([{ $match: base }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const users = await usersById(rows.flatMap((r) => [r.buyerId, r.sellerId]));
  const counts = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, grouped.find((g) => g._id === s)?.n ?? 0])) as Record<EnquiryStatus, number>;
  return {
    items: rows.map((e) => adminEnquiry(e, { buyer: users.get(String(e.buyerId)), seller: users.get(String(e.sellerId)) })),
    page: opts.page,
    limit: opts.limit,
    total,
    counts: { all: Object.values(counts).reduce((a, b) => a + b, 0), ...counts },
  };
}

export async function adminGetEnquiry(id: string) {
  const e = await EnquiryModel.findById(id).lean();
  if (!e) throw new HttpError(404, "Enquiry not found.");
  const listing = await ListingModel.findById(e.listingId).lean();
  const users = await usersById([e.buyerId, e.sellerId, ...(listing ? [listing.ownerId] : [])]);
  return adminEnquiry(e, {
    buyer: users.get(String(e.buyerId)),
    seller: users.get(String(e.sellerId)),
    listing,
    listingOwner: listing ? users.get(String(listing.ownerId)) : null,
  });
}

export async function adminSetEnquiryStatus(admin: User, id: string, status: EnquiryStatus) {
  const e = await EnquiryModel.findById(id);
  if (!e) throw new HttpError(404, "Enquiry not found.");
  if (e.dealId) throw new HttpError(409, "This enquiry already has a deal. Manage it from the deal page.");
  if (e.status !== status) {
    e.status = status;
    e.statusHistory.push({ status, byId: admin._id, at: new Date() });
    await e.save();
  }
  return adminGetEnquiry(id);
}

export async function adminAddNote(admin: User, id: string, text: string) {
  const e = await EnquiryModel.findById(id);
  if (!e) throw new HttpError(404, "Enquiry not found.");
  e.notes.push({ text, byId: admin._id, byName: admin.name, at: new Date() });
  await e.save();
  return adminGetEnquiry(id);
}
