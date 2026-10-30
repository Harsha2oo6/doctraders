import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";

export const metadata: Metadata = { title: "For Sellers", description: "List your products free and reach buyers across India. Doctraders handles the deal." };

export default function SellersPage() {
  return (
    <AudiencePage
      eyebrow="For sellers"
      title="List your products. We bring you buyers."
      intro="Post what you have with photos. When a buyer is interested, Doctraders handles the conversation and the deal."
      benefits={[
        "Post offers with photos, quantity, price (or on request) and minimum order",
        "Browse buyer requirements and show interest in the ones you can supply",
        "See payments as they are recorded on your deals",
        "Post shipment updates per lot: packed, shipped, reached",
        "No listing fee. Commission only after a completed deal",
      ]}
      who={["Farmers", "Manufacturers and mills", "Traders and wholesalers", "Processors and exporters"]}
    />
  );
}
