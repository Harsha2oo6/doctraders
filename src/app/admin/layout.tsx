"use client";

import { FolderTree, Handshake, LayoutDashboard, ListChecks, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo, cn } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/listings", label: "Listings", icon: ListChecks },
  { href: "/admin/deals", label: "Deals & commission", icon: Handshake },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
];

// TEMPORARY (Prompt 1): no session yet. Prompt 3 adds the real admin, menu and logout.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-ink-900 p-4 text-ink-100 lg:sticky lg:top-0 lg:h-screen">
        <Logo dark />
        <p className="mt-1 text-xs text-brand-400">Admin</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-6 lg:flex-col" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800", active && "bg-ink-800 text-brand-300")}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
        <Link href="/login" className="mt-4 flex cursor-pointer items-center gap-2 text-sm hover:text-brand-300 lg:absolute lg:bottom-4 lg:left-4">
          <LogOut className="size-4" />Log out
        </Link>
      </aside>
      <main className="p-4 sm:p-8">{children}</main>
    </div>
  );
}
