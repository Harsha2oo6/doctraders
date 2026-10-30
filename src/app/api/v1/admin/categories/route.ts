import { categoryCreateSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { adminCreateCategory, adminListCategories } from "@/server/services/admin";

/** GET /api/v1/admin/categories (admin) → all categories, including inactive, with listing counts. */
export const GET = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  return ok(await adminListCategories());
});

/** POST /api/v1/admin/categories (admin) { name } → 201; slug is generated. */
export const POST = handle(async (req) => {
  await requireAuth(req, { roles: ["admin"] });
  const { name } = categoryCreateSchema.parse(await readJson(req));
  return ok(await adminCreateCategory(name), 201);
});
