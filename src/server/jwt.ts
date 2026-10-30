import "server-only";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/constants";
import { jwtSecret } from "./env";

/** Edge-safe token helpers (used by middleware too, so no DB or Node-only imports here). */

export const AUTH_COOKIE = "dt_token";
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type TokenPayload = { sub: string; roles: Role[] };

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ roles: payload.roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(jwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret(), { algorithms: ["HS256"] });
    if (!payload.sub || !Array.isArray(payload.roles)) return null;
    return { sub: payload.sub, roles: payload.roles as Role[] };
  } catch {
    return null;
  }
}
