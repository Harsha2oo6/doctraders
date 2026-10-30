import { listingStatusSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminSetListingStatus } from "@/server/services/admin";

/** PATCH /api/v1/admin/listings/:id (admin) { status: "active"|"blocked" }. */
export const PATCH = handle<{ id: string }>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  const { status } = listingStatusSchema.parse(await readJson(req));
  return ok(await adminSetListingStatus(id, status));
});
