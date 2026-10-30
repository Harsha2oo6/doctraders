/**
 * Every enum in the app, with labels. Client-safe. The API returns keys; labels are served
 * by GET /api/v1/meta so the mobile app never hard-codes them.
 */

type Labels<T extends readonly string[]> = Record<T[number], string>;

export const ROLES = ["buyer", "seller", "admin", "superadmin"] as const;
export type Role = (typeof ROLES)[number];
export const TRADE_ROLES = ["buyer", "seller"] as const;
export type TradeRole = (typeof TRADE_ROLES)[number];
export const ROLE_LABELS: Labels<typeof ROLES> = {
  buyer: "Buyer",
  seller: "Seller",
  admin: "Admin",
  superadmin: "Super admin",
};

export const ACCOUNT_STATUSES = ["active", "blocked"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];
export const ACCOUNT_STATUS_LABELS: Labels<typeof ACCOUNT_STATUSES> = { active: "Active", blocked: "Blocked" };

export const BUSINESS_TYPES = [
  "manufacturer", "farmer", "trader", "wholesaler", "distributor", "processor", "retailer", "exporter", "other",
] as const;
export type BusinessType = (typeof BUSINESS_TYPES)[number];
export const BUSINESS_TYPE_LABELS: Labels<typeof BUSINESS_TYPES> = {
  manufacturer: "Manufacturer",
  farmer: "Farmer",
  trader: "Trader",
  wholesaler: "Wholesaler",
  distributor: "Distributor",
  processor: "Processor",
  retailer: "Retailer",
  exporter: "Exporter",
  other: "Other",
};

export const UNITS = ["kg", "quintal", "tonne", "bag", "piece", "box", "litre", "other"] as const;
export type Unit = (typeof UNITS)[number];
export const UNIT_LABELS: Labels<typeof UNITS> = {
  kg: "kg",
  quintal: "quintal",
  tonne: "tonne",
  bag: "bag",
  piece: "piece",
  box: "box",
  litre: "litre",
  other: "unit",
};

export const LISTING_KINDS = ["offer", "requirement"] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];
export const LISTING_KIND_LABELS: Labels<typeof LISTING_KINDS> = { offer: "Offer", requirement: "Requirement" };

export const LISTING_STATUSES = ["active", "closed", "blocked"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
export const LISTING_STATUS_LABELS: Labels<typeof LISTING_STATUSES> = {
  active: "Live",
  closed: "Closed",
  blocked: "Blocked by admin",
};

export const ENQUIRY_STATUSES = ["new", "contacted", "spoken", "negotiating", "deal_closed", "dropped"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];
export const ENQUIRY_STATUS_LABELS: Labels<typeof ENQUIRY_STATUSES> = {
  new: "New",
  contacted: "Contacted",
  spoken: "Spoken",
  negotiating: "Negotiating",
  deal_closed: "Deal closed",
  dropped: "Dropped",
};

/** What buyers and sellers see instead of the admin's working status. */
export const ENQUIRY_PARTY_STATUSES = ["received", "in_discussion", "deal_done", "closed"] as const;
export type EnquiryPartyStatus = (typeof ENQUIRY_PARTY_STATUSES)[number];
export const ENQUIRY_PARTY_STATUS_LABELS: Labels<typeof ENQUIRY_PARTY_STATUSES> = {
  received: "Received",
  in_discussion: "In discussion",
  deal_done: "Deal done",
  closed: "Closed",
};
export const ENQUIRY_PARTY_STATUS: Record<EnquiryStatus, EnquiryPartyStatus> = {
  new: "received",
  contacted: "in_discussion",
  spoken: "in_discussion",
  negotiating: "in_discussion",
  deal_closed: "deal_done",
  dropped: "closed",
};

export const DEAL_STATUSES = ["active", "completed", "cancelled"] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];
export const DEAL_STATUS_LABELS: Labels<typeof DEAL_STATUSES> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const COMMISSION_STATUSES = ["pending", "due", "paid"] as const;
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number];
export const COMMISSION_STATUS_LABELS: Labels<typeof COMMISSION_STATUSES> = { pending: "Pending", due: "Due", paid: "Paid" };

export const SHIPMENT_STATUSES = ["packed", "shipped", "reached"] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];
export const SHIPMENT_STATUS_LABELS: Labels<typeof SHIPMENT_STATUSES> = {
  packed: "Packed",
  shipped: "Shipped",
  reached: "Reached",
};

export const PAYMENT_METHODS = ["bank", "upi", "cash", "cheque", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABELS: Labels<typeof PAYMENT_METHODS> = {
  bank: "Bank transfer",
  upi: "UPI",
  cash: "Cash",
  cheque: "Cheque",
  other: "Other",
};

export const NOTIFICATION_TYPES = [
  "enquiry_new", "deal_created", "payment_added", "shipment_update", "deal_completed", "system",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
] as const;

/** Seeded categories. `examples` is display text only (not stored in the DB). */
export const DEFAULT_CATEGORIES = [
  { slug: "rice-grains", name: "Rice & Grains", examples: "Basmati, non-basmati, wheat, maize, millets" },
  { slug: "pulses", name: "Pulses", examples: "Toor, chana, moong, urad, masoor" },
  { slug: "spices", name: "Spices", examples: "Turmeric, chilli, cumin, coriander, pepper" },
  { slug: "oilseeds-edible-oil", name: "Oilseeds & Edible Oil", examples: "Groundnut, mustard, soybean, sunflower oil" },
  { slug: "fruits-vegetables", name: "Fruits & Vegetables", examples: "Onion, potato, tomato, mango, banana" },
  { slug: "sugar-jaggery", name: "Sugar & Jaggery", examples: "Sugar S-30, M-30, jaggery, khandsari" },
  { slug: "dry-fruits-nuts", name: "Dry Fruits & Nuts", examples: "Cashew, almond, raisins, walnut" },
  { slug: "tea-coffee", name: "Tea & Coffee", examples: "CTC tea, orthodox tea, arabica, robusta" },
  { slug: "animal-feed", name: "Animal Feed", examples: "DOC, cattle feed, poultry feed, bran" },
  { slug: "fertilizers-seeds", name: "Fertilizers & Seeds", examples: "Organic manure, seeds, bio-fertilizers" },
  { slug: "other", name: "Other", examples: "Anything else you trade" },
] as const;

export const CATEGORY_EXAMPLES: Record<string, string> = Object.fromEntries(
  DEFAULT_CATEGORIES.map((c) => [c.slug, c.examples]),
);

export const UPLOAD_LIMITS = {
  maxBytes: 4 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxImagesPerListing: 6,
} as const;

export const MIN_APP_VERSION = "1.0.0";

/** "Seller #48213" / "Buyer #48213". */
export function aliasFor(role: TradeRole, publicCode: string): string {
  return `${role === "seller" ? "Seller" : "Buyer"} #${publicCode}`;
}
