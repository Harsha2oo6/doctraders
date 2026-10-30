import { dealUpdateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminGetDeal, adminUpdateDeal } from "@/server/services/deals";

type P = { id: string };

/** GET /api/v1/admin/deals/:id (admin) → full deal incl. commission and both parties. */
export const GET = handle<P>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminGetDeal(id));
});

/** PATCH /api/v1/admin/deals/:id (admin) { status?, commissionStatus?, quantity?, pricePerUnit?, commissionPercent?, adminNotes? }. */
export const PATCH = handle<P>(async (req, { id }) => {
  const admin = await requireAuth(req, { roles: ["admin"] });
  return ok(await adminUpdateDeal(admin, id, dealUpdateSchema.parse(await readJson(req))));
});
