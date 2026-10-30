import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { MockProvider } from "@doctraders/mock";
import { SessionProvider } from "@/lib/session";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Doctraders Admin", template: "%s | Doctraders Admin" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <MockProvider>
          <SessionProvider>{children}</SessionProvider>
        </MockProvider>
      </body>
    </html>
  );
}
