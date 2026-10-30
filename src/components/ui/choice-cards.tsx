import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** DESIGN.md 6.1: radio options as cards (register / profile role choice). */
export function ChoiceCards<T extends string>({
  name, value, options, onChange, className,
}: {
  name: string;
  value: T | undefined;
  options: { value: T; title: string; hint?: string; icon: LucideIcon; disabled?: boolean }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {options.map(({ value: v, title, hint, icon: Icon, disabled }) => (
        <label
          key={v}
          className={cn(
            "flex cursor-pointer flex-col gap-1 rounded-lg border-2 bg-white p-4 transition",
            value === v ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-ink-300",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <input type="radio" name={name} value={v} checked={value === v} disabled={disabled} onChange={() => onChange(v)} className="sr-only" />
          <Icon className="size-6 text-brand-600" />
          <span className="font-semibold text-ink-900">{title}</span>
          {hint && <span className="text-xs text-ink-500">{hint}</span>}
        </label>
      ))}
    </div>
  );
}
