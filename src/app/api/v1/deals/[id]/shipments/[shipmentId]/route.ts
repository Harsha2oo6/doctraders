import { objectId, shipmentUpdateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { updateShipment } from "@/server/services/deals";

/** PATCH /api/v1/deals/:id/shipments/:shipmentId (seller of deal / admin) { status, note? } — forward only. */
export const PATCH = handle<{ id: string; shipmentId: string }>(async (req, { id, shipmentId }) => {
  const user = await requireAuth(req, { roles: ["seller", "admin"] });
  return ok(await updateShipment(user, id, objectId.parse(shipmentId), shipmentUpdateSchema.parse(await readJson(req))));
});
