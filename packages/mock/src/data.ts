import type { Deal, Enquiry, Listing, ReportData, UserAccount } from "@doctraders/schemas";

/** Fake data. Replace by real API responses when the backend exists. */
export const users: UserAccount[] = [
  {
    id: "u1", companyName: "Sunrise Agro Exports", companyType: "seller", country: "India",
    contactName: "Rakesh Mehta", email: "rakesh@sunriseagro.example", phone: "+91 98765 43210",
    status: "pending", createdAt: "2026-10-12",
    documents: [
      { key: "registration", label: "Business registration", fileName: "incorporation.pdf" },
      { key: "tax", label: "GST / PAN / Tax ID", fileName: "gst-certificate.pdf" },
      { key: "iec", label: "IEC", fileName: "iec.pdf" },
      { key: "bank", label: "Bank proof", fileName: "cancelled-cheque.jpg" },
    ],
  },
  {
    id: "u2", companyName: "Gulf Foods Trading LLC", companyType: "buyer", country: "United Arab Emirates",
    contactName: "Omar Al Farsi", email: "omar@gulffoods.example", phone: "+971 50 123 4567",
    status: "approved", createdAt: "2026-09-28",
    documents: [
      { key: "registration", label: "Business registration", fileName: "trade-licence.pdf" },
      { key: "tax", label: "GST / PAN / Tax ID", fileName: "trn.pdf" },
      { key: "bank", label: "Bank proof", fileName: "bank-letter.pdf" },
    ],
  },
  {
    id: "u3", companyName: "Bharat Steel Mills", companyType: "seller", country: "India",
    contactName: "Anil Kapoor", email: "anil@bharatsteel.example", phone: "+91 99887 66554",
    status: "approved", createdAt: "2026-09-15",
    documents: [
      { key: "registration", label: "Business registration", fileName: "coi.pdf" },
      { key: "tax", label: "GST / PAN / Tax ID", fileName: "gst.pdf" },
      { key: "bank", label: "Bank proof", fileName: "bank.pdf" },
    ],
  },
  {
    id: "u4", companyName: "BlueWave Freight", companyType: "logistics", country: "India",
    contactName: "Sneha Rao", email: "sneha@bluewave.example", phone: "+91 90000 11122",
    status: "pending", createdAt: "2026-10-14",
    documents: [
      { key: "registration", label: "Business registration", fileName: "coi.pdf" },
      { key: "licence", label: "Freight / customs licence", fileName: "cha-licence.pdf" },
    ],
  },
  {
    id: "u5", companyName: "QuickTrade Agents", companyType: "buyer", country: "Bangladesh",
    contactName: "Imran Hossain", email: "imran@quicktrade.example", phone: "+880 1711 000000",
    status: "rejected", rejectionReason: "Registered as an agent, not a direct buyer.",
    createdAt: "2026-10-01", documents: [],
  },
];

