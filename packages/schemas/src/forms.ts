import { z } from "zod";
import {
  COMPANY_TYPES, COUNTRIES, DELIVERY_TERMS, LISTING_KINDS, PAYMENT_TERMS, UNITS,
} from "./constants";

export const accountStepSchema = z
  .object({
    contactName: z.string().min(2, "Enter the contact person name"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(8, "Enter a valid phone number"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type AccountStep = z.infer<typeof accountStepSchema>;

export const companyStepSchema = z.object({
  companyName: z.string().min(2, "Enter the company name"),
  companyType: z.enum(COMPANY_TYPES, { errorMap: () => ({ message: "Choose a company type" }) }),
  country: z.enum(COUNTRIES, { errorMap: () => ({ message: "Choose a country" }) }),
  isDirectParty: z.literal(true, {
    errorMap: () => ({ message: "Brokers and agents are not allowed to register" }),
  }),
});
export type CompanyStep = z.infer<typeof companyStepSchema>;

/** requirement key -> file name (real file upload is added with the backend) */
export type UploadedFiles = Record<string, string>;

export const consentSchema = z.object({
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "Consent is required" }) }),
  acceptCommission: z.literal(true, {
    errorMap: () => ({ message: "You must accept the commission policy" }),
  }),
});
export type ConsentStep = z.infer<typeof consentSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const listingSchema = z.object({
  kind: z.enum(LISTING_KINDS),
  product: z.string().min(2, "Enter the product"),
  category: z.string().min(1, "Choose a category"),
  specification: z.string().min(5, "Add a short specification"),
  quantity: z.coerce.number().positive("Enter a quantity"),
  unit: z.enum(UNITS),
  price: z.string().optional(),
  priceOnRequest: z.boolean(),
  location: z.string().min(2, "Enter a port or location"),
  deliveryTerms: z.enum(DELIVERY_TERMS),
  paymentTerms: z.enum(PAYMENT_TERMS),
  validUntil: z.string().min(1, "Choose a validity date"),
});
export type ListingInput = z.input<typeof listingSchema>;
export type ListingValues = z.output<typeof listingSchema>;

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Tell us a little more"),
});
export type ContactInput = z.infer<typeof contactSchema>;
