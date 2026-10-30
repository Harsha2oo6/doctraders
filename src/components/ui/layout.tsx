import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1560px] px-4 sm:px-6 lg:px-10", className)} {...props} />;
}

export function Section({ className, tone = "light", ...props }: HTMLAttributes<HTMLElement> & { tone?: "light" | "white" | "dark" }) {
  return (
    <section
      className={cn(
        "py-16 sm:py-20",
        tone === "white" && "bg-white",
        tone === "dark" && "bg-ink-900 text-white",
        className,
      )}
      {...props}
    />
  );
}

export function SectionHeading({ eyebrow, title, children, center, light }: {
  eyebrow?: string; title: string; children?: ReactNode; center?: boolean; light?: boolean;
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-500">{eyebrow}</p>}
      <h2 className={cn("text-3xl font-semibold sm:text-4xl", light ? "text-white" : "text-ink-900")}>{title}</h2>
      {children && <p className={cn("mt-3 text-base", light ? "text-ink-200" : "text-ink-600")}>{children}</p>}
    </div>
  );
}

/** Page title block used at the top of dashboard and admin pages. */
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center">
      <p className="font-semibold text-ink-900">{title}</p>
      {children && <p className="mt-1 text-sm text-ink-500">{children}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** DESIGN.md 6.14 error state with a retry button. */
export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      title="Something went wrong"
      action={onRetry && <button onClick={onRetry} className="inline-flex h-8 cursor-pointer items-center justify-center rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50">Try again</button>}
    >
      {message}
    </EmptyState>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 p-10 text-sm text-ink-500">
      <span className="size-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-500" /> {label}…
    </div>
  );
}
