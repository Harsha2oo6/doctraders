import { enquiryStatusSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminGetEnquiry, adminSetEnquiryStatus } from "@/server/services/enquiries";

type P = { id: string };

/** GET /api/v1/admin/enquiries/:id (admin) → full detail with notes, history, listing and both parties. */
export const GET = handle<P>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminGetEnquiry(id));
});

/** PATCH /api/v1/admin/enquiries/:id (admin) { status } (not deal_closed). */
export const PATCH = handle<P>(async (req, { id }) => {
  const admin = await requireAuth(req, { roles: ["admin"] });
  const { status } = enquiryStatusSchema.parse(await readJson(req));
  return ok(await adminSetEnquiryStatus(admin, id, status));
});
