import { shipmentCreateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { addShipment } from "@/server/services/deals";

/** POST /api/v1/deals/:id/shipments (seller of deal / admin) { quantity, status?: "packed", note? } → 201 deal. */
export const POST = handle<{ id: string }>(async (req, { id }) => {
  const user = await requireAuth(req, { roles: ["seller", "admin"] });
  return ok(await addShipment(user, id, shipmentCreateSchema.parse(await readJson(req))), 201);
});
