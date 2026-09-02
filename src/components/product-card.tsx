"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { useOpenBag } from "@/hooks/use-open-bag";
import { useCartStore } from "@/lib/cart-store";
import { SIZES } from "@/lib/types";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  rank,
  meta,
}: {
  product: Product;
  rank?: string;
  meta?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const openBag = useOpenBag();
  const addLine = useCartStore((s) => s.addLine);

  const href = `/product/${product.id}`;
  const firstAvailableSize =
    SIZES.find((s) => !product.out.includes(s)) ?? "M";

  function handleAdd() {
    addLine(product, product.colors[0].name, firstAvailableSize);
    toast(`${product.name} · ${firstAvailableSize} added to bag`, {
      action: {
        label: "View bag",
        onClick: () => openBag(),
      },
    });
  }

  return (
    <article
      className="flex h-full flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <Link
          href={href}
          className="relative block aspect-3/4 w-full cursor-pointer overflow-hidden"
        >
          <ProductImage
            src={product.image}
            alt={`${product.name} — front, on figure`}
            hint={`${product.name} — front, on figure`}
          />
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: hovered ? 1 : 0, pointerEvents: hovered ? "auto" : "none" }}
          >
            <ProductImage
              src={product.image}
              alt={`${product.name} — reverse or detail`}
              hint={`${product.name} — reverse or detail`}
            />
          </div>
        </Link>

        <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center rounded-[3px] border border-accent bg-background px-2.5 py-[3px] text-[10px] tracking-[0.1em] text-accent uppercase">
          {rank ? `${rank} · ${product.badge}` : product.badge}
        </span>
      </div>

      {/* Name, price and cloth are one target — the whole block opens the
          piece, not just the words in the title. */}
      <Link href={href} className="group mt-4 block cursor-pointer">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading text-[21px] leading-[1.2] tracking-[-0.004em] transition-colors group-hover:text-accent-2">
            {product.name}
          </h3>
          <span className="text-sm text-foreground/78 font-feature-tnum">
            {product.price}
          </span>
        </div>
        <p className="mt-2 text-[13.5px] leading-6 text-foreground/66">
          {product.cloth}
        </p>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-4 pt-2">
        {meta ? (
          <p className="text-[11px] tracking-[0.09em] text-foreground/48 uppercase font-feature-tnum">
            {meta}
          </p>
        ) : (
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="block size-[15px] rounded-full border border-foreground/30 box-border"
                style={{ background: color.hex }}
              />
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Add ${product.name} to bag`}
          title={`Add ${product.name} to bag`}
          onClick={handleAdd}
          className="size-9 shrink-0 rounded-[3px] border-border bg-background text-foreground/70 transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
        >
          <ShoppingBag className="size-4" strokeWidth={1.4} />
        </Button>
      </div>
    </article>
  );
}