export const listings: Listing[] = [
  {
    id: "l1", kind: "offer", product: "Basmati Rice 1121 Steam", category: "agro",
    specification: "Extra long grain, 8.3mm avg, broken max 1%", quantity: 500, unit: "MT",
    price: "₹92,400 / MT", location: "Mundra Port, India", deliveryTerms: "FOB",
    paymentTerms: "LC at sight", validUntil: "2026-11-30", companyId: "u3",
    companyAlias: "Verified Seller #3021", country: "India", status: "active", createdAt: "2026-10-10",
  },
  {
    id: "l2", kind: "requirement", product: "Refined Sunflower Oil", category: "food",
    specification: "Bottling grade, FFA max 0.1%, 1L PET packing", quantity: 40, unit: "Container",
    price: "On request", location: "Jebel Ali, UAE", deliveryTerms: "CIF",
    paymentTerms: "30 days credit", validUntil: "2026-12-15", companyId: "u2",
    companyAlias: "Verified Buyer #1187", country: "United Arab Emirates", status: "active", createdAt: "2026-10-11",
  },
  {
    id: "l3", kind: "offer", product: "TMT Steel Bars Fe500D", category: "metals",
    specification: "8mm to 32mm, BIS certified", quantity: 1200, unit: "MT",
    price: "₹51,900 / MT", location: "Kolkata Port, India", deliveryTerms: "FOB",
    paymentTerms: "Advance", validUntil: "2026-11-20", companyId: "u3",
    companyAlias: "Verified Seller #3021", country: "India", status: "active", createdAt: "2026-10-09",
  },
  {
    id: "l4", kind: "requirement", product: "Yellow Peas", category: "agro",
    specification: "Whole, moisture max 12%, 99% purity", quantity: 2000, unit: "MT",
    price: "₹37,800 / MT", location: "Nhava Sheva, India", deliveryTerms: "CFR",
    paymentTerms: "LC at sight", validUntil: "2026-12-01", companyId: "u2",
    companyAlias: "Verified Buyer #1187", country: "India", status: "blocked", createdAt: "2026-10-08",
  },
  {
    id: "l5", kind: "offer", product: "Raw Cotton Bales", category: "textiles",
    specification: "Shankar-6, staple 29mm, micronaire 4.2", quantity: 300, unit: "MT",
    price: "On request", location: "Chennai Port, India", deliveryTerms: "FOB",
    paymentTerms: "60 days credit", validUntil: "2026-12-20", companyId: "u1",
    companyAlias: "Verified Seller #2044", country: "India", status: "active", createdAt: "2026-10-13",
  },
  {
    id: "l6", kind: "offer", product: "Turmeric Fingers (Salem)", category: "agro",
    specification: "Curcumin 3.5%, polished, moisture max 10%", quantity: 80, unit: "MT",
    price: "₹1,56,600 / MT", location: "Tuticorin Port, India", deliveryTerms: "FOB",
    paymentTerms: "LC at sight", validUntil: "2026-12-10", companyId: "u1",
    companyAlias: "Verified Seller #2044", country: "India", status: "active", createdAt: "2026-10-12",
  },
  {
    id: "l7", kind: "offer", product: "Refined Cane Sugar ICUMSA 45", category: "food",
    specification: "Crystal white, 50kg PP bags, 24 month shelf life", quantity: 1500, unit: "MT",
    price: "₹45,800 / MT", location: "Kandla Port, India", deliveryTerms: "CIF",
    paymentTerms: "LC at sight", validUntil: "2026-11-25", companyId: "u3",
    companyAlias: "Verified Seller #1760", country: "India", status: "active", createdAt: "2026-10-11",
  },
  {
    id: "l8", kind: "requirement", product: "Copper Cathode Grade A", category: "metals",
    specification: "99.99% purity, LME registered brand", quantity: 250, unit: "MT",
    price: "On request", location: "Jebel Ali, UAE", deliveryTerms: "CIF",
    paymentTerms: "LC at sight", validUntil: "2026-12-05", companyId: "u2",
    companyAlias: "Verified Buyer #0932", country: "United Arab Emirates", status: "active", createdAt: "2026-10-10",
  },
  {
    id: "l9", kind: "offer", product: "HDPE Woven Sacks", category: "industrial",
    specification: "50kg capacity, UV stabilised, printed", quantity: 20, unit: "Container",
    price: "₹16 / piece", location: "Mundra Port, India", deliveryTerms: "FOB",
    paymentTerms: "30 days credit", validUntil: "2027-01-15", companyId: "u3",
    companyAlias: "Verified Seller #3388", country: "India", status: "active", createdAt: "2026-10-09",
  },
  {
    id: "l10", kind: "requirement", product: "Whole Wheat Grain", category: "agro",
    specification: "Milling quality, protein min 11.5%, moisture max 12%", quantity: 5000, unit: "MT",
    price: "₹27,300 / MT", location: "Chittagong Port, Bangladesh", deliveryTerms: "CFR",
    paymentTerms: "LC at sight", validUntil: "2026-12-18", companyId: "u2",
    companyAlias: "Verified Buyer #0411", country: "Bangladesh", status: "active", createdAt: "2026-10-12",
  },
  {
    id: "l11", kind: "requirement", product: "Cotton Yarn 30s Combed", category: "textiles",
    specification: "100% cotton, ring spun, cones packing", quantity: 60, unit: "MT",
    price: "On request", location: "Hai Phong Port, Vietnam", deliveryTerms: "CIF",
    paymentTerms: "60 days credit", validUntil: "2026-12-30", companyId: "u2",
    companyAlias: "Verified Buyer #1502", country: "Vietnam", status: "active", createdAt: "2026-10-11",
  },
  {
    id: "l12", kind: "requirement", product: "Aluminium Ingots A7", category: "metals",
    specification: "99.7% purity, 20kg ingots, bundled", quantity: 400, unit: "MT",
    price: "₹2,06,800 / MT", location: "Colombo Port, Sri Lanka", deliveryTerms: "CFR",
    paymentTerms: "LC at sight", validUntil: "2027-01-10", companyId: "u2",
    companyAlias: "Verified Buyer #0877", country: "Sri Lanka", status: "active", createdAt: "2026-10-10",
  },
];

