import type { ReactNode } from "react";

/** DESIGN.md 6.6 vertical timeline (notes, status history, shipment history). Pass items latest first. */
export function Timeline({ items, empty = "Nothing yet." }: { items: { key: string; text: ReactNode; meta: ReactNode }[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-ink-500">{empty}</p>;
  return (
    <ol className="relative space-y-4 border-l border-ink-200 pl-5">
      {items.map((i) => (
        <li key={i.key} className="relative">
          <span className="absolute -left-[1.6rem] top-1.5 size-2.5 rounded-full bg-ink-900 ring-4 ring-white" />
          <div className="text-sm text-ink-800">{i.text}</div>
          <p className="text-xs text-ink-500">{i.meta}</p>
        </li>
      ))}
    </ol>
  );
}
