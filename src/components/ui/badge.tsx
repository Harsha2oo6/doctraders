import { BadgeCheck } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import {
  ACCOUNT_STATUS_LABELS, COMMISSION_STATUS_LABELS, DEAL_STATUS_LABELS, ENQUIRY_PARTY_STATUS_LABELS,
  ENQUIRY_STATUS_LABELS, LISTING_KIND_LABELS, LISTING_STATUS_LABELS, ROLE_LABELS, SHIPMENT_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/cn";

const badge = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      neutral: "bg-ink-50 text-ink-700",
      brand: "bg-brand-100 text-brand-700",
      verified: "bg-verified-soft text-verified",
      success: "bg-green-100 text-success",
      danger: "bg-red-100 text-danger",
      warning: "bg-amber-100 text-warning",
    },
  },
  defaultVariants: { tone: "neutral" },
});

type Tone = NonNullable<VariantProps<typeof badge>["tone"]>;

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}

/** DESIGN.md 4.4: status → tone per domain; labels come from constants.ts. */
const MAP = {
  account: { tones: { active: "success", blocked: "danger" }, labels: ACCOUNT_STATUS_LABELS },
  listing: { tones: { active: "success", closed: "neutral", blocked: "danger" }, labels: LISTING_STATUS_LABELS },
  kind: { tones: { offer: "brand", requirement: "neutral" }, labels: LISTING_KIND_LABELS },
  enquiry: {
    tones: { new: "brand", contacted: "warning", spoken: "warning", negotiating: "warning", deal_closed: "success", dropped: "neutral" },
    labels: ENQUIRY_STATUS_LABELS,
  },
  enquiryParty: {
    tones: { received: "brand", in_discussion: "warning", deal_done: "success", closed: "neutral" },
    labels: ENQUIRY_PARTY_STATUS_LABELS,
  },
  deal: { tones: { active: "brand", completed: "success", cancelled: "danger" }, labels: DEAL_STATUS_LABELS },
  commission: { tones: { pending: "neutral", due: "warning", paid: "success" }, labels: COMMISSION_STATUS_LABELS },
  shipment: { tones: { packed: "neutral", shipped: "warning", reached: "success" }, labels: SHIPMENT_STATUS_LABELS },
  role: { tones: { buyer: "neutral", seller: "brand", admin: "verified", superadmin: "verified" }, labels: ROLE_LABELS },
} as const satisfies Record<string, { tones: Record<string, Tone>; labels: Record<string, string> }>;

export type StatusDomain = keyof typeof MAP;

/** Legacy map for pages still on sample data (removed when they are wired to the API). */
const LEGACY_TONE: Record<string, Tone> = {
  pending: "warning", approved: "success", rejected: "danger", active: "success", blocked: "danger", expired: "neutral",
  new: "brand", "in-progress": "warning", closed: "neutral", due: "warning", paid: "success", "not-applicable": "neutral", cancelled: "danger",
};

export function StatusBadge({ status, domain, className }: { status: string; domain?: StatusDomain; className?: string }) {
  if (domain) {
    const m = MAP[domain];
    const tone = (m.tones as Record<string, Tone>)[status] ?? "neutral";
    const label = (m.labels as Record<string, string>)[status];
    return <Badge tone={tone} className={cn(!label && "capitalize", className)}>{label ?? status.replace(/[_-]/g, " ")}</Badge>;
  }
  return <Badge tone={LEGACY_TONE[status] ?? "neutral"} className={cn("capitalize", className)}>{status.replace("-", " ")}</Badge>;
}

/** Not used in v1 (no verification). Kept only until the last old page is rewired. */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="verified" className={className}>
      <BadgeCheck className="size-3.5" /> Verified
    </Badge>
  );
}
