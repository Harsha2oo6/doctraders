import { z } from "zod";
import { BUSINESS_TYPES, INDIAN_STATES, TRADE_ROLES } from "./constants";

/** Zod schemas shared by forms (client) and API routes (server). */

/** "" / null from a form → undefined, so optional fields can be left empty. */
const blank = (v: unknown) => (v === "" || v === null ? undefined : v);
const optStr = (max = 500) => z.preprocess(blank, z.string().trim().max(max).optional());

export const MOBILE_RE = /^[6-9]\d{9}$/;
export const PINCODE_RE = /^\d{6}$/;
export const GST_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

export const emailField = z.string().trim().toLowerCase().email("Enter a valid email");
export const mobileField = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=[6-9]\d{9}$)/, ""))
  .pipe(z.string().regex(MOBILE_RE, "Enter a 10-digit Indian mobile number"));
export const passwordField = z.string().min(8, "At least 8 characters").max(200);

const stateField = z.enum(INDIAN_STATES, { errorMap: () => ({ message: "Choose your state" }) });

/** Business fields; everything a buyer-only account needs is required here. */
export const businessSchema = z.object({
  name: z.string({ required_error: "Enter your business name" }).trim().min(2, "Enter your business name").max(200),
  type: z.preprocess(blank, z.enum(BUSINESS_TYPES, { errorMap: () => ({ message: "Choose a business type" }) }).optional()),
  categories: z.array(z.string().trim().min(1)).max(20).default([]),
  address: optStr(500),
  city: z.string({ required_error: "Enter your city" }).trim().min(2, "Enter your city").max(100),
  state: stateField,
  pincode: z.preprocess(blank, z.string().trim().regex(PINCODE_RE, "Enter a 6-digit pincode").optional()),
  gstNumber: z.preprocess(
    (v) => (typeof v === "string" ? blank(v.trim().toUpperCase()) : blank(v)),
    z.string().regex(GST_RE, "Enter a valid 15-character GST number").optional(),
  ),
  yearsInBusiness: z.preprocess(blank, z.coerce.number({ invalid_type_error: "Enter a number" }).int("Whole years only").min(0).max(150).optional()),
});
export type BusinessInput = z.input<typeof businessSchema>;
export type Business = z.output<typeof businessSchema>;

/** Extra rules when the account sells (README §1). Adds issues under `business.*`. */
export function checkSellerBusiness(b: Partial<Business> | undefined, ctx: z.RefinementCtx, path: (string | number)[] = ["business"]) {
  if (!b?.type) ctx.addIssue({ code: "custom", path: [...path, "type"], message: "Choose a business type" });
  if (!b?.categories?.length) ctx.addIssue({ code: "custom", path: [...path, "categories"], message: "Choose at least one category" });
  if (!b?.address || b.address.length < 5) ctx.addIssue({ code: "custom", path: [...path, "address"], message: "Enter your full address" });
  if (!b?.pincode) ctx.addIssue({ code: "custom", path: [...path, "pincode"], message: "Enter a 6-digit pincode" });
}

const rolesField = z
  .array(z.enum(TRADE_ROLES))
  .min(1, "Choose buy, sell or both")
  .max(2)
  .transform((r) => [...new Set(r)].sort() as ("buyer" | "seller")[]);

export const registerSchema = z
  .object({
    roles: rolesField,
    name: z.string({ required_error: "Enter your full name" }).trim().min(2, "Enter your full name").max(100),
    email: emailField,
    mobile: mobileField,
    password: passwordField,
    business: businessSchema,
  })
  .superRefine((v, ctx) => {
    if (v.roles.includes("seller")) checkSellerBusiness(v.business, ctx);
  });
export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;

const consent = (message: string) => z.literal(true, { errorMap: () => ({ message }) });

/** The register form = API body + consent checkboxes (not sent to the API). */
export const registerFormSchema = z
  .object({
    roles: rolesField,
    name: z.string().trim().min(2, "Enter your full name").max(100),
    email: emailField,
    mobile: mobileField,
    password: passwordField,
    business: businessSchema,
    acceptTerms: consent("You must accept the terms"),
    acceptPrivacy: consent("Consent is required"),
    acceptCommission: consent("You must accept the commission policy"),
  })
  .superRefine((v, ctx) => {
    if (v.roles.includes("seller")) checkSellerBusiness(v.business, ctx);
  });
export type RegisterFormInput = z.input<typeof registerFormSchema>;
export type RegisterFormValues = z.output<typeof registerFormSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or mobile number").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** PATCH /auth/me. `business` is merged into the saved one; `addRole` adds buyer or seller. */
export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(100).optional(),
    email: emailField.optional(),
    mobile: mobileField.optional(),
    business: businessSchema.partial().optional(),
    addRole: z.enum(TRADE_ROLES).optional(),
  })
  .strict();
export type UpdateMeInput = z.input<typeof updateMeSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordField,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({ email: emailField });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, "This reset link is invalid"),
  password: passwordField,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: emailField,
  message: z.string().trim().min(10, "Tell us a little more").max(5000),
});
export type ContactInput = z.infer<typeof contactSchema>;
