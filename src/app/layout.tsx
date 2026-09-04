import type { Metadata } from "next";
import { Cormorant_Garamond, Lora } from "next/font/google";

import { Providers } from "@/components/providers";
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

/**
 * Only the document itself lives here. The shop's own furniture — header,
 * footer, bag and search — belongs to the `(shop)` group, so the studio's
 * admin can take the whole window without having to undo any of it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${heading.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Providers>
          {children}
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
