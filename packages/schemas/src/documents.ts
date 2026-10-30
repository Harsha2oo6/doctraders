import type { CompanyType } from "./constants";

export interface DocumentRequirement {
  key: string;
  label: string;
  hint: string;
  required: boolean;
}

/**
 * The exact documents required per company type. This single list drives the upload form,
 * so editing it here changes registration everywhere. Confirm the final list with your lawyer.
 */
export const DOCUMENT_REQUIREMENTS: Record<CompanyType, DocumentRequirement[]> = {
  seller: [
    { key: "registration", label: "Business registration", hint: "Certificate of incorporation or equivalent", required: true },
    { key: "tax", label: "GST / PAN / Tax ID", hint: "Tax registration of the company", required: true },
    { key: "iec", label: "IEC (Indian exporters)", hint: "Import Export Code", required: false },
    { key: "licence", label: "FSSAI or product licence", hint: "Needed for food and regulated products", required: false },
    { key: "bank", label: "Bank proof", hint: "Cancelled cheque or bank letter", required: true },
  ],
  buyer: [
    { key: "registration", label: "Business registration", hint: "Certificate of incorporation or equivalent", required: true },
    { key: "tax", label: "GST / PAN / Tax ID", hint: "Tax registration of the company", required: true },
    { key: "iec", label: "IEC (Indian importers)", hint: "Import Export Code", required: false },
    { key: "bank", label: "Bank proof", hint: "Cancelled cheque or bank letter", required: true },
  ],
  logistics: [
    { key: "registration", label: "Business registration", hint: "Certificate of incorporation or equivalent", required: true },
    { key: "tax", label: "GST / PAN / Tax ID", hint: "Tax registration of the company", required: true },
    { key: "licence", label: "Freight / customs licence", hint: "CHA, freight forwarder or shipping licence", required: true },
    { key: "bank", label: "Bank proof", hint: "Cancelled cheque or bank letter", required: true },
  ],
};
