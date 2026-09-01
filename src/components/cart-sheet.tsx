"use client";

import { Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { productForLine, useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/data";
import { SIZES } from "@/lib/types";

export function CartSheet() {
  const open = useCartStore((s) => s.open);
  const closeBag = useCartStore((s) => s.closeBag);

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

        <BagView />
      </SheetContent>
    </Sheet>
  );
}

function BagView() {
  const bag = useCartStore((s) => s.bag);
  const total = useCartStore((s) => s.total());
  const decrementLine = useCartStore((s) => s.decrementLine);
  const incrementLine = useCartStore((s) => s.incrementLine);
  const removeLine = useCartStore((s) => s.removeLine);
  const changeLineSize = useCartStore((s) => s.changeLineSize);
  const startCheckout = useCartStore((s) => s.startCheckout);
  const closeBag = useCartStore((s) => s.closeBag);
  const router = useRouter();

  function goToCheckout() {
    startCheckout();
    closeBag();
    router.push("/checkout");
  }

  if (bag.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <h3 className="font-heading text-xl font-normal">
          Nothing in the bag yet.
        </h3>
        <p className="text-[14.5px] leading-7 text-foreground/70">
          Volume 01 is five pieces. Open any of them for the cloth, the fit
          and the sizes still running.
        </p>
        <Button
          render={<Link href="/#collection" onClick={closeBag} />}
          nativeButton={false}
          variant="outline"
          className="self-start border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
          See the collection
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto">
        {bag.map((line) => {
          const product = productForLine(line.productId);
          const madeToOrder = product?.badge === "Made to order";
          return (
            <div
              key={line.key}
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-b border-border py-5"
            >
              <div className="relative aspect-3/4 w-16 overflow-hidden">
                <ProductImage alt={line.name} hint={line.name} />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-lg font-normal leading-tight">
                    {line.name}
                  </h3>
                  <span className="text-[13.5px] text-foreground/78 font-feature-tnum">
                    {formatMoney(line.qty * line.unit)}
                  </span>
                </div>
                <p className="mt-2 text-xs tracking-[0.08em] text-foreground/55 uppercase">
                  {line.color} · Size {line.size}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {madeToOrder ? (
                    <span className="text-[11px] tracking-[0.08em] text-accent-2 uppercase">
                      Cut to measure
                    </span>
                  ) : (
                    <Select
                      value={line.size}
                      onValueChange={(v) => v && changeLineSize(line.key, v)}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label="Size"
                        className="h-auto min-h-0 gap-1.5 border-border px-2 py-1 text-[13px] font-feature-tnum shadow-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            disabled={product?.out.includes(s)}
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="flex items-center gap-0.5 rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => decrementLine(line.key)}
                      aria-label="Decrease quantity"
                      className="flex size-7 items-center justify-center"
                    >
                      <Minus className="size-3" strokeWidth={1.6} />
                    </button>
                    <span className="min-w-[22px] text-center text-[13.5px] font-feature-tnum">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementLine(line.key)}
                      aria-label="Increase quantity"
                      className="flex size-7 items-center justify-center"
                    >
                      <Plus className="size-3" strokeWidth={1.6} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="text-xs tracking-[0.06em] text-foreground/52 underline underline-offset-3 uppercase"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs tracking-[0.09em] text-foreground/58 uppercase">
            Subtotal
          </span>
          <span className="font-heading text-2xl font-feature-tnum">
            {formatMoney(total)}
          </span>
        </div>
        <p className="mt-2.5 text-[12.5px] leading-[22px] text-foreground/60">
          Shipping and duties calculated at checkout. Made-to-order pieces
          ship in six weeks.
        </p>
        <Button
          type="button"
          onClick={goToCheckout}
          variant="outline"
          className="mt-4 w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
          Checkout — {formatMoney(total)}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={closeBag}
          className="mt-2 w-full text-accent hover:bg-accent/10 hover:text-accent"
        >
          Keep looking
        </Button>
      </div>
    </>
  );
}
