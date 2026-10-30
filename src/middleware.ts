import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, verifyToken } from "@/server/jwt";

/**
 * Page guards only (JWT check, no DB). APIs guard themselves with requireAuth().
 *   /dashboard/**     logged-in buyer/seller (admins go to /admin)
 *   /admin/**         admin or superadmin    (users go to /dashboard)
 *   /admin/admins/**  superadmin             (admins go to /admin)
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const auth = token ? await verifyToken(token) : null;

  const redirect = (to: string) => NextResponse.redirect(new URL(to, req.url));

  if (!auth) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  const admin = auth.roles.includes("admin") || auth.roles.includes("superadmin");
  const trader = auth.roles.includes("buyer") || auth.roles.includes("seller");

  if (pathname.startsWith("/admin")) {
    if (!admin) return redirect("/dashboard");
    if (pathname.startsWith("/admin/admins") && !auth.roles.includes("superadmin")) return redirect("/admin");
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (admin) return redirect("/admin");
    if (!trader) return redirect("/login");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/admin", "/admin/:path*"],
};
