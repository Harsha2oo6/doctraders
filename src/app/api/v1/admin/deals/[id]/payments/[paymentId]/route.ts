import { objectId } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok } from "@/server/http";
import { deletePayment } from "@/server/services/deals";

/** DELETE /api/v1/admin/deals/:id/payments/:paymentId (admin) → undo a wrong entry; returns the updated deal. */
export const DELETE = handle<{ id: string; paymentId: string }>(async (req, { id, paymentId }) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await deletePayment(id, objectId.parse(paymentId)));
});
