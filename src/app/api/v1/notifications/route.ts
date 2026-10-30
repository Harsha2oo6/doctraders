import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { listNotifications } from "@/server/services/notifications";

/** GET /api/v1/notifications (any) ?unread=1&page&limit → list + unreadCount. */
export const GET = handle(async (req) => {
  const user = await requireAuth(req);
  const sp = req.nextUrl.searchParams;
  const r = await listNotifications(user, { unread: sp.get("unread") === "1" || sp.get("unread") === "true", ...parsePaging(sp) });
  return okList(r.items, r, { unreadCount: r.unreadCount });
});
