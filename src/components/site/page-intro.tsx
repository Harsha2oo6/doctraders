import type { ReactNode } from "react";
import { Container } from "@/components/ui";

/** Light page title strip for inner pages (eyebrow, title, short intro). */
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="border-b border-ink-100 bg-white py-10 sm:py-14">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold text-ink-900 sm:text-4xl">{title}</h1>
        {children && <p className="mt-3 max-w-2xl text-base text-ink-600">{children}</p>}
      </Container>
    </div>
  );
}
