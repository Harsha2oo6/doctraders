"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";
import { Card, CardBody, CardHeader, CardTitle } from "./card";

/**
 * DESIGN.md 6.8 modal. Closes on Escape and overlay click, focuses the first field,
 * keeps Tab inside the panel.
 */
export function Dialog({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  // Callers pass inline functions; a ref keeps a parent re-render from re-running the focus effect.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(panel.current?.querySelectorAll<HTMLElement>('input, select, textarea, button, a[href], [tabindex]:not([tabindex="-1"])') ?? []).filter((el) => !el.hasAttribute("disabled"));
    const first = focusables().find((el) => el.matches("input, select, textarea")) ?? focusables()[0];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const els = focusables();
        if (!els.length) return;
        const [a, z] = [els[0]!, els[els.length - 1]!];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" size="sm" className="size-8 px-0" onClick={onClose} aria-label="Close"><X className="size-4" /></Button>
          </CardHeader>
          <CardBody className="space-y-4">{children}</CardBody>
          {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-4">{footer}</div>}
        </Card>
      </div>
    </div>
  );
}

/** Confirmation for destructive actions (danger button). */
export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = "Confirm", busy, tone = "danger" }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; children: ReactNode;
  confirmLabel?: string; busy?: boolean; tone?: "danger" | "primary";
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>{busy ? "Working…" : confirmLabel}</Button>
        </>
      }
    >
      <div className="text-sm text-ink-600">{children}</div>
    </Dialog>
  );
}
