import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { setAuthCookie, signToken } from "@/server/auth";
import { handle, readJson } from "@/server/http";
import { rateLimit } from "@/server/rate-limit";
import { selfUser } from "@/server/serializers";
import { login } from "@/server/services/auth";

/** POST /api/v1/auth/login (public) { identifier, password } → { data: { user, token } } + cookie. */
export const POST = handle(async (req) => {
  rateLimit(req, "login");
  const { identifier, password } = loginSchema.parse(await readJson(req));
  const user = await login(identifier, password);
  const token = await signToken({ sub: String(user._id), roles: user.roles });
  const res = NextResponse.json({ data: { user: selfUser(user), token } });
  setAuthCookie(res, token);
  return res;
});
