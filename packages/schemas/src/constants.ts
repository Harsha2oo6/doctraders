export const COMPANY_TYPES = ["seller", "buyer", "logistics"] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

export const COMPANY_TYPE_LABEL: Record<CompanyType, string> = {
  seller: "Seller (manufacturer, mill, exporter)",
  buyer: "Buyer (importer, processor, trader for own use)",
  logistics: "Logistics provider",
};

export const COUNTRIES = [
  "India", "United Arab Emirates", "Saudi Arabia", "Bangladesh", "Sri Lanka", "Nepal",
  "Vietnam", "Indonesia", "Egypt", "Turkey", "Kenya", "Other",
] as const;

export const CATEGORIES = [
  { slug: "agro", name: "Agro Products", examples: "Rice, wheat, pulses, spices, oilseeds" },
  { slug: "food", name: "Food & Beverage", examples: "Edible oils, sugar, processed food" },
  { slug: "metals", name: "Metals & Minerals", examples: "Steel, aluminium, copper, ores" },
  { slug: "industrial", name: "Industrial Goods", examples: "Machinery, chemicals, packaging" },
  { slug: "textiles", name: "Textiles", examples: "Cotton, yarn, fabric, garments" },
  { slug: "logistics", name: "Logistics Services", examples: "Freight, warehousing, customs" },
] as const;

export const LISTING_KINDS = ["requirement", "offer"] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const ACCOUNT_STATUSES = ["pending", "approved", "rejected"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const DEAL_STAGES = ["enquiry", "negotiation", "agreement", "shipped", "completed"] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const DELIVERY_TERMS = ["FOB", "CIF", "CFR", "EXW", "DAP", "Other"] as const;
export const PAYMENT_TERMS = ["Advance", "LC at sight", "30 days credit", "60 days credit", "Other"] as const;
export const UNITS = ["MT", "KG", "Litre", "Piece", "Container"] as const;
