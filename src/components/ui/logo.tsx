import { cn } from "@/lib/cn";

/** Text wordmark only. Replace with your real logo asset later. */
export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("text-2xl font-extrabold tracking-tight", dark ? "text-white" : "text-ink-900", className)}>
      Doc<span className="text-brand-500">traders</span>
    </span>
  );
}
