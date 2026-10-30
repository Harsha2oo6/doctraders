import { BadgeCheck } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "../cn";

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

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>) {
  return <span className={cn(badge({ tone }), className)} {...props} />;
}

const STATUS_TONE = {
  pending: "warning", approved: "success", rejected: "danger",
  active: "success", blocked: "danger", expired: "neutral",
  new: "brand", "in-progress": "warning", closed: "neutral",
  due: "warning", paid: "success", "not-applicable": "neutral", cancelled: "danger",
} as const;

/** Maps any status string used in the app to a consistent colored badge. */
export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status as keyof typeof STATUS_TONE] ?? "neutral";
  return <Badge tone={tone} className="capitalize">{status.replace("-", " ")}</Badge>;
}

/** The trust signal shown on approved profiles. */
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="verified" className={className}>
      <BadgeCheck className="size-3.5" /> Verified
    </Badge>
  );
}
