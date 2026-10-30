import { forgotPasswordSchema } from "@/lib/validation";
import { handle, ok, readJson } from "@/server/http";
import { forgotPassword } from "@/server/services/auth";

/** POST /api/v1/auth/forgot-password (public) { email } → always 200; emails a 1-hour reset link. */
export const POST = handle(async (req) => {
  const { email } = forgotPasswordSchema.parse(await readJson(req));
  await forgotPassword(email);
  return ok({ ok: true });
});
