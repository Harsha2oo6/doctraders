import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";

export const metadata: Metadata = { title: "For Buyers", description: "Post what you need, or find an offer. Doctraders talks to the seller and handles the deal for you." };

export default function BuyersPage() {
  return (
    <AudiencePage
      eyebrow="For buyers"
      title="Tell us what you need. We find the seller."
      intro="Post a requirement or browse offers. Doctraders talks to the seller and handles the deal for you."
      benefits={[
        "Post a requirement with product, quantity, price and location",
        "Browse offers with photos by category, state and keyword",
        "Click “I'm interested” and the Doctraders team calls you",
        "Track payments and every shipment lot of your deal",
        "Your contact details stay private. No joining fee",
      ]}
      who={["Traders and wholesalers", "Mills and processors", "Distributors and retailers", "Any business buying agro products"]}
    />
  );
}
