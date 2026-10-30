import type { Metadata } from "next";
import { AudiencePage } from "@/components/site/audience-page";

export const metadata: Metadata = { title: "For Logistics Providers" };

export default function LogisticsPage() {
  return (
    <AudiencePage
      eyebrow="For logistics"
      title="Move cargo for verified traders"
      intro="Offer shipping, freight, warehousing and customs clearing to companies already trading on Doctraders."
      benefits={[
        "Get discovered by verified buyers and sellers who need to ship",
        "List your services, routes and ports",
        "Verified badge and licence checks",
        "No fee to join. Commission only after a completed job",
      ]}
      who={["Shipping lines and freight forwarders", "Warehousing providers", "Customs house agents (CHA)"]}
    />
  );
}
