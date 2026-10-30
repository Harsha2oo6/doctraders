import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";

export const metadata: Metadata = { title: "For Buyers" };

export default function BuyersPage() {
  return (
    <AudiencePage
      eyebrow="For buyers"
      title="Source from verified direct sellers"
      intro="Post what you need and let verified manufacturers, mills and exporters come to you."
      benefits={[
        "Post a requirement with specification, quantity, port and terms",
        "Smart matching shows your requirement to the right sellers",
        "Search verified offers by product, country, port and quantity",
        "Deal tracking and documents in one place",
        "No joining fee. Commission only after a completed deal",
      ]}
      who={["Importers", "Processors", "Traders buying for their own use"]}
    />
  );
}
