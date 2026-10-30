import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";

export const metadata: Metadata = { title: "For Sellers" };

export default function SellersPage() {
  return (
    <AudiencePage
      eyebrow="For sellers"
      title="Reach verified buyers in new markets"
      intro="List your offers and get qualified enquiries from verified direct buyers."
      benefits={[
        "Post offers with price (or on request), port, delivery and payment terms",
        "Smart matching puts your offer in front of matching buyers",
        "Verified badge builds trust with international buyers",
        "Inbox for enquiries and a clear deal pipeline",
        "No listing fee. Commission only after a completed deal",
      ]}
      who={["Manufacturers and mills", "Farmers' companies", "Exporters"]}
    />
  );
}
