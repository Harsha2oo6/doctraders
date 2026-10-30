import { accountStatusSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminGetUser, adminSetUserStatus } from "@/server/services/admin";

type P = { id: string };

/** GET /api/v1/admin/users/:id (admin) → profile + their listings, enquiries and deals. */
export const GET = handle<P>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminGetUser(id));
});

/** PATCH /api/v1/admin/users/:id (admin) { status: "active"|"blocked" }. Applies on the user's next request. */
export const PATCH = handle<P>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  const { status } = accountStatusSchema.parse(await readJson(req));
  return ok(await adminSetUserStatus(id, status));
});
