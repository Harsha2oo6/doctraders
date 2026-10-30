import "server-only";
import type { FilterQuery, Types } from "mongoose";
import type { ListingKind, ListingStatus } from "@/lib/constants";
import { checkListing, listingSchema, type ListingUpdateInput, type ListingValues } from "@/lib/validation";
import { z } from "zod";
import { hasRole } from "../guard";
import { HttpError } from "../http";
import { EnquiryModel, ListingModel, UserModel, type ListingDoc, type User } from "../models";
import { publicListing } from "../serializers";
import { activeCategorySlugs } from "./categories";

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function assertCategory(slug: string | undefined) {
  if (slug === undefined) return;
  if (!(await activeCategorySlugs()).has(slug)) throw new HttpError(400, "Choose a category from the list", { category: "Choose a category from the list" });
}

/** Map of userId → publicCode, for aliases. */
async function codesFor(ids: (Types.ObjectId | string)[]) {
  const users = await UserModel.find({ _id: { $in: [...new Set(ids.map(String))] } }, { publicCode: 1 }).lean();
  return new Map(users.map((u) => [String(u._id), { publicCode: u.publicCode }]));
}

export async function blockedUserIds(): Promise<Types.ObjectId[]> {
  const rows = await UserModel.find({ status: "blocked" }, { _id: 1 }).lean();
  return rows.map((r) => r._id);
}

export type PublicSearch = { kind?: ListingKind; category?: string; q?: string; state?: string; city?: string; page: number; limit: number };

/** Active listings of active owners, newest first. Used by GET /listings and the public pages (SSR). */
export async function searchPublicListings(s: PublicSearch) {
  const filter: FilterQuery<ListingDoc> = { status: "active", ownerId: { $nin: await blockedUserIds() } };
  if (s.kind) filter.kind = s.kind;
  if (s.category) filter.category = s.category;
  if (s.state) filter.state = s.state;
  if (s.city) filter.city = new RegExp(`^${escapeRegex(s.city.trim())}$`, "i");
  if (s.q?.trim()) {
    const re = new RegExp(escapeRegex(s.q.trim()), "i");
    filter.$or = [{ title: re }, { description: re }, { city: re }];
  }
  const [rows, total] = await Promise.all([
    ListingModel.find(filter).sort({ createdAt: -1 }).skip((s.page - 1) * s.limit).limit(s.limit).lean(),
    ListingModel.countDocuments(filter),
  ]);
  const codes = await codesFor(rows.map((r) => r.ownerId));
  return { items: rows.map((l) => publicListing(l, codes.get(String(l.ownerId)))), page: s.page, limit: s.limit, total };
}

/** One listing: active to everyone; the owner also sees their own closed/blocked listing. */
export async function getListing(id: string, viewer?: User | null) {
  const l = await ListingModel.findById(id).lean();
  if (!l) throw new HttpError(404, "This listing is not available.");
  const isOwner = !!viewer && String(l.ownerId) === String(viewer._id);
  if (!isOwner) {
    const owner = await UserModel.findById(l.ownerId, { status: 1 }).lean();
    if (l.status !== "active" || owner?.status !== "active") throw new HttpError(404, "This listing is not available.");
  }
  const codes = await codesFor([l.ownerId]);
  return { listing: l, data: publicListing(l, codes.get(String(l.ownerId))), isOwner };
}

export async function createListing(user: User, input: ListingValues) {
  if (input.kind === "offer" && !hasRole(user, "seller")) throw new HttpError(403, "Only sellers can post offers. Add the seller role in your profile.");
  if (input.kind === "requirement" && !hasRole(user, "buyer")) throw new HttpError(403, "Only buyers can post requirements. Add the buyer role in your profile.");
  await assertCategory(input.category);
  const l = await ListingModel.create({ ...input, ownerId: user._id, status: "active", enquiryCount: 0 });
  return publicListing(l, user);
}

async function ownListing(user: User, id: string) {
  const l = await ListingModel.findById(id);
  if (!l || String(l.ownerId) !== String(user._id)) throw new HttpError(404, "Listing not found.");
  return l;
}

export async function updateListing(user: User, id: string, input: ListingUpdateInput & { price?: number | null; minOrderQuantity?: number | null }) {
  const l = await ownListing(user, id);
  if (input.status && l.status === "blocked") throw new HttpError(403, "This listing was blocked by Doctraders. Please contact support.");
  await assertCategory(input.category);

  const { status, ...fields } = input;
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    l.set(k, v === null ? undefined : v);
  }
  if (status) l.status = status as ListingStatus;
  // Re-check cross-field rules on the merged listing (offer needs a photo, min order ≤ quantity).
  z.object({}).passthrough().superRefine((v, ctx) => checkListing(v, ctx)).parse({
    kind: l.kind, quantity: l.quantity, minOrderQuantity: l.minOrderQuantity ?? undefined, images: l.images,
  });
  await l.save();
  return publicListing(l, user);
}

/** Hard delete if nobody showed interest yet, otherwise close it (enquiries keep their history). */
export async function deleteListing(user: User, id: string) {
  const l = await ownListing(user, id);
  const hasEnquiries = l.enquiryCount > 0 || !!(await EnquiryModel.exists({ listingId: l._id }));
  if (!hasEnquiries) {
    await l.deleteOne();
    return { deleted: true, closed: false };
  }
  if (l.status === "active") {
    l.status = "closed";
    await l.save();
  }
  return { deleted: false, closed: true };
}

export async function myListings(user: User, opts: { kind?: ListingKind; status?: ListingStatus; page: number; limit: number }) {
  const filter: FilterQuery<ListingDoc> = { ownerId: user._id };
  if (opts.kind) filter.kind = opts.kind;
  if (opts.status) filter.status = opts.status;
  const [rows, total] = await Promise.all([
    ListingModel.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    ListingModel.countDocuments(filter),
  ]);
  return { items: rows.map((l) => publicListing(l, user)), page: opts.page, limit: opts.limit, total };
}

export { listingSchema };
