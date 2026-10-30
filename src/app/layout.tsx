import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui";
import { MeProvider } from "@/lib/me";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Doctraders: Direct buyers and sellers, one trusted middleman", template: "%s | Doctraders" },
  description:
    "B2B trade platform for agro products in India. Sellers post offers, buyers post requirements, and Doctraders connects both sides and handles the deal. Free to join. Commission only after the deal is completed.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <MeProvider>
          <ToastProvider>{children}</ToastProvider>
        </MeProvider>
      </body>
    </html>
  );
}
