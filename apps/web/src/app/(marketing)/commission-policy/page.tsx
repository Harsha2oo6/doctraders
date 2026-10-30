import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Commission Policy" };

export default function CommissionPolicyPage() {
  return (
    <LegalPage title="Commission Policy">
      <h2>Zero charge until a deal closes</h2>
      <p>There is no joining, listing or subscription fee. Commission is charged only after a deal is completed.</p>
      <h2>How the percentage is set</h2>
      <p>The percentage is agreed per deal and recorded in a digital commission agreement that both parties accept before contact details are shared.</p>
      <h2>Invoicing</h2>
      <p>After completion, Doctraders issues a commission invoice with GST details.</p>
    </LegalPage>
  );
}
