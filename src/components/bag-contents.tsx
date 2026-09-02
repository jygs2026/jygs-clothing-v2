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
import { productForLine, useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/data";
import { SIZES } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The bag itself, shared by the desktop side sheet and the mobile /bag page.
 * `layout` only changes proportions and how "leave the bag" behaves — the
 * lines, sizes, quantities and totals are one implementation.
 */
export type BagLayout = "sheet" | "page";

export function BagContents({
  layout,
  onLeave,
}: {
  layout: BagLayout;
  /** Called before navigating away — the sheet uses it to close itself. */
  onLeave?: () => void;
}) {
  const bag = useCartStore((s) => s.bag);

  if (bag.length === 0) return <BagEmpty layout={layout} onLeave={onLeave} />;

  return (
    <>
      <div
        className={cn(
          "flex flex-col",
          layout === "sheet" && "flex-1 overflow-y-auto"
        )}
      >
        {bag.map((line) => (
          <BagLine key={line.key} lineKey={line.key} layout={layout} />
        ))}
      </div>
      <BagSummary layout={layout} onLeave={onLeave} />
    </>
  );
}

function BagEmpty({
  layout,
  onLeave,
}: {
  layout: BagLayout;
  onLeave?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        layout === "sheet" ? "flex-1 justify-center" : "py-10"
      )}
    >
      <h3 className="font-heading text-xl font-normal">
        Nothing in the bag yet.
      </h3>
      <p className="text-[14.5px] leading-7 text-foreground/70">
        Volume 01 is five pieces. Open any of them for the cloth, the fit and
        the sizes still running.
      </p>
      <Button
        render={<Link href="/#collection" onClick={onLeave} />}
        nativeButton={false}
        variant="outline"
        className="self-start border-accent text-accent hover:bg-accent/10 hover:text-accent"
      >
        See the collection
      </Button>
    </div>
  );
}

function BagLine({
  lineKey,
  layout,
}: {
  lineKey: string;
  layout: BagLayout;
}) {
  const line = useCartStore((s) => s.bag.find((b) => b.key === lineKey));
  const decrementLine = useCartStore((s) => s.decrementLine);
  const incrementLine = useCartStore((s) => s.incrementLine);
  const removeLine = useCartStore((s) => s.removeLine);
  const changeLineSize = useCartStore((s) => s.changeLineSize);

  if (!line) return null;

  const product = productForLine(line.productId);
  const madeToOrder = product?.badge === "Made to order";

  return (
    <div
      className={cn(
        "grid gap-4 border-b border-border py-5",
        layout === "sheet"
          ? "grid-cols-[64px_minmax(0,1fr)]"
          : "grid-cols-[96px_minmax(0,1fr)] gap-5 sm:grid-cols-[120px_minmax(0,1fr)]"
      )}
    >
      <Link
        href={`/product/${line.productId}`}
        className={cn(
          "relative aspect-3/4 overflow-hidden",
          layout === "sheet" ? "w-16" : "w-24 sm:w-30"
        )}
      >
        <ProductImage
          src={product?.image}
          alt={`${line.name} — ${line.color}`}
          hint={line.name}
        />
      </Link>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className={cn(
              "font-heading font-normal leading-tight",
              layout === "sheet" ? "text-lg" : "text-lg sm:text-xl"
            )}
          >
            {line.name}
          </h3>
          <span className="shrink-0 text-[13.5px] text-foreground/78 font-feature-tnum">
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
}

function BagSummary({
  layout,
  onLeave,
}: {
  layout: BagLayout;
  onLeave?: () => void;
}) {
  const total = useCartStore((s) => s.total());
  const startCheckout = useCartStore((s) => s.startCheckout);
  const router = useRouter();

  function goToCheckout() {
    startCheckout();
    onLeave?.();
    router.push("/checkout");
  }

  return (
    <div className={cn("pt-5", layout === "page" && "mt-1")}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs tracking-[0.09em] text-foreground/58 uppercase">
          Subtotal
        </span>
        <span className="font-heading text-2xl font-feature-tnum">
          {formatMoney(total)}
        </span>
      </div>
      <p className="mt-2.5 text-[12.5px] leading-[22px] text-foreground/60">
        Shipping and duties calculated at checkout. Made-to-order pieces ship
        in six weeks.
      </p>
      <Button
        type="button"
        onClick={goToCheckout}
        variant="outline"
        className="mt-4 w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
      >
        Checkout — {formatMoney(total)}
      </Button>
      {layout === "sheet" ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onLeave}
          className="mt-2 w-full text-accent hover:bg-accent/10 hover:text-accent"
        >
          Keep looking
        </Button>
      ) : (
        <Button
          render={<Link href="/#collection" />}
          nativeButton={false}
          variant="ghost"
          className="mt-2 w-full text-accent hover:bg-accent/10 hover:text-accent"
        >
          Keep looking
        </Button>
      )}
    </div>
  );
}
