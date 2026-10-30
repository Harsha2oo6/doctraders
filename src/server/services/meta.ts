import "server-only";
import {
  ACCOUNT_STATUS_LABELS, BUSINESS_TYPE_LABELS, COMMISSION_STATUS_LABELS, DEAL_STATUS_LABELS,
  ENQUIRY_PARTY_STATUS, ENQUIRY_PARTY_STATUS_LABELS, ENQUIRY_STATUS_LABELS, INDIAN_STATES, LISTING_KIND_LABELS,
  LISTING_STATUS_LABELS, MIN_APP_VERSION, PAYMENT_METHOD_LABELS, ROLE_LABELS, SHIPMENT_STATUS_LABELS, UNIT_LABELS,
  UPLOAD_LIMITS,
} from "@/lib/constants";
import { listActiveCategories } from "./categories";

/** Turns { key: label } into [{ key, label }] (keeps order, easy for dropdowns in the app). */
const list = (labels: Record<string, string>) => Object.entries(labels).map(([key, label]) => ({ key, label }));

export async function getMeta() {
  return {
    roles: list(ROLE_LABELS),
    accountStatuses: list(ACCOUNT_STATUS_LABELS),
    businessTypes: list(BUSINESS_TYPE_LABELS),
    units: list(UNIT_LABELS),
    states: [...INDIAN_STATES],
    listingKinds: list(LISTING_KIND_LABELS),
    listingStatuses: list(LISTING_STATUS_LABELS),
    enquiryStatuses: list(ENQUIRY_STATUS_LABELS),
    enquiryPartyStatuses: list(ENQUIRY_PARTY_STATUS_LABELS),
    enquiryPartyStatusMap: ENQUIRY_PARTY_STATUS,
    dealStatuses: list(DEAL_STATUS_LABELS),
    commissionStatuses: list(COMMISSION_STATUS_LABELS),
    shipmentStatuses: list(SHIPMENT_STATUS_LABELS),
    paymentMethods: list(PAYMENT_METHOD_LABELS),
    categories: await listActiveCategories(),
    uploads: {
      maxBytes: UPLOAD_LIMITS.maxBytes,
      mimeTypes: [...UPLOAD_LIMITS.mimeTypes],
      maxImagesPerListing: UPLOAD_LIMITS.maxImagesPerListing,
    },
    minAppVersion: MIN_APP_VERSION,
  };
}
