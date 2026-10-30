import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const FILL = { paid: "bg-success", shipped: "bg-brand-500", reached: "bg-verified" } as const;

/** DESIGN.md 6.4 progress bar. `kind` picks the fill colour (Paid / Shipped / Reached). */
export function ProgressBar({ label, detail, percent, kind }: { label: string; detail: string; percent: number; kind: keyof typeof FILL }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="text-right text-ink-500">{detail} · {p}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-label={label} aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <div className={cn("h-full rounded-full", FILL[kind])} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

/** DESIGN.md 6.3 stage pills: done/current dark (done with a check), upcoming light. */
export function StagePills({ steps, current }: { steps: { key: string; label: string }[]; current: string }) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex flex-wrap gap-2 text-xs">
      {steps.map((s, i) => (
        <li key={s.key} className={cn("flex items-center gap-1 rounded-full px-3 py-1", i <= idx ? "bg-ink-900 text-white" : "bg-ink-50 text-ink-400")}>
          {i < idx && <Check className="size-3" />}{s.label}
        </li>
      ))}
    </ol>
  );
}
