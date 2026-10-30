import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink placeholder:text-ink-300 focus-visible:border-brand-500 disabled:bg-ink-50";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(control, "h-10", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(control, "min-h-24 py-2", className)} {...props} />,
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(control, "h-10", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

/** Label + control + error message in one block, so every form looks the same. */
export function Field({
  label, error, hint, children, className,
}: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-sm font-medium text-ink-900">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-ink-400">{hint}</span>}
      {error && <span role="alert" className="block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Checkbox({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; error?: string }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-ink-800">
        <input type="checkbox" className="mt-0.5 size-4 accent-ink-900" {...props} />
        <span>{label}</span>
      </label>
      {error && <span role="alert" className="mt-1 block text-xs text-danger">{error}</span>}
    </div>
  );
}
