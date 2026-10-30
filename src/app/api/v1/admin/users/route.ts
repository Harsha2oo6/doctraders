import { ACCOUNT_STATUSES, TRADE_ROLES, type AccountStatus, type TradeRole } from "@/lib/constants";
import { requireAuth } from "@/server/guard";
import { handle, okList, parsePaging } from "@/server/http";
import { adminListUsers } from "@/server/services/admin";

/** GET /api/v1/admin/users (admin) ?role&status&q&page&limit → buyers and sellers only. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  const sp = req.nextUrl.searchParams;
  const role = sp.get("role") as TradeRole;
  const status = sp.get("status") as AccountStatus;
  const r = await adminListUsers({
    role: TRADE_ROLES.includes(role) ? role : undefined,
    status: ACCOUNT_STATUSES.includes(status) ? status : undefined,
    q: sp.get("q") || undefined,
    ...parsePaging(sp),
  });
  return okList(r.items, r);
});
