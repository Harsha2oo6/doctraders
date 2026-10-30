import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>Your name, mobile number, email and password (stored only as a secure hash), your business details (name, type, categories, address, GST number if you give it), and what you post: listings, photos, enquiries and shipment updates.</p>
      <h2>Who can see it</h2>
      <p>Your contact and business details are visible only to Doctraders administrators, who use them to contact you and handle your deals. Other members see your listings with an alias such as Seller #48213. Listings and their photos are public.</p>
      <h2>Your rights</h2>
      <p>We process personal data in line with India&apos;s Digital Personal Data Protection Act. You may request access, correction or deletion of your data.</p>
    </LegalPage>
  );
}
