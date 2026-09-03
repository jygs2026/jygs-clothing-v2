import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";

import { CartSheet } from "@/components/cart-sheet";
import { Providers } from "@/components/providers";
import { SearchOverlay } from "@/components/search-overlay";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const heading = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const body = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "JYGS — Clothes that outlive the season that made them",
  description:
    "JYGS makes a short run twice a year — outerwear, knitwear and everyday weights in cloth we can name, cut once and then left alone.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <CartSheet />
          <SearchOverlay />
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
