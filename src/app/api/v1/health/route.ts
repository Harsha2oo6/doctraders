import { connectDB } from "@/server/db";
import { handle, ok } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/v1/health → { ok, db } (always 200 so uptime checks can read the db flag). */
export const GET = handle(
  async () => {
    let db = false;
    try {
      const conn = await connectDB();
      await conn.connection.db?.admin().ping();
      db = true;
    } catch (e) {
      console.error("[health] db check failed:", (e as Error).message);
    }
    return ok({ ok: true, db });
  },
  { db: false },
);
