"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { BagContents } from "@/components/bag-contents";
import { DESKTOP_BAG_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useMounted } from "@/hooks/use-mounted";
import { useCartStore } from "@/lib/cart-store";

/**
 * The bag as a full page. It is where the header's bag button goes below the
 * desktop breakpoint; widen the window and it hands back to the side sheet so
 * the bag is never showing in two places at once.
 */
export default function BagPage() {
  const count = useCartStore((s) => s.count());
  const openBag = useCartStore((s) => s.openBag);
  const isDesktop = useMediaQuery(DESKTOP_BAG_QUERY);
  const mounted = useMounted();
  const router = useRouter();

  useEffect(() => {
    if (!isDesktop) return;
    openBag();
    router.replace("/");
  }, [isDesktop, openBag, router]);

  return (
    <div className="mx-auto max-w-[640px] px-5 pt-5 pb-14 sm:px-6">
      <Link
        href="/#collection"
        className="inline-flex items-center gap-1.5 text-xs tracking-[0.09em] text-foreground/55 uppercase transition-colors hover:text-accent-2"
      >
        <ChevronLeft className="size-3.5" strokeWidth={1.6} />
        Keep looking
      </Link>

      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h1 className="font-heading text-[32px] font-normal leading-[1.12]">
          Your bag
        </h1>
        {mounted && count > 0 ? (
          <span className="text-xs tracking-[0.09em] text-foreground/55 uppercase font-feature-tnum">
            {count} {count === 1 ? "piece" : "pieces"}
          </span>
        ) : null}
      </div>

      <div className="mt-4.5 border-t border-border" />

      {/* The bag is restored from localStorage, so there is nothing truthful
          to render on the server — wait for hydration rather than flashing an
          empty bag at someone who has one. */}
      {mounted ? (
        <BagContents layout="page" />
      ) : (
        <div className="h-64" aria-hidden="true" />
      )}
    </div>
  );
}
