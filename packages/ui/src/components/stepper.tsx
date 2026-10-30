import { Check } from "lucide-react";
import { cn } from "../cn";

/** Horizontal progress indicator driven by the current state of a machine. */
export function Stepper({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            aria-current={i === current ? "step" : undefined}
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
              i < current && "bg-ink-900 text-white",
              i === current && "bg-brand-500 text-ink-950",
              i > current && "bg-ink-100 text-ink-400",
            )}
          >
            {i < current ? <Check className="size-4" /> : i + 1}
          </span>
          <span className={cn("hidden text-xs font-medium capitalize sm:block", i === current ? "text-ink-900" : "text-ink-400")}>
            {label}
          </span>
          {i < steps.length - 1 && <span className="h-px flex-1 bg-ink-100" />}
        </li>
      ))}
    </ol>
  );
}
