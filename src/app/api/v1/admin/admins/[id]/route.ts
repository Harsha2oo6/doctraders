import { adminUpdateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { deleteAdmin, updateAdmin } from "@/server/services/admin";

type P = { id: string };

/** PATCH /api/v1/admin/admins/:id (super) { status?, password?, superadmin? }. Not yourself; not the last super admin. */
export const PATCH = handle<P>(async (req, { id }) => {
  const me = await requireAuth(req, { roles: ["superadmin"] });
  return ok(await updateAdmin(me, id, adminUpdateSchema.parse(await readJson(req))));
});

/** DELETE /api/v1/admin/admins/:id (super). Not yourself; not the last super admin. */
export const DELETE = handle<P>(async (req, { id }) => {
  const me = await requireAuth(req, { roles: ["superadmin"] });
  return ok(await deleteAdmin(me, id));
});
