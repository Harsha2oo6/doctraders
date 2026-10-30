"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch, apiList } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/lib/types";

const POLL_MS = 30_000;

/**
 * DESIGN.md 6.7. Polls GET /api/v1/notifications every 30 s (latest 10 + unreadCount).
 * Clicking an item marks it read and opens its link. `dark` = on the dark sidebar.
 */
export function NotificationsBell({ dark, align = "right" }: { dark?: boolean; align?: "left" | "right" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await apiList<AppNotification>("/notifications", { query: { limit: 10 } });
      setItems(r.data);
      setUnread(Number(r.unreadCount ?? 0));
    } catch {
      /* logged out or offline: keep the last state */
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markRead(ids?: string[]) {
    setItems((list) => list.map((n) => (!ids || ids.includes(n.id) ? { ...n, read: true } : n)));
    try {
      const r = await apiFetch<{ unreadCount: number }>("/notifications/read", { body: ids ? { ids } : {} });
      setUnread(r.unreadCount);
    } catch {
      void load();
    }
  }

  async function openItem(n: AppNotification) {
    setOpen(false);
    if (!n.read) await markRead([n.id]);
    if (n.link) router.push(n.link);
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); if (!open) void load(); }}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className={cn("relative grid size-10 cursor-pointer place-items-center rounded-lg", dark ? "text-ink-100 hover:bg-ink-800" : "text-ink-700 hover:bg-ink-50")}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>
      {open && (
        <div className={cn("absolute top-full z-50 mt-1 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-ink-100 bg-white text-left shadow-card", align === "right" ? "right-0" : "left-0")}>
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <span className="text-sm font-semibold text-ink-900">Notifications</span>
            {unread > 0 && <button type="button" onClick={() => markRead()} className="cursor-pointer text-xs font-semibold text-brand-600 hover:underline">Mark all read</button>}
          </div>
          {items.length === 0 ? (
            <p className="p-5 text-sm text-ink-500">You&apos;re all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-ink-100 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => openItem(n)} className={cn("block w-full cursor-pointer px-4 py-3 text-left text-sm hover:bg-ink-50", !n.read && "bg-brand-50")}>
                    <span className="block font-medium text-ink-900">{n.title}</span>
                    {n.body && <span className="line-clamp-2 block text-ink-600">{n.body}</span>}
                    <span className="block text-xs text-ink-400">{timeAgo(n.createdAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
