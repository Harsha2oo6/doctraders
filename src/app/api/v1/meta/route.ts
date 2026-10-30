import { getMeta } from "@/server/services/meta";
import { handle, ok } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/v1/meta → every enum with labels, active categories, upload limits, minAppVersion. */
export const GET = handle(async () => ok(await getMeta()));
