import "server-only";
import bcrypt from "bcryptjs";
import type { NextRequest, NextResponse } from "next/server";
import { isProd } from "./env";
import { AUTH_COOKIE, TOKEN_TTL_SECONDS, verifyToken, type TokenPayload } from "./jwt";

export { signToken, verifyToken } from "./jwt";
export type { TokenPayload } from "./jwt";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, secure: isProd(), sameSite: "lax", path: "/", maxAge: 0 });
}

/** Reads the JWT from `Authorization: Bearer` first (mobile), then the `dt_token` cookie (web). */
export async function getAuth(req: NextRequest): Promise<TokenPayload | null> {
  const header = req.headers.get("authorization");
  const bearer = header?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const token = bearer || req.cookies.get(AUTH_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
