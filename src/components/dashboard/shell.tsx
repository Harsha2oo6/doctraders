"use client";

import { Handshake, Inbox, LayoutDashboard, LogOut, PlusCircle, Search, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useMe } from "@/lib/me";
import { Logo, Spinner, StatusBadge, cn } from "@/components/ui";

type NavItem = { href: string; label: string; icon: LucideIcon; show?: (roles: string[]) => boolean };

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Search },
  { href: "/dashboard/post", label: "Post", icon: PlusCircle },
  { href: "/dashboard/enquiries", label: "My enquiries", icon: Inbox },
  { href: "/dashboard/deals", label: "My deals", icon: Handshake },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

const isActive = (pathname: string, href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

/** DESIGN.md 5.11: dark sidebar layout for buyers and sellers. Middleware already checked the token. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, loading, logout } = useMe();

  useEffect(() => {
    if (!loading && !me) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, me, pathname, router]);

  if (loading || !me) return <Spinner />;
  const roles = me.roles.filter((r) => r === "buyer" || r === "seller");
  const title = me.business?.name || me.name;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-ink-800 bg-ink-900 p-4 text-ink-100 lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <Link href="/" aria-label="Doctraders home"><Logo dark /></Link>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col" aria-label="Dashboard">
          {NAV.filter((n) => !n.show || n.show(roles)).map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800", isActive(pathname, href) && "bg-ink-800 text-brand-300")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 hidden lg:absolute lg:bottom-4 lg:left-4 lg:right-4 lg:block">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="truncate text-xs text-ink-300">{me.name}</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="flex gap-1">{roles.map((r) => <StatusBadge key={r} domain="role" status={r} />)}</span>
            <button onClick={logout} className="flex cursor-pointer items-center gap-1 text-xs hover:text-brand-300"><LogOut className="size-3.5" />Log out</button>
          </div>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="truncate text-sm font-semibold text-ink-900">{title}</span>
          <button onClick={logout} className="cursor-pointer text-xs underline">Log out</button>
        </div>
        {children}
      </main>
    </div>
  );
}
