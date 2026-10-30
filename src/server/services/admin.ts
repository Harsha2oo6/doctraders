import "server-only";
import { randomBytes } from "node:crypto";
import type { FilterQuery } from "mongoose";
import type { AccountStatus, ListingKind, ListingStatus, TradeRole } from "@/lib/constants";
import type { AdminCreateValues, AdminUpdateValues, CategoryUpdateInput } from "@/lib/validation";
import { hashPassword } from "../auth";
import { appUrl, layout, sendEmail } from "../email";
import { HttpError } from "../http";
import { later } from "../later";
import {
  CategoryModel, DealModel, EnquiryModel, ListingModel, NotificationModel, UserModel,
  type CategoryDoc, type ListingDoc, type User, type UserDoc,
} from "../models";
import { adminCategory, adminDeal, adminEnquiry, adminListing, adminUser } from "../serializers";
import { assertUnique } from "./auth";
import { escapeRegex } from "./listings";

const TRADER_ROLES = ["buyer", "seller"];
const ADMIN_ROLES = ["admin", "superadmin"];
const DETAIL_LIMIT = 50;

async function usersById(ids: { toString(): string }[]) {
  const users = await UserModel.find({ _id: { $in: [...new Set(ids.map(String))] } }).lean();
  return new Map(users.map((u) => [String(u._id), u]));
}

/* ---------------- users (buyers and sellers only) ---------------- */

export async function adminListUsers(opts: { role?: TradeRole; status?: AccountStatus; q?: string; page: number; limit: number }) {
  const filter: FilterQuery<UserDoc> = { roles: opts.role ? opts.role : { $in: TRADER_ROLES } };
  if (opts.status) filter.status = opts.status;
  if (opts.q?.trim()) {
    const re = new RegExp(escapeRegex(opts.q.trim()), "i");
    filter.$or = [{ name: re }, { email: re }, { mobile: re }, { "business.name": re }, { "business.city": re }];
  }
  const [rows, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    UserModel.countDocuments(filter),
  ]);
  return { items: rows.map(adminUser), page: opts.page, limit: opts.limit, total };
}

async function findTrader(id: string) {
  const u = await UserModel.findOne({ _id: id, roles: { $in: TRADER_ROLES } });
  if (!u) throw new HttpError(404, "User not found.");
  return u;
}

/** Profile + their latest listings, enquiries (as buyer or seller) and deals. */
export async function adminGetUser(id: string) {
  const u = await findTrader(id);
  const party = { $or: [{ buyerId: u._id }, { sellerId: u._id }] };
  const [listings, enquiries, deals, listingTotal, enquiryTotal, dealTotal] = await Promise.all([
    ListingModel.find({ ownerId: u._id }).sort({ createdAt: -1 }).limit(DETAIL_LIMIT).lean(),
    EnquiryModel.find(party, { notes: 0, statusHistory: 0 }).sort({ createdAt: -1 }).limit(DETAIL_LIMIT).lean(),
    DealModel.find(party).sort({ createdAt: -1 }).limit(DETAIL_LIMIT).lean(),
    ListingModel.countDocuments({ ownerId: u._id }),
    EnquiryModel.countDocuments(party),
    DealModel.countDocuments(party),
  ]);
  const users = await usersById([...enquiries, ...deals].flatMap((x) => [x.buyerId, x.sellerId]));
  const ctx = (x: { buyerId: unknown; sellerId: unknown }) => ({ buyer: users.get(String(x.buyerId)), seller: users.get(String(x.sellerId)) });
  return {
    user: adminUser(u),
    listings: listings.map((l) => adminListing(l, u)),
    enquiries: enquiries.map((e) => adminEnquiry(e, ctx(e))),
    deals: deals.map((d) => adminDeal(d, ctx(d))),
    totals: { listings: listingTotal, enquiries: enquiryTotal, deals: dealTotal },
  };
}

export async function adminSetUserStatus(id: string, status: AccountStatus) {
  const u = await findTrader(id);
  u.status = status;
  await u.save();
  return adminUser(u);
}

/* ---------------- listings ---------------- */

