import { ChevronLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ADMIN_ENABLED } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Studio admin — JYGS",
};

/**
 * The studio's own door. It exists only where NEXT_PUBLIC_ADMIN_ENABLED is
 * "true"; anywhere else the route is not on the map at all. Nothing is behind
 * it yet — when there is, the work of deciding who may see it belongs on the
 * server, not on a flag the browser can read.
 */
export default function AdminPage() {
  if (!ADMIN_ENABLED) notFound();

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs tracking-[0.09em] text-foreground/55 uppercase transition-colors hover:text-accent-2"
      >
        <ChevronLeft className="size-3.5" strokeWidth={1.6} />
        Back to the shop
      </Link>

      <div className="mt-10 max-w-[560px]">
        <span
          aria-hidden="true"
          className="flex size-13 items-center justify-center rounded-full bg-accent/12 text-accent-2"
        >
          <ShieldCheck className="size-6" strokeWidth={1.4} />
        </span>

        <span className="mt-7 block text-[13px] tracking-[0.08em] text-accent-2 uppercase">
          Studio only
        </span>
        <h1 className="mt-3 font-heading text-[34px] leading-[1.1] font-normal sm:text-[42px]">
          Welcome to the admin page.
        </h1>
        <p className="mt-4 text-[15px] leading-[27px] text-foreground/72">
          This is where the run gets managed — the volume, what is still cut,
          and the orders waiting on the bench. Nothing is wired to it yet; it
          appears because this deployment is configured as the studio&rsquo;s
          own.
        </p>

        <p className="mt-8 border-t border-border pt-5 text-[12.5px] leading-[21px] text-foreground/52">
          Shown by <code className="font-mono">NEXT_PUBLIC_ADMIN_ENABLED</code>{" "}
          in <code className="font-mono">.env</code>. Set it to anything else
          and both this page and the menu entry disappear.
        </p>
      </div>
    </div>
  );
}
