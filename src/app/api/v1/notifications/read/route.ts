import { notificationsReadSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok } from "@/server/http";
import { markRead } from "@/server/services/notifications";

/** POST /api/v1/notifications/read (any) { ids? } — no ids (or no body) = mark all read. */
export const POST = handle(async (req) => {
  const user = await requireAuth(req);
  const text = await req.text();
  let body: unknown = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = {};
  }
  const { ids } = notificationsReadSchema.parse(body ?? {});
  return ok(await markRead(user, ids));
});
