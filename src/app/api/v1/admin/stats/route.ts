import { requireAuth } from "@/server/guard";
import { handle, ok } from "@/server/http";
import { adminStats } from "@/server/services/stats";

/** GET /api/v1/admin/stats (admin) → overview counts. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminStats());
});
