import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>Company details, contact person details and the business documents you upload for verification.</p>
      <h2>How documents are stored</h2>
      <p>Uploaded documents are stored privately and are visible only to Doctraders administrators.</p>
      <h2>Your rights</h2>
      <p>We process personal data in line with India&apos;s Digital Personal Data Protection Act. You may request access, correction or deletion of your data.</p>
    </LegalPage>
  );
}
