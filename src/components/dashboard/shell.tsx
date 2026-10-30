"use client";

import { FileText, Handshake, Inbox, LayoutDashboard, LogOut, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo, VerifiedBadge, cn } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Search },
  { href: "/dashboard/post", label: "Post requirement / offer", icon: PlusCircle },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/deals", label: "My deals", icon: Handshake },
];

// TEMPORARY (Prompt 1): no session yet. Prompt 3 adds the real user, role-based menu and logout.
const user = { companyName: "Your business" };

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-ink-800 bg-ink-900 p-4 text-ink-100 lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <Link href="/dashboard"><Logo dark /></Link>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col" aria-label="Dashboard">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-800", pathname === href && "bg-ink-800 text-brand-300")}>
              <Icon className="size-4" />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 hidden lg:absolute lg:bottom-4 lg:left-4 lg:right-4 lg:block">
          <p className="truncate text-sm font-semibold text-white">{user.companyName}</p>
          <div className="mt-1 flex items-center justify-between"><VerifiedBadge /><Link href="/login" className="flex cursor-pointer items-center gap-1 text-xs hover:text-brand-300"><LogOut className="size-3.5" />Log out</Link></div>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <div className="mb-4 flex items-center justify-between lg:hidden"><span className="flex items-center gap-2 text-sm"><FileText className="size-4" />{user.companyName}</span><Link href="/login" className="text-xs underline">Log out</Link></div>
        {children}
      </main>
    </div>
  );
}
