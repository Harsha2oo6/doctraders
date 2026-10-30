import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/server/auth";
import { handle } from "@/server/http";

/** POST /api/v1/auth/logout (public) → clears the cookie. The app just deletes its stored token. */
export const POST = handle(
  async () => {
    const res = NextResponse.json({ data: { ok: true } });
    clearAuthCookie(res);
    return res;
  },
  { db: false },
);
