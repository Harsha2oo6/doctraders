"use client";

import { Clock, FileText, Handshake, Inbox, LayoutDashboard, LogOut, PlusCircle, Search, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Button, Card, CardBody, Logo, Spinner, VerifiedBadge, cn } from "@doctraders/ui";
import { useSession } from "@/lib/session";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: Search },
  { href: "/dashboard/post", label: "Post requirement / offer", icon: PlusCircle },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: Inbox },
  { href: "/dashboard/deals", label: "My deals", icon: Handshake },
];

/**
 * Guards everything under /dashboard:
 *  - not signed in      -> redirect to /login
 *  - Pending / Rejected -> status screen only (nobody can post or view contacts until approved)
 *  - Approved           -> sidebar + page
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoggedIn, isLoggingIn, hydrated, login, logout } = useSession();
  const leaving = useRef(false);

  // DEMO MODE: opening any page signs you in as a demo user, so nothing is blocked.
  // Set NEXT_PUBLIC_DEMO_MODE=false to enforce real login redirects.
  useEffect(() => {
    if (!hydrated || isLoggedIn || isLoggingIn || leaving.current) return;
    if (process.env.NEXT_PUBLIC_DEMO_MODE === "false") router.replace("/login");
    else login({ email: "demo@doctraders.in", password: "demo" });
  }, [hydrated, isLoggedIn, isLoggingIn, login, router]);

  if (!hydrated || !user) return <Spinner />;

  const signOut = () => { leaving.current = true; logout(); router.replace("/login"); };

  if (user.status !== "approved") {
    const rejected = user.status === "rejected";
    return (
      <div className="mx-auto grid min-h-screen max-w-lg place-items-center px-4">
        <Card>
          <CardBody className="space-y-3 p-8 text-center">
            {rejected ? <XCircle className="mx-auto size-12 text-danger" /> : <Clock className="mx-auto size-12 text-warning" />}
            <h1 className="text-2xl font-semibold text-ink-900">{rejected ? "Registration rejected" : "Verification pending"}</h1>
            <p className="text-ink-600">
              {rejected ? <>Reason: <strong>{user.rejectionReason}</strong></> : "Our team is reviewing your documents. You will get an email once your account is approved. Until then you cannot post or view contacts."}
            </p>
            <Button variant="outline" onClick={signOut}>Log out</Button>
          </CardBody>
        </Card>
      </div>
    );
  }

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
          <div className="mt-1 flex items-center justify-between"><VerifiedBadge /><button onClick={signOut} className="flex cursor-pointer items-center gap-1 text-xs hover:text-brand-300"><LogOut className="size-3.5" />Log out</button></div>
        </div>
      </aside>
      <main className="p-4 sm:p-8">
        <div className="mb-4 flex items-center justify-between lg:hidden"><span className="flex items-center gap-2 text-sm"><FileText className="size-4" />{user.companyName}</span><button onClick={signOut} className="text-xs underline">Log out</button></div>
        {children}
      </main>
    </div>
  );
}
