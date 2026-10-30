import { categoryUpdateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminDeleteCategory, adminUpdateCategory } from "@/server/services/admin";

type P = { id: string };

/** PATCH /api/v1/admin/categories/:id (admin) { name?, active?, order? }. */
export const PATCH = handle<P>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminUpdateCategory(id, categoryUpdateSchema.parse(await readJson(req))));
});

/** DELETE /api/v1/admin/categories/:id (admin) → deleted if unused, otherwise deactivated. */
export const DELETE = handle<P>(async (req, { id }) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminDeleteCategory(id));
});
