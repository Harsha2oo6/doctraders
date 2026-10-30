"use client";

import { FolderTree, Handshake, Inbox, LayoutDashboard, ListChecks, LogOut, ShieldCheck, UserRound, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api-client";
import { useMe } from "@/lib/me";
import { NotificationsBell } from "@/components/notifications-bell";
import { Logo, Spinner, StatusBadge, cn } from "@/components/ui";

type NavItem = { href: string; label: string; icon: LucideIcon; superOnly?: boolean; count?: "newEnquiries" };

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, count: "newEnquiries" },
  { href: "/admin/deals", label: "Deals", icon: Handshake },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/admins", label: "Admins", icon: ShieldCheck, superOnly: true },
  { href: "/admin/account", label: "Account", icon: UserRound },
];

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

/** DESIGN.md 5.11: same dark sidebar as the dashboard, with the "Admin" label. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { me, loading, logout } = useMe();
  const isSuper = !!me?.roles.includes("superadmin");
  const [newEnquiries, setNewEnquiries] = useState(0);

  // "new" badge on Enquiries; refreshed on every page change and every minute.
  useEffect(() => {
    if (!me) return;
    const load = () => apiFetch<{ enquiries: { new: number } }>("/admin/stats").then((s) => setNewEnquiries(s.enquiries.new), () => {});
    void load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [me, pathname]);

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
          {NAV.filter((n) => !n.superOnly || isSuper).map(({ href, label, icon: Icon, count }) => (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800", isActive(pathname, href) && "bg-ink-800 text-brand-300")}>
              <Icon className="size-4" />{label}
              {count === "newEnquiries" && newEnquiries > 0 && <span className="ml-auto rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">{newEnquiries}</span>}
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
        <div className="mb-6 flex items-center justify-end gap-2">
          <span className="mr-auto truncate text-sm font-semibold text-ink-900 lg:hidden">{me.name}</span>
          <NotificationsBell />
          <button onClick={logout} className="cursor-pointer text-xs underline lg:hidden">Log out</button>
        </div>
        {children}
      </main>
    </div>
  );
}
