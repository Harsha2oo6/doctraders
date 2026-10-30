import { resetPasswordSchema } from "@/lib/validation";
import { handle, ok, readJson } from "@/server/http";
import { resetPassword } from "@/server/services/auth";

/** POST /api/v1/auth/reset-password (public) { token, password }. */
export const POST = handle(async (req) => {
  await resetPassword(resetPasswordSchema.parse(await readJson(req)));
  return ok({ ok: true });
});
