import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>Doctraders does not check documents or verify members. Doctraders does not guarantee the quality, quantity, delivery or payment of any deal.</p>
      <p>Doctraders does not hold payments between parties. Payment and shipment records on the platform are for tracking only. Members should carry out their own due diligence before trading.</p>
    </LegalPage>
  );
}
