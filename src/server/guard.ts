import "server-only";
import type { NextRequest } from "next/server";
import type { Role } from "@/lib/constants";
import { getAuth } from "./auth";
import { HttpError } from "./http";
import { UserModel, type User } from "./models";

type RoleLike = { roles: readonly string[] };

export const hasRole = (u: RoleLike, role: Role) => u.roles.includes(role);
export const isSuperAdmin = (u: RoleLike) => u.roles.includes("superadmin");
export const isAdmin = (u: RoleLike) => u.roles.includes("admin") || isSuperAdmin(u);
export const isTrader = (u: RoleLike) => u.roles.includes("buyer") || u.roles.includes("seller");

/**
 * Verifies the JWT, loads the user from the DB (so a block applies on the next request),
 * rejects blocked users and checks roles. `roles` passes when the user has ANY of them;
 * "admin" also accepts a super admin.
 */
export async function requireAuth(req: NextRequest, opts: { roles?: Role[] } = {}): Promise<User> {
  const auth = await getAuth(req);
  if (!auth) throw new HttpError(401, "Please log in to continue.");
  const user = await UserModel.findById(auth.sub);
  if (!user) throw new HttpError(401, "Please log in to continue.");
  if (user.status === "blocked") throw new HttpError(403, "Your account is blocked. Please contact support.");
  if (opts.roles?.length) {
    const allowed = opts.roles.some((r) => (r === "admin" ? isAdmin(user) : hasRole(user, r)));
    if (!allowed) throw new HttpError(403, "You do not have access to this.");
  }
  return user;
}

/** Same as requireAuth but returns null instead of throwing 401 (for public endpoints that personalise). */
export async function optionalAuth(req: NextRequest): Promise<User | null> {
  const auth = await getAuth(req);
  if (!auth) return null;
  const user = await UserModel.findById(auth.sub);
  return user && user.status === "active" ? user : null;
}
