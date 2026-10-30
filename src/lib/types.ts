import type {
  CommissionStatus, DealStatus, EnquiryPartyStatus, EnquiryStatus, ListingKind, ListingStatus, PaymentMethod,
  ShipmentStatus, TradeRole, Unit,
} from "./constants";

/** Response shapes of /api/v1 (mirrors src/server/serializers.ts; documented in docs/API.md). */

export interface PublicListing {
  id: string;
  kind: ListingKind;
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: Unit;
  price: number | null;
  minOrderQuantity: number | null;
  city: string;
  state: string;
  images: string[];
  status: ListingStatus;
  owner: { alias: string };
  createdAt: string;
  updatedAt: string;
}

export interface ContactCard {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: "active" | "blocked";
  publicCode: string | null;
  businessName: string | null;
  businessType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  gstNumber: string | null;
}

export interface AdminListing extends Omit<PublicListing, "owner"> {
  enquiryCount: number;
  owner: { alias: string } & ContactCard;
}

export interface PartyEnquiry {
  id: string;
  listingId: string;
  listingKind: ListingKind;
  listingTitle: string;
  quantity: number;
  message: string | null;
  myRole: TradeRole;
  counterparty: { alias: string };
  status: EnquiryPartyStatus;
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEnquiry {
  id: string;
  listingId: string;
  listingKind: ListingKind;
  listingTitle: string;
  listing: AdminListing | null;
  fromUserId: string;
  fromRole: TradeRole;
  quantity: number;
  message: string | null;
  status: EnquiryStatus;
  buyer: ContactCard | null;
  seller: ContactCard | null;
  notes: { id: string; text: string; byId: string; byName: string; at: string }[];
  statusHistory: { status: EnquiryStatus; byId: string; at: string }[];
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DealProgress {
  paidAmount: number;
  paidPercent: number;
  balanceAmount: number;
  allocatedQuantity: number;
  remainingQuantity: number;
  shippedQuantity: number;
  shippedPercent: number;
  reachedQuantity: number;
  reachedPercent: number;
}

export interface Shipment {
  id: string;
  quantity: number;
  status: ShipmentStatus;
  note: string | null;
  history: { status: ShipmentStatus; at: string; byId?: string }[];
  createdAt: string;
}

export interface PartyDeal extends DealProgress {
  id: string;
  code: string;
  title: string;
  listingId: string;
  myRole: TradeRole;
  counterparty: { alias: string };
  quantity: number;
  unit: Unit;
  pricePerUnit: number;
  totalValue: number;
  status: DealStatus;
  payments: { id: string; amount: number; method: PaymentMethod | null; paidAt: string }[];
  shipments: Shipment[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminDeal extends DealProgress {
  id: string;
  code: string;
  enquiryId: string;
  listingId: string;
  title: string;
  buyerId: string;
  sellerId: string;
  buyer: ContactCard | null;
  seller: ContactCard | null;
  quantity: number;
  unit: Unit;
  pricePerUnit: number;
  totalValue: number;
  commissionPercent: number;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  status: DealStatus;
  adminNotes: string | null;
  payments: { id: string; amount: number; method: PaymentMethod | null; note: string | null; paidAt: string; byId: string }[];
  shipments: Shipment[];
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
}
