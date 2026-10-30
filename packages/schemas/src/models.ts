import type { AccountStatus, CompanyType, DealStage, ListingKind } from "./constants";

export interface UserAccount {
  id: string;
  companyName: string;
  companyType: CompanyType;
  country: string;
  contactName: string;
  email: string;
  phone: string;
  status: AccountStatus;
  rejectionReason?: string;
  createdAt: string;
  documents: { key: string; label: string; fileName: string }[];
}

export interface Listing {
  id: string;
  kind: ListingKind;
  product: string;
  category: string;
  specification: string;
  quantity: number;
  unit: string;
  price: string;
  location: string;
  deliveryTerms: string;
  paymentTerms: string;
  validUntil: string;
  companyId: string;
  /** Real company name stays hidden ("Verified Seller") until a deal is initiated. */
  companyAlias: string;
  country: string;
  status: "active" | "blocked" | "expired";
  createdAt: string;
}

export interface Enquiry {
  id: string;
  listingId: string;
  product: string;
  from: string;
  message: string;
  createdAt: string;
  status: "new" | "in-progress" | "closed";
}

export interface Deal {
  id: string;
  product: string;
  seller: string;
  buyer: string;
  value: number;
  currency: string;
  stage: DealStage | "cancelled";
  commissionPercent: number;
  commissionStatus: "not-applicable" | "due" | "paid";
  agreementAccepted: boolean;
  updatedAt: string;
}

export interface ReportData {
  totals: { users: number; listings: number; deals: number; commissionEarned: number };
  monthly: { month: string; users: number; deals: number; commission: number }[];
  byCategory: { name: string; listings: number }[];
}
