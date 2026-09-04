import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_ENABLED } from "@/lib/site-config";

/**
 * The shop is set in Cormorant and Lora, which is right for a lookbook and
 * wrong for a table of three hundred rows. The studio gets a plain sans of
 * its own instead of borrowing the storefront's serif.
 */
const admin = Inter({
  variable: "--font-admin-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Studio admin — JYGS", template: "%s — JYGS Studio" },
  robots: { index: false, follow: false },
};

/**
 * The studio's own door, and the gate for everything behind it. It exists
 * only where NEXT_PUBLIC_ADMIN_ENABLED is "true"; anywhere else none of these
 * routes are on the map at all. That flag decides who is shown the door, not
 * who may walk through it — the value ships to the browser, so real access
 * control belongs on the server behind it.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!ADMIN_ENABLED) notFound();

  return <AdminShell fontClassName={admin.variable}>{children}</AdminShell>;
}
