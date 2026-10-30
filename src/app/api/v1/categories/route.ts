import { handle, ok } from "@/server/http";
import { listActiveCategories } from "@/server/services/categories";

export const dynamic = "force-dynamic";

/** GET /api/v1/categories (public) → active categories in display order. */
export const GET = handle(async () => ok(await listActiveCategories()));
