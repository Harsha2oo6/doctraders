import { z } from "zod";
import { DELIVERY_TERMS, LISTING_KINDS, PAYMENT_TERMS, UNITS } from "./constants";

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
