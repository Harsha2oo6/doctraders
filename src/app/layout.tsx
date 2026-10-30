import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Doctraders: Verified Buyers. Verified Sellers.", template: "%s | Doctraders" },
  description:
    "B2B trade platform connecting verified direct buyers and sellers across agro, food, metals, industrial goods, imports, exports and logistics. Free to join. Commission only after a deal.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
