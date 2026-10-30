import { DEAL_STATUSES, type DealStatus } from "@/lib/constants";
import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { myDeals } from "@/server/services/deals";

/** GET /api/v1/me/deals (user) ?status&page&limit → deals where I am buyer or seller (no commission, other side as alias). */
export const GET = handle(async (req) => {
  const user = await requireAuth(req, { roles: ["buyer", "seller"] });
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as DealStatus;
  const r = await myDeals(user, { status: DEAL_STATUSES.includes(status) ? status : undefined, ...parsePaging(sp) });
  return okList(r.items, r);
});
