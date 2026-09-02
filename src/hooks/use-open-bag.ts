"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { DESKTOP_BAG_QUERY } from "@/hooks/use-media-query";
import { useCartStore } from "@/lib/cart-store";

/**
 * One entry point for "show me the bag". Desktop keeps the side sheet;
 * anything narrower goes to /bag, which is the same bag as a full page.
 *
 * `desktopHref` is for callers that are on another route (checkout) and need
 * to get back to a page the sheet can sit over.
 */
export function useOpenBag(desktopHref?: string) {
  const openBag = useCartStore((s) => s.openBag);
  const router = useRouter();

  return useCallback(() => {
    if (!window.matchMedia(DESKTOP_BAG_QUERY).matches) {
      router.push("/bag");
      return;
    }
    if (desktopHref) router.push(desktopHref);
    openBag();
  }, [desktopHref, openBag, router]);
}
