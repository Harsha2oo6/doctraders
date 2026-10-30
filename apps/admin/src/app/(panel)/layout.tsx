"use client";

import { BarChart3, FolderTree, Handshake, LayoutDashboard, ListChecks, LogOut, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Logo, Spinner, cn } from "@doctraders/ui";
import { useSession } from "@/lib/session";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/registrations", label: "Registrations", icon: ShieldCheck },
  { href: "/users", label: "Users", icon: Users },
  { href: "/listings", label: "Listings", icon: ListChecks },
  { href: "/deals", label: "Deals & commission", icon: Handshake },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

/** Every page in this route group requires an admin session. */
export default function PanelLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isLoggingIn, hydrated, login, logout } = useSession();
  const leaving = useRef(false);

  // DEMO MODE: opening any admin page signs you in automatically.
  // Set NEXT_PUBLIC_DEMO_MODE=false to enforce real login redirects.
  useEffect(() => {
    if (!hydrated || isLoggedIn || isLoggingIn || leaving.current) return;
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") router.replace("/login");
    else login({ email: "admin@doctraders.in", password: "demo" });
  }, [hydrated, isLoggedIn, isLoggingIn, login, router]);

  if (!hydrated || !user) return <Spinner />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-ink-900 p-4 text-ink-100 lg:sticky lg:top-0 lg:h-screen">
        <Logo dark />
        <p className="mt-1 text-xs text-brand-400">Admin</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-6 lg:flex-col" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800", active && "bg-ink-800 text-brand-300")}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => { leaving.current = true; logout(); router.replace("/login"); }} className="mt-4 flex cursor-pointer items-center gap-2 text-sm hover:text-brand-300 lg:absolute lg:bottom-4 lg:left-4">
          <LogOut className="size-4" />Log out
        </button>
      </aside>
      <main className="p-4 sm:p-8">{children}</main>
    </div>
  );
}
