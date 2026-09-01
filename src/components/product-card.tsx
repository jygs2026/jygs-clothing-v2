"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
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
  const openBag = useCartStore((s) => s.openBag);
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
      className="flex flex-col"
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

        <div
          className="absolute right-3.5 bottom-3.5 left-3.5 z-10 flex gap-2 transition-all duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "none" : "translateY(6px)",
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <Button
            render={<Link href={href} />}
            nativeButton={false}
            variant="secondary"
            className="min-h-[34px] flex-1 border border-border bg-background text-[12px] tracking-[0.06em] uppercase"
          >
            Details
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={`Add ${product.name} to bag`}
            title={`Add ${product.name} to bag`}
            onClick={handleAdd}
            className="min-h-[34px] w-[34px] flex-none border border-border bg-background"
          >
            <ShoppingBag className="size-4" strokeWidth={1.4} />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <Link href={href}>
          <h3 className="font-heading text-[21px] leading-[1.2] tracking-[-0.004em] cursor-pointer">
            {product.name}
          </h3>
        </Link>
        <span className="text-sm text-foreground/78 font-feature-tnum">
          {product.price}
        </span>
      </div>
      <p className="mt-2 text-[13.5px] leading-6 text-foreground/66">
        {product.cloth}
      </p>

      {meta ? (
        <p className="mt-3 text-[11px] tracking-[0.09em] text-foreground/48 uppercase font-feature-tnum">
          {meta}
        </p>
      ) : (
        <div className="mt-3.5 flex gap-2">
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
    </article>
  );
}
