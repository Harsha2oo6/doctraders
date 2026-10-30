import { requireAuth } from "@/server/guard";
import { handle, ok } from "@/server/http";
import { myDeal } from "@/server/services/deals";

/** GET /api/v1/me/deals/:id (party) → one deal with payment summary + shipments. */
export const GET = handle<{ id: string }>(async (req, { id }) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  return ok(await myDeal(user, id));
});
