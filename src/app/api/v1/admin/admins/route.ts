import { adminCreateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, okList, parsePaging, readJson } from "@/server/http";
import { createAdmin, listAdmins } from "@/server/services/admin";

/** GET /api/v1/admin/admins (super) ?page&limit. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["superadmin"] });
  const r = await listAdmins(parsePaging(req.nextUrl.searchParams));
  return okList(r.items, r);
});

/** POST /api/v1/admin/admins (super) { name, email, mobile, password, superadmin? } → 201; emails a login link, never the password. */
export const POST = handle(async (req) => {
  const me = await requireAuth(req, { roles: ["superadmin"] });
  return ok(await createAdmin(me, adminCreateSchema.parse(await readJson(req))), 201);
});
