"use client";

import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMounted } from "@/hooks/use-mounted";
import { useOpenBag } from "@/hooks/use-open-bag";
import { useCartStore } from "@/lib/cart-store";
import { FIT_TABLE, formatMoney, priceToNumber } from "@/lib/data";
import { SIZES } from "@/lib/types";
import type { Product, ProductSpec } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/wishlist-store";

export function ProductPurchasePanel({
  product,
  spec,
}: {
  product: Product;
  spec: ProductSpec;
}) {
  const madeToOrder = product.badge === "Made to order";
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState<string>(
    madeToOrder ? "Made to measure" : SIZES.find((s) => !product.out.includes(s)) ?? "M"
  );
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const openBag = useOpenBag();
  const addLine = useCartStore((s) => s.addLine);
  const buyNow = useCartStore((s) => s.buyNow);
  const router = useRouter();

  const unit = priceToNumber(product.price);
  const sizeUnavailable = !madeToOrder && (product.out as string[]).includes(size);
  const color = product.colors[colorIndex];

  function handleAdd() {
    if (sizeUnavailable) return;
    addLine(product, color.name, size, qty);
    toast(`${product.name} · ${size} added to bag`, {
      action: { label: "View bag", onClick: () => openBag() },
    });
  }

  function handleBuyNow() {
    if (sizeUnavailable) return;
    buyNow(product, color.name, size, qty);
    router.push("/checkout");
  }

  return (
    <div>
      <span className="inline-flex items-center rounded-[3px] border border-accent px-2.5 py-[3px] text-[10px] tracking-[0.12em] text-accent uppercase">
        {product.badge}
      </span>
      <h1 className="mt-4 font-heading text-4xl leading-[1.1] font-normal tracking-[-0.01em] sm:text-[46px]">
        {product.name}
      </h1>
      <p className="mt-3.5 flex flex-wrap items-baseline gap-3.5">
        <span className="font-heading text-2xl font-feature-tnum">
          {product.price}
        </span>
        <span className="text-[11.5px] tracking-[0.09em] text-foreground/52 uppercase">
          Free shipping across India · Duties included
        </span>
      </p>
      <p className="mt-4.5 text-[15px] leading-[27px] text-foreground/76">
        {product.note}
      </p>

      <div className="my-6 border-t border-border" />

      <span className="block text-[11px] tracking-[0.11em] text-foreground/55 uppercase">
        Colourway — {color.name}
      </span>
      <div className="mt-3 flex gap-2.5">
        {product.colors.map((c, i) => (
          <button
            key={c.name}
            type="button"
            aria-label={c.name}
            title={c.name}
            onClick={() => setColorIndex(i)}
            className={cn(
              "size-[19px] rounded-full border box-border",
              i === colorIndex ? "border-accent outline outline-accent outline-offset-2" : "border-foreground/30"
            )}
            style={{ background: c.hex }}
          />
        ))}
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <span className="text-[11px] tracking-[0.11em] text-foreground/55 uppercase">
          Size
        </span>
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="text-xs tracking-[0.06em] text-accent-2 underline underline-offset-3 uppercase"
        >
          {guideOpen ? "Hide size guide" : "Size guide"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(madeToOrder ? ["Made to measure"] : SIZES).map((s) => {
          const out = !madeToOrder && (product.out as string[]).includes(s);
          const on = madeToOrder ? true : s === size && !out;
          return (
            <button
              key={s}
              type="button"
              disabled={out}
              onClick={() => !out && !madeToOrder && setSize(s)}
              className={cn(
                "min-h-[46px] min-w-[46px] rounded-md border px-2.5 text-[13.5px] font-feature-tnum",
                out
                  ? "cursor-not-allowed border-border opacity-40 line-through"
                  : "cursor-pointer",
                on && !out
                  ? "border-accent shadow-[inset_0_0_0_1px_var(--accent)]"
                  : !out
                  ? "border-border"
                  : ""
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[13px] leading-[23px] text-foreground/62">
        {spec.fitNote}
      </p>

      {guideOpen ? (
        <>
          <Table className="mt-4.5 font-feature-tnum">
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Chest</TableHead>
                <TableHead>Waist</TableHead>
                <TableHead>Length</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FIT_TABLE.map((row) => (
                <TableRow key={row.size}>
                  <TableCell className="font-normal">{row.size}</TableCell>
                  <TableCell>{row.chest}</TableCell>
                  <TableCell>{row.waist}</TableCell>
                  <TableCell>{row.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-2.5 text-[12.5px] leading-[22px] text-foreground/58">
            Garment measurements in centimetres, taken flat. Made-to-order
            pieces are cut to your own measurements instead.
          </p>
        </>
      ) : null}

      <div className="my-6 border-t border-border" />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex h-11 items-center rounded-[3px] border border-border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty === 1}
            aria-label="Decrease quantity"
            className="flex h-full w-11 items-center justify-center text-[17px] leading-none text-foreground/70 transition-colors hover:text-foreground disabled:opacity-35 disabled:hover:text-foreground/70"
          >
            −
          </button>
          <span
            aria-live="polite"
            className="min-w-[28px] text-center text-[15px] font-feature-tnum"
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            disabled={qty === 9}
            aria-label="Increase quantity"
            className="flex h-full w-11 items-center justify-center text-[17px] leading-none text-foreground/70 transition-colors hover:text-foreground disabled:opacity-35 disabled:hover:text-foreground/70"
          >
            +
          </button>
        </div>

        <p className="flex items-baseline gap-2.5">
          <span className="text-[11px] tracking-[0.11em] text-foreground/50 uppercase">
            Total
          </span>
          <span className="font-heading text-[22px] leading-none font-feature-tnum">
            {formatMoney(qty * unit)}
          </span>
        </p>
      </div>

      {/* Two ways to buy, weighted: the bag is the everyday action, buying now
          is the shortcut — same height, different pull. */}
      <div className="mt-4.5 grid gap-3 sm:grid-cols-[1.12fr_1fr]">
        <Button
          type="button"
          onClick={handleAdd}
          disabled={sizeUnavailable}
          className="group/add h-12 rounded-[3px] px-6 text-[12.5px] tracking-[0.14em] uppercase shadow-[0_1px_0_0_rgba(0,0,0,0.04)] transition-[transform,box-shadow,background-color] hover:-translate-y-px hover:shadow-[0_12px_26px_-16px] hover:shadow-foreground/60"
        >
          <ShoppingBag
            className="size-4 transition-transform group-hover/add:-translate-y-px"
            strokeWidth={1.5}
          />
          {sizeUnavailable ? "Size unavailable" : "Add to bag"}
        </Button>
        <Button
          type="button"
          onClick={handleBuyNow}
          disabled={sizeUnavailable}
          variant="outline"
          className="group/buy h-12 rounded-[3px] border-accent px-6 text-[12.5px] tracking-[0.14em] text-accent-2 uppercase transition-[transform,background-color] hover:-translate-y-px hover:bg-accent/10 hover:text-accent-2"
        >
          Buy it now
          <ArrowRight
            className="size-4 transition-transform group-hover/buy:translate-x-0.5"
            strokeWidth={1.5}
          />
        </Button>
      </div>

      {sizeUnavailable ? (
        <p className="mt-3 text-[13px] leading-[22px] text-accent-2">
          {color.name} in {size} has gone for this run. Try another size — or
          write in and we will tell you when the pattern comes back.
        </p>
      ) : null}

      <SaveToWishlist product={product} />

      <ul className="mt-6 grid list-none gap-2.5 p-0 text-[13.5px] leading-[23px] text-foreground/72">
        <li className="flex gap-2.5">
          <span className="text-accent-2">—</span>
          {spec.delivery}
        </li>
        <li className="flex gap-2.5">
          <span className="text-accent-2">—</span>
          Thirty days to return it unworn, postage on us.
        </li>
        <li className="flex gap-2.5">
          <span className="text-accent-2">—</span>
          Mended free for as long as you own it.
        </li>
      </ul>
    </div>
  );
}

/**
 * Saving is the quiet third option next to buying — a piece someone is not
 * ready to commit to, kept where they can find it again.
 */
function SaveToWishlist({ product }: { product: Product }) {
  const toggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.ids.includes(product.id));
  const mounted = useMounted();
  const router = useRouter();
  // Nothing is known about the wishlist until localStorage is read.
  const saved = mounted && inWishlist;

  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => {
        toggle(product.id);
        toast(
          saved
            ? `${product.name} removed from your wishlist`
            : `${product.name} saved to your wishlist`,
          {
            action: {
              label: "Wishlist",
              onClick: () => router.push("/account/wishlist"),
            },
          }
        );
      }}
      className={cn(
        "mt-4 inline-flex items-center gap-2 border-b py-1 text-[12px] tracking-[0.1em] uppercase transition-colors",
        saved
          ? "border-accent/40 text-accent-2"
          : "border-transparent text-foreground/58 hover:border-accent/40 hover:text-accent-2"
      )}
    >
      <Heart
        className="size-4"
        strokeWidth={1.5}
        fill={saved ? "currentColor" : "none"}
      />
      {saved ? "Saved to wishlist" : "Save to wishlist"}
    </button>
  );
}
