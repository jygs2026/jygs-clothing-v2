"use client";

import { BagContents } from "@/components/bag-contents";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DESKTOP_BAG_QUERY, useMediaQuery } from "@/hooks/use-media-query";
import { useCartStore } from "@/lib/cart-store";

/**
 * Desktop only. Below the breakpoint the bag is a route (/bag) instead —
 * see useOpenBag, which is what every "view bag" affordance calls.
 */
export function CartSheet() {
  const open = useCartStore((s) => s.open);
  const closeBag = useCartStore((s) => s.closeBag);
  const isDesktop = useMediaQuery(DESKTOP_BAG_QUERY);

  if (!isDesktop) return null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeBag()}>
      <SheetContent className="flex w-full flex-col gap-0 p-6 sm:max-w-[420px]">
        <SheetHeader className="p-0">
          <div className="flex items-baseline justify-between gap-4">
            <SheetTitle className="font-heading text-[28px] font-normal leading-[1.14]">
              Your bag
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Your bag
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4.5 border-t border-border" />

        <BagContents layout="sheet" onLeave={closeBag} />
      </SheetContent>
    </Sheet>
  );
}