export async function adminListListings(opts: { status?: ListingStatus; kind?: ListingKind; q?: string; page: number; limit: number }) {
  const base: FilterQuery<ListingDoc> = {};
  if (opts.kind) base.kind = opts.kind;
  if (opts.q?.trim()) {
    const re = new RegExp(escapeRegex(opts.q.trim()), "i");
    const owners = await UserModel.find({ $or: [{ name: re }, { mobile: re }, { "business.name": re }] }, { _id: 1 }).lean();
    base.$or = [{ title: re }, { city: re }, { ownerId: { $in: owners.map((o) => o._id) } }];
  }
  const filter = opts.status ? { ...base, status: opts.status } : base;
  const [rows, total, grouped] = await Promise.all([
    ListingModel.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    ListingModel.countDocuments(filter),
    ListingModel.aggregate<{ _id: ListingStatus; n: number }>([{ $match: base }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);
  const owners = await usersById(rows.map((r) => r.ownerId));
  const count = (s: ListingStatus) => grouped.find((g) => g._id === s)?.n ?? 0;
  const counts = { active: count("active"), closed: count("closed"), blocked: count("blocked") };
  return {
    items: rows.map((l) => adminListing(l, owners.get(String(l.ownerId)))),
    page: opts.page,
    limit: opts.limit,
    total,
    counts: { all: counts.active + counts.closed + counts.blocked, ...counts },
  };
}

/** Block any listing, or unblock a blocked one. A listing its owner closed stays the owner's to reopen. */
export async function adminSetListingStatus(id: string, status: "active" | "blocked") {
  const l = await ListingModel.findById(id);
  if (!l) throw new HttpError(404, "Listing not found.");
  if (status === "active" && l.status === "closed") throw new HttpError(409, "The owner closed this listing. Only they can reopen it.");
  l.status = status;
  await l.save();
  return adminListing(l, await UserModel.findById(l.ownerId).lean());
}

/* ---------------- categories ---------------- */

function slugify(name: string) {
  return name.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function listingCounts() {
  const rows = await ListingModel.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$category", n: { $sum: 1 } } }]);
  return new Map(rows.map((r) => [r._id, r.n]));
}

export async function adminListCategories() {
  const [rows, counts] = await Promise.all([CategoryModel.find().sort({ order: 1, name: 1 }).lean(), listingCounts()]);
  return rows.map((c) => adminCategory(c, counts.get(c.slug) ?? 0));
}

async function assertNameFree(name: string, exceptId?: string) {
  const filter: FilterQuery<CategoryDoc> = { name: new RegExp(`^${escapeRegex(name)}$`, "i") };
  if (exceptId) filter._id = { $ne: exceptId };
  if (await CategoryModel.exists(filter)) throw new HttpError(409, "A category with this name already exists.", { name: "Already exists" });
}

export async function adminCreateCategory(name: string) {
  await assertNameFree(name);
  const base = slugify(name) || `category-${randomBytes(3).toString("hex")}`;
  let slug = base;
  for (let i = 2; await CategoryModel.exists({ slug }); i++) slug = `${base}-${i}`;
  const last = await CategoryModel.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
  const c = await CategoryModel.create({ name, slug, active: true, order: (last?.order ?? -1) + 1 });
  return adminCategory(c, 0);
}

/** The slug never changes: listings and businesses point at it. */
export async function adminUpdateCategory(id: string, input: CategoryUpdateInput) {
  const c = await CategoryModel.findById(id);
  if (!c) throw new HttpError(404, "Category not found.");
  if (input.name && input.name !== c.name) await assertNameFree(input.name, id);
  if (input.name !== undefined) c.name = input.name;
  if (input.active !== undefined) c.active = input.active;
  if (input.order !== undefined) c.order = input.order;
  await c.save();
  return adminCategory(c, await ListingModel.countDocuments({ category: c.slug }));
}

/** Deletes an unused category. One still used by a listing or a business profile is deactivated instead. */
export async function adminDeleteCategory(id: string) {
  const c = await CategoryModel.findById(id);
  if (!c) throw new HttpError(404, "Category not found.");
  const used = (await ListingModel.exists({ category: c.slug })) || (await UserModel.exists({ "business.categories": c.slug }));
  if (used) {
    c.active = false;
    await c.save();
    return { deleted: false, deactivated: true };
  }
  await c.deleteOne();
  return { deleted: true, deactivated: false };
}

/* ---------------- admins (super admin only) ---------------- */

export async function listAdmins(opts: { page: number; limit: number }) {
  const filter = { roles: { $in: ADMIN_ROLES } };
  const [rows, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: 1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit).lean(),
    UserModel.countDocuments(filter),
  ]);
  return { items: rows.map(adminUser), page: opts.page, limit: opts.limit, total };
}

export async function createAdmin(me: User, input: AdminCreateValues) {
  await assertUnique(input.email, input.mobile);
  const admin = await UserModel.create({
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    passwordHash: await hashPassword(input.password),
    roles: input.superadmin ? ["admin", "superadmin"] : ["admin"],
    status: "active",
    createdBy: me._id,
  });
  const mail = layout({
    title: "You are now a Doctraders admin",
    paragraphs: [`${me.name} added you to the Doctraders team. Log in with this email and the password you were given, then change it from your account page.`],
    button: { label: "Log in", url: appUrl("/login") },
  });
  later(() => sendEmail({ to: admin.email, subject: "Your Doctraders admin account", ...mail }));
  return adminUser(admin);
}

/** Finds another admin account. Nobody can change or remove their own through these endpoints. */
async function otherAdmin(me: User, id: string) {
  if (String(me._id) === id) throw new HttpError(403, "You cannot change your own admin account here.");
  const target = await UserModel.findOne({ _id: id, roles: { $in: ADMIN_ROLES } });
  if (!target) throw new HttpError(404, "Admin not found.");
  return target;
}

async function assertAnotherSuperAdmin(target: User) {
  if (!target.roles.includes("superadmin")) return;
  const others = await UserModel.countDocuments({ _id: { $ne: target._id }, roles: "superadmin", status: "active" });
  if (others === 0) throw new HttpError(409, "This is the last super admin. Make someone else a super admin first.");
}

export async function updateAdmin(me: User, id: string, input: AdminUpdateValues) {
  const target = await otherAdmin(me, id);
  if (input.status === "blocked" || input.superadmin === false) await assertAnotherSuperAdmin(target);
  if (input.status) target.status = input.status;
  if (input.password) {
    target.passwordHash = await hashPassword(input.password);
    target.resetTokenHash = undefined;
    target.resetTokenExpires = undefined;
  }
  if (input.superadmin !== undefined) target.roles = input.superadmin ? ["admin", "superadmin"] : ["admin"];
  await target.save();
  return adminUser(target);
}

export async function deleteAdmin(me: User, id: string) {
  const target = await otherAdmin(me, id);
  await assertAnotherSuperAdmin(target);
  await NotificationModel.deleteMany({ userId: target._id });
  await target.deleteOne();
  return { deleted: true };
}
