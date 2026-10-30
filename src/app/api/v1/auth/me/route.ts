import { updateMeSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { selfUser } from "@/server/serializers";
import { updateMe } from "@/server/services/auth";

/** GET /api/v1/auth/me (any) → own full profile. */
export const GET = handle(async (req) => {
  const user = await requireAuth(req);
  return ok(selfUser(user));
});

/** PATCH /api/v1/auth/me (any) → update profile/business, or add a trade role. */
export const PATCH = handle(async (req) => {
  const user = await requireAuth(req);
  const input = updateMeSchema.parse(await readJson(req));
  return ok(selfUser(await updateMe(user, input)));
});
