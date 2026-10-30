import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Tab = { key: string; label: string; count?: number; href?: string };

const pill = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors";
const on = "bg-ink-900 text-white";
const off = "border border-ink-200 bg-white text-ink-700 hover:bg-ink-50";

/** DESIGN.md 6.2: status tabs / filter pills. Each tab is a link (href) or a button (onChange). */
export function Tabs({ tabs, active, onChange, className }: { tabs: Tab[]; active: string; onChange?: (key: string) => void; className?: string }) {
  return (
    <div className={cn("mb-4 flex flex-wrap gap-2", className)} role="tablist">
      {tabs.map((t) => {
        const isOn = t.key === active;
        const inner = (
          <>
            {t.label}
            {t.count !== undefined && <span className={cn("rounded-full px-1.5 text-xs", isOn ? "bg-white/20" : "bg-ink-50 text-ink-500")}>{t.count}</span>}
          </>
        );
        return t.href ? (
          <Link key={t.key} href={t.href} role="tab" aria-selected={isOn} className={cn(pill, isOn ? on : off)}>{inner}</Link>
        ) : (
          <button key={t.key} type="button" role="tab" aria-selected={isOn} onClick={() => onChange?.(t.key)} className={cn(pill, "cursor-pointer", isOn ? on : off)}>{inner}</button>
        );
      })}
    </div>
  );
}

const pagerBtn = "inline-flex h-8 items-center justify-center rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-ink-50";

/** Server-driven pagination (DESIGN.md 4.7 footer look). Links when `hrefFor` is given, buttons otherwise. */
export function Pager({ page, limit, total, hrefFor, onPage, className }: {
  page: number; limit: number; total: number; hrefFor?: (p: number) => string; onPage?: (p: number) => void; className?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  const btn = (p: number, label: string, icon: React.ReactNode, disabled: boolean) =>
    disabled ? (
      <span aria-disabled className={cn(pagerBtn, "pointer-events-none opacity-50")} aria-label={label}>{icon}</span>
    ) : hrefFor ? (
      <Link href={hrefFor(p)} className={pagerBtn} aria-label={label}>{icon}</Link>
    ) : (
      <button type="button" onClick={() => onPage?.(p)} className={cn(pagerBtn, "cursor-pointer")} aria-label={label}>{icon}</button>
    );
  return (
    <div className={cn("flex items-center justify-between text-xs text-ink-500", className)}>
      <span>Page {page} of {pages} · {total} total</span>
      <div className="flex gap-1">
        {btn(page - 1, "Previous page", <ChevronLeft className="size-4" />, page <= 1)}
        {btn(page + 1, "Next page", <ChevronRight className="size-4" />, page >= pages)}
      </div>
    </div>
  );
}
