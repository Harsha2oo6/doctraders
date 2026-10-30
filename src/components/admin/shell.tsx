"use client";

import { FolderTree, Handshake, LayoutDashboard, ListChecks, LogOut, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMe } from "@/lib/me";
import { Logo, Spinner, StatusBadge, cn } from "@/components/ui";

type NavItem = { href: string; label: string; icon: LucideIcon; superOnly?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/deals", label: "Deals", icon: Handshake },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

/** DESIGN.md 5.11: same dark sidebar as the dashboard, with the "Admin" label. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, loading, logout } = useMe();
  const isSuper = !!me?.roles.includes("superadmin");

  useEffect(() => {
    if (!loading && !me) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, me, pathname, router]);

  if (loading || !me) return <Spinner />;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-ink-800 bg-ink-900 p-4 text-ink-100 lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <Link href="/admin" aria-label="Admin overview"><Logo dark /></Link>
        <p className="mt-1 text-xs text-brand-400">Admin</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-6 lg:flex-col" aria-label="Admin">
          {NAV.filter((n) => !n.superOnly || isSuper).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800", isActive(pathname, href) && "bg-ink-800 text-brand-300")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 hidden lg:absolute lg:bottom-4 lg:left-4 lg:right-4 lg:block">
          <p className="truncate text-sm font-semibold text-white">{me.name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <StatusBadge domain="role" status={isSuper ? "superadmin" : "admin"} />
            <button onClick={logout} className="flex cursor-pointer items-center gap-1 text-xs hover:text-brand-300"><LogOut className="size-3.5" />Log out</button>
          </div>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="truncate text-sm font-semibold text-ink-900">{me.name}</span>
          <button onClick={logout} className="cursor-pointer text-xs underline">Log out</button>
        </div>
        {children}
      </main>
    </div>
  );
}
