import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalPage title="Disclaimer">
      <p>Doctraders verifies documents submitted by members but does not guarantee the quality, quantity, delivery or payment of any deal.</p>
      <p>Doctraders does not hold or handle payments between parties. Members should carry out their own due diligence before trading.</p>
    </LegalPage>
  );
}
