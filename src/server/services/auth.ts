import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import {
  businessSchema, checkSellerBusiness, MOBILE_RE,
  type ChangePasswordInput, type RegisterValues, type ResetPasswordInput,
} from "@/lib/validation";
import { hashPassword, verifyPassword } from "../auth";
import { appUrl, layout, sendEmail } from "../email";
import { isAdmin } from "../guard";
import { HttpError } from "../http";
import { later } from "../later";
import { UserModel, type User } from "../models";
import { activeCategorySlugs } from "./categories";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

async function assertUnique(email: string | undefined, mobile: string | undefined, exceptId?: string) {
  const fields: Record<string, string> = {};
  const not = exceptId ? { _id: { $ne: exceptId } } : {};
  if (email && (await UserModel.exists({ email, ...not }))) fields.email = "This email is already registered";
  if (mobile && (await UserModel.exists({ mobile, ...not }))) fields.mobile = "This mobile number is already registered";
  if (Object.keys(fields).length) throw new HttpError(409, Object.values(fields)[0]!, fields);
}

async function assertCategories(slugs: string[] | undefined) {
  if (!slugs?.length) return;
  const active = await activeCategorySlugs();
  const bad = slugs.filter((s) => !active.has(s));
  if (bad.length) throw new HttpError(400, "Choose categories from the list", { "business.categories": "Choose categories from the list" });
}

export async function register(input: RegisterValues): Promise<User> {
  await assertUnique(input.email, input.mobile);
  await assertCategories(input.business.categories);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    passwordHash: await hashPassword(input.password),
    roles: input.roles,
    status: "active",
    business: input.business,
    lastLoginAt: new Date(),
  });
  const mail = layout({
    title: `Welcome to Doctraders, ${user.name}`,
    paragraphs: [
      "Your account is active. You can post what you sell or what you need, and show interest in other listings.",
      "When you click \"I'm interested\", the Doctraders team contacts both sides and handles the deal. Contact details stay private.",
    ],
    button: { label: "Go to your dashboard", url: appUrl("/dashboard") },
  });
  later(() => sendEmail({ to: user.email, subject: "Welcome to Doctraders", ...mail }));
  return user;
}

export async function login(identifier: string, password: string): Promise<User> {
  const id = identifier.trim().toLowerCase();
  const digits = id.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, "");
  const query = id.includes("@") ? { email: id } : MOBILE_RE.test(digits) ? { mobile: digits } : null;
  const user = query ? await UserModel.findOne(query) : null;
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new HttpError(401, "Incorrect email/mobile or password.");
  }
  if (user.status === "blocked") throw new HttpError(403, "Your account is blocked. Please contact support.");
  user.lastLoginAt = new Date();
  await user.save();
  return user;
}

const sellerCheck = z.object({ business: businessSchema.partial() }).superRefine((v, ctx) => checkSellerBusiness(v.business, ctx));
const traderCheck = z.object({ business: businessSchema });

export async function updateMe(
  user: User,
  input: { name?: string; email?: string; mobile?: string; business?: Partial<RegisterValues["business"]>; addRole?: "buyer" | "seller" },
): Promise<User> {
  const admin = isAdmin(user);
  if (admin && (input.addRole || input.business)) {
    throw new HttpError(403, "Admin accounts cannot have buyer or seller details.");
  }
  await assertUnique(input.email !== user.email ? input.email : undefined, input.mobile !== user.mobile ? input.mobile : undefined, String(user._id));

  if (input.name) user.name = input.name;
  if (input.email) user.email = input.email;
  if (input.mobile) user.mobile = input.mobile;

  if (!admin) {
    const roles = new Set(user.roles);
    if (input.addRole) roles.add(input.addRole);
    const current = user.business ? (user.business as unknown as { toObject?: () => object }).toObject?.() ?? user.business : {};
    const merged = { ...current, ...stripUndefined(input.business ?? {}) };
    // Validate the merged business against the rules of the final roles (adding "seller" needs seller fields).
    traderCheck.parse({ business: merged });
    if (roles.has("seller")) sellerCheck.parse({ business: merged });
    await assertCategories(input.business?.categories);
    user.set("business", businessSchema.parse(merged));
    user.roles = [...roles];
  }
  await user.save();
  return user;
}

function stripUndefined<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export async function changePassword(user: User, input: ChangePasswordInput) {
  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw new HttpError(400, "Your current password is not correct.", { currentPassword: "Not correct" });
  }
  user.passwordHash = await hashPassword(input.newPassword);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
}

/** Always succeeds (never reveals whether the email exists). */
export async function forgotPassword(email: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || user.status !== "active") return;
  const token = randomBytes(32).toString("hex");
  user.resetTokenHash = sha256(token);
  user.resetTokenExpires = new Date(Date.now() + RESET_TTL_MS);
  await user.save();
  const mail = layout({
    title: "Reset your password",
    paragraphs: ["Someone asked to reset the password of your Doctraders account. The link works for 1 hour.", "If it was not you, ignore this email."],
    button: { label: "Choose a new password", url: appUrl(`/reset-password?token=${token}`) },
  });
  later(() => sendEmail({ to: user.email, subject: "Reset your Doctraders password", ...mail }));
}

export async function resetPassword(input: ResetPasswordInput) {
  const user = await UserModel.findOne({ resetTokenHash: sha256(input.token), resetTokenExpires: { $gt: new Date() } });
  if (!user) throw new HttpError(400, "This reset link is invalid or has expired. Please ask for a new one.", { token: "Invalid or expired" });
  user.passwordHash = await hashPassword(input.password);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
}
