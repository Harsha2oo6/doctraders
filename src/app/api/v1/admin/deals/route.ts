import { COMMISSION_STATUSES, DEAL_STATUSES, type CommissionStatus, type DealStatus } from "@/lib/constants";
import { dealCreateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, okList, parsePaging, readJson } from "@/server/http";
import { adminListDeals, createDeal } from "@/server/services/deals";

/** GET /api/v1/admin/deals (admin) ?status&commissionStatus&q&page&limit → + counts per status. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  const sp = req.nextUrl.searchParams;
  const status = sp.get("status") as DealStatus;
  const cs = sp.get("commissionStatus") as CommissionStatus;
  const r = await adminListDeals({
    status: DEAL_STATUSES.includes(status) ? status : undefined,
    commissionStatus: COMMISSION_STATUSES.includes(cs) ? cs : undefined,
    q: sp.get("q") || undefined,
    ...parsePaging(sp),
  });
  return okList(r.items, r, { counts: r.counts });
});

/** POST /api/v1/admin/deals (admin) { enquiryId, quantity, unit, pricePerUnit, commissionPercent, adminNotes? } → 201. */
export const POST = handle(async (req) => {
  const admin = await requireAuth(req, { roles: ["admin"] });
  return ok(await createDeal(admin, dealCreateSchema.parse(await readJson(req))), 201);
});
