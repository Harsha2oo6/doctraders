import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Commission Policy" };

export default function CommissionPolicyPage() {
  return (
    <LegalPage title="Commission Policy">
      <h2>Zero charge until a deal closes</h2>
      <p>There is no joining, listing or subscription fee. Commission is charged only after a deal is completed.</p>
      <h2>How the percentage is set</h2>
      <p>The percentage is agreed per deal with the Doctraders team while the deal is being arranged.</p>
      <h2>When it is due</h2>
      <p>Commission becomes due when Doctraders marks the deal as completed. The Doctraders team will contact you about payment.</p>
    </LegalPage>
  );
}
