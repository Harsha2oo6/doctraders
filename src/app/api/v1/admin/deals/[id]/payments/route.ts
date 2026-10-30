import { paymentSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { addPayment } from "@/server/services/deals";

/** POST /api/v1/admin/deals/:id/payments (admin) { amount, method?, note?, paidAt? } → 201 updated deal. */
export const POST = handle<{ id: string }>(async (req, { id }) => {
  const admin = await requireAuth(req, { roles: ["admin"] });
  return ok(await addPayment(admin, id, paymentSchema.parse(await readJson(req))), 201);
});
