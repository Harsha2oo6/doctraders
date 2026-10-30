import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <h2>1. Who may use Doctraders</h2>
      <p>Only verified direct buyers, direct sellers and logistics providers. Brokers, agents and other intermediaries are not permitted.</p>
      <h2>2. Verification</h2>
      <p>Accounts are Pending, Approved or Rejected. Members cannot post listings or view contact details until approved.</p>
      <h2>3. Commission and anti-bypass</h2>
      <p>Parties introduced through the platform agree to pay commission on any deal with each other, even if they later deal directly.</p>
      <h2>4. No guarantee</h2>
      <p>Doctraders verifies documents but does not guarantee any deal and does not hold or handle payments between parties.</p>
    </LegalPage>
  );
}
