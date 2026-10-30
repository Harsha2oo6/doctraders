import { z } from "zod";
import { BUSINESS_TYPES, ENQUIRY_STATUSES, INDIAN_STATES, LISTING_KINDS, PAYMENT_METHODS, TRADE_ROLES, UNITS, UPLOAD_LIMITS } from "./constants";

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

/* ---------------- listings ---------------- */

/** Photos must be stored on our Vercel Blob store (uploaded through POST /uploads). */
export const BLOB_HOST_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;
const imageUrl = z.string().trim().regex(BLOB_HOST_RE, "Upload photos with the photo uploader");

const positive = (msg: string) => z.coerce.number({ invalid_type_error: msg }).positive(msg).max(1e12);
const optPositive = (msg: string) => z.preprocess(blank, positive(msg).optional());

const listingFields = {
  title: z.string({ required_error: "Enter a title" }).trim().min(5, "At least 5 characters").max(120, "Up to 120 characters"),
  category: z.string({ required_error: "Choose a category" }).trim().min(1, "Choose a category"),
  description: z.string({ required_error: "Describe the product" }).trim().min(10, "Add a few more details").max(3000),
  quantity: positive("Enter a quantity"),
  unit: z.enum(UNITS, { errorMap: () => ({ message: "Choose a unit" }) }),
  price: optPositive("Enter a price per unit"),
  minOrderQuantity: optPositive("Enter a minimum order"),
  city: z.string({ required_error: "Enter the city" }).trim().min(2, "Enter the city").max(100),
  state: stateField,
  images: z.array(imageUrl).max(UPLOAD_LIMITS.maxImagesPerListing, "Up to 6 photos").default([]),
};

function checkListing(v: { kind?: string; quantity?: number; minOrderQuantity?: number; images?: string[] }, ctx: z.RefinementCtx) {
  if (v.kind === "offer" && !v.images?.length) ctx.addIssue({ code: "custom", path: ["images"], message: "Add at least one photo" });
  if (v.minOrderQuantity && v.quantity && v.minOrderQuantity > v.quantity) {
    ctx.addIssue({ code: "custom", path: ["minOrderQuantity"], message: "Cannot be more than the quantity" });
  }
}

export const listingSchema = z.object({ kind: z.enum(LISTING_KINDS), ...listingFields }).superRefine(checkListing);
export type ListingInput = z.input<typeof listingSchema>;
export type ListingValues = z.output<typeof listingSchema>;

/** PATCH /listings/:id — any subset; `null` clears price / minOrderQuantity; owner may set active/closed. */
export const listingUpdateSchema = z
  .object({
    title: listingFields.title.optional(),
    category: listingFields.category.optional(),
    description: listingFields.description.optional(),
    quantity: listingFields.quantity.optional(),
    unit: listingFields.unit.optional(),
    price: z.union([z.null(), listingFields.price]).optional(),
    minOrderQuantity: z.union([z.null(), listingFields.minOrderQuantity]).optional(),
    city: listingFields.city.optional(),
    state: stateField.optional(),
    images: z.array(imageUrl).max(UPLOAD_LIMITS.maxImagesPerListing, "Up to 6 photos").optional(),
    status: z.enum(["active", "closed"]).optional(),
  })
  .strict();
export type ListingUpdateInput = z.input<typeof listingUpdateSchema>;
export { checkListing };

/* ---------------- enquiries & notifications ---------------- */

export const objectId = z.string().trim().regex(/^[a-f0-9]{24}$/i, "Invalid id");

/** POST /enquiries — "I'm interested". */
export const enquirySchema = z.object({
  listingId: objectId,
  quantity: positive("Enter the quantity you want"),
  message: optStr(1000),
});
export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

/** PATCH /admin/enquiries/:id — deal_closed is only set by creating a deal. */
export const enquiryStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES).refine((s) => s !== "deal_closed", "Use “Convert to deal” to close a deal"),
});

