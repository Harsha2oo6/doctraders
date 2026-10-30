import type { ReactNode } from "react";
import { MockProvider } from "@doctraders/mock";
import { DashboardShell } from "@/components/dashboard/shell";
import { SessionProvider } from "@/lib/session";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <MockProvider>
      <SessionProvider>
        <DashboardShell>{children}</DashboardShell>
      </SessionProvider>
    </MockProvider>
  );
}
