import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms and Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <h2>1. Who may use Doctraders</h2>
      <p>Businesses and individuals buying or selling agro products. Accounts are active on registration. Doctraders does not check documents and may block any account or listing that misuses the platform.</p>
      <h2>2. How deals work</h2>
      <p>Interest shown on a listing goes to Doctraders, which contacts both sides. Members do not receive each other&apos;s contact details through the platform.</p>
      <h2>3. Commission and anti-bypass</h2>
      <p>Parties introduced through the platform agree to pay commission on any deal with each other, even if they later deal directly.</p>
      <h2>4. No guarantee</h2>
      <p>Doctraders does not guarantee any deal and does not hold payments between parties.</p>
    </LegalPage>
  );
}