export const noteSchema = z.object({ text: z.string().trim().min(1, "Write a note").max(2000) });

export const notificationsReadSchema = z.object({ ids: z.array(objectId).max(200).optional() });

/* ---------------- deals, payments, shipments ---------------- */

const percentField = z.coerce.number({ invalid_type_error: "Enter a percent" }).min(0, "0 or more").max(100, "100 or less");

/** POST /admin/deals — convert an enquiry into a deal. */
export const dealCreateSchema = z.object({
  enquiryId: objectId,
  quantity: positive("Enter the deal quantity"),
  unit: z.enum(UNITS, { errorMap: () => ({ message: "Choose a unit" }) }),
  pricePerUnit: positive("Enter the price per unit"),
  commissionPercent: percentField,
  adminNotes: optStr(5000),
});
export type DealCreateInput = z.input<typeof dealCreateSchema>;
export type DealCreateValues = z.output<typeof dealCreateSchema>;

/** PATCH /admin/deals/:id — totals are recalculated from quantity × price and the percent. */
export const dealUpdateSchema = z
  .object({
    status: z.enum(["completed", "cancelled"]).optional(),
    commissionStatus: z.enum(["paid"]).optional(),
    quantity: positive("Enter the deal quantity").optional(),
    pricePerUnit: positive("Enter the price per unit").optional(),
    commissionPercent: percentField.optional(),
    adminNotes: z.union([z.null(), z.string().trim().max(5000)]).optional(),
  })
  .strict();
export type DealUpdateInput = z.input<typeof dealUpdateSchema>;

export const paymentSchema = z.object({
  amount: positive("Enter the amount"),
  method: z.preprocess(blank, z.enum(PAYMENT_METHODS).optional()),
  note: optStr(500),
  paidAt: z.preprocess(blank, z.coerce.date({ invalid_type_error: "Enter a valid date" }).refine((d) => d.getTime() <= Date.now() + 86_400_000, "Cannot be in the future").optional()),
});
export type PaymentInput = z.input<typeof paymentSchema>;
export type PaymentValues = z.output<typeof paymentSchema>;

export const shipmentCreateSchema = z.object({
  quantity: positive("Enter the quantity in this lot"),
  status: z.literal("packed").optional(),
  note: optStr(500),
});
export type ShipmentCreateInput = z.input<typeof shipmentCreateSchema>;
export type ShipmentCreateValues = z.output<typeof shipmentCreateSchema>;

export const shipmentUpdateSchema = z.object({
  status: z.enum(["shipped", "reached"], { errorMap: () => ({ message: "Status must be shipped or reached" }) }),
  note: optStr(500),
});

/* ---------------- admin: users, listings, categories, admins ---------------- */

const statusField = z.enum(["active", "blocked"], { errorMap: () => ({ message: "Status must be active or blocked" }) });

export const accountStatusSchema = z.object({ status: statusField });
export const listingStatusSchema = z.object({ status: statusField });

const categoryName = z.string({ required_error: "Enter a category name" }).trim().min(2, "At least 2 characters").max(60, "Up to 60 characters");

export const categoryCreateSchema = z.object({ name: categoryName });

export const categoryUpdateSchema = z
  .object({ name: categoryName.optional(), active: z.boolean().optional(), order: z.coerce.number().int().min(0).max(100000).optional() })
  .strict();
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

export const adminCreateSchema = z.object({
  name: z.string({ required_error: "Enter the full name" }).trim().min(2, "Enter the full name").max(100),
  email: emailField,
  mobile: mobileField,
  password: passwordField,
  superadmin: z.boolean().optional(),
});
export type AdminCreateInput = z.input<typeof adminCreateSchema>;
export type AdminCreateValues = z.output<typeof adminCreateSchema>;

export const adminUpdateSchema = z
  .object({ status: statusField.optional(), password: passwordField.optional(), superadmin: z.boolean().optional() })
  .strict();
export type AdminUpdateValues = z.infer<typeof adminUpdateSchema>;