export const enquiries: Enquiry[] = [
  { id: "e1", listingId: "l1", product: "Basmati Rice 1121 Steam", from: "Verified Buyer #1187", message: "Interested in 200 MT monthly. Please share sample details.", createdAt: "2026-10-14", status: "new" },
  { id: "e2", listingId: "l3", product: "TMT Steel Bars Fe500D", from: "Verified Buyer #0932", message: "Can you supply to Chittagong on CFR terms?", createdAt: "2026-10-13", status: "in-progress" },
  { id: "e3", listingId: "l5", product: "Raw Cotton Bales", from: "Verified Buyer #0411", message: "Need test certificate before we proceed.", createdAt: "2026-10-10", status: "closed" },
];

export const deals: Deal[] = [
  { id: "d1", product: "Basmati Rice 1121 Steam", seller: "Bharat Steel Mills", buyer: "Gulf Foods Trading LLC", value: 46200000, currency: "INR", stage: "negotiation", commissionPercent: 1.5, commissionStatus: "not-applicable", agreementAccepted: false, updatedAt: "2026-10-14" },
  { id: "d2", product: "TMT Steel Bars Fe500D", seller: "Bharat Steel Mills", buyer: "Dhaka Builders Ltd", value: 62304000, currency: "INR", stage: "agreement", commissionPercent: 1.0, commissionStatus: "not-applicable", agreementAccepted: true, updatedAt: "2026-10-12" },
  { id: "d3", product: "Refined Sunflower Oil", seller: "Sunrise Agro Exports", buyer: "Gulf Foods Trading LLC", value: 105600000, currency: "INR", stage: "completed", commissionPercent: 1.25, commissionStatus: "due", agreementAccepted: true, updatedAt: "2026-10-05" },
  { id: "d4", product: "Raw Cotton Bales", seller: "Sunrise Agro Exports", buyer: "Hanoi Textiles JSC", value: 29920000, currency: "INR", stage: "completed", commissionPercent: 1.5, commissionStatus: "paid", agreementAccepted: true, updatedAt: "2026-09-22" },
];

export const report: ReportData = {
  totals: { users: 128, listings: 342, deals: 27, commissionEarned: 4246000 },
  monthly: [
    { month: "May", users: 12, deals: 2, commission: 281600 },
    { month: "Jun", users: 18, deals: 3, commission: 448800 },
    { month: "Jul", users: 22, deals: 4, commission: 651200 },
    { month: "Aug", users: 25, deals: 6, commission: 862400 },
    { month: "Sep", users: 27, deals: 5, commission: 893200 },
    { month: "Oct", users: 24, deals: 7, commission: 1108800 },
  ],
  byCategory: [
    { name: "Agro", listings: 120 },
    { name: "Food", listings: 64 },
    { name: "Metals", listings: 71 },
    { name: "Industrial", listings: 38 },
    { name: "Textiles", listings: 33 },
    { name: "Logistics", listings: 16 },
  ],
};
