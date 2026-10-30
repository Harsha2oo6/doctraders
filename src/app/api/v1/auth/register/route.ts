import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { setAuthCookie, signToken } from "@/server/auth";
import { handle, readJson } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { selfUser } from "@/server/serializers";
import { register } from "@/server/services/auth";

/** POST /api/v1/auth/register (public) → 201 { data: { user, token } } + dt_token cookie. */
export const POST = handle(async (req) => {
  rateLimit(req, "register");
  const input = registerSchema.parse(await readJson(req));
  const user = await register(input);
  const token = await signToken({ sub: String(user._id), roles: user.roles });
  const res = NextResponse.json({ data: { user: selfUser(user), token } }, { status: 201 });
  setAuthCookie(res, token);
  return res;
});
