import { changePasswordSchema } from "@/lib/validation";
import { requireAuth } from "@/server/guard";
import { handle, ok, readJson } from "@/server/http";
import { changePassword } from "@/server/services/auth";

/** POST /api/v1/auth/change-password (any) { currentPassword, newPassword }. */
export const POST = handle(async (req) => {
  const user = await requireAuth(req);
  await changePassword(user, changePasswordSchema.parse(await readJson(req)));
  return ok({ ok: true });
});
