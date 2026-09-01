"use client";

import { useState } from "react";

import { ProductImage } from "@/components/product-image";
import { SHOTS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ProductGallery({
  productName,
  image,
}: {
  productName: string;
  image?: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="plate relative aspect-[1093/1400] w-full overflow-hidden">
        {SHOTS.map((shot, i) => (
          <div
            key={shot.key}
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            <ProductImage
              src={image}
              priority={i === 0}
              alt={`${productName} — ${shot.label.toLowerCase()}`}
              hint={`${productName} — ${shot.label.toLowerCase()}`}
            />
          </div>
        ))}
      </div>
      <div role="tablist" aria-label="Product photographs" className="grid grid-cols-5 gap-2">
        {SHOTS.map((shot, i) => (
          <button
            key={shot.key}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={shot.label}
            onClick={() => setActive(i)}
            className={cn(
              "relative aspect-3/4 cursor-pointer overflow-hidden rounded-[2px] border bg-card transition-opacity",
              i === active ? "border-accent opacity-100" : "border-border opacity-60"
            )}
          >
            <ProductImage src={image} alt={shot.label} hint={shot.label} className="pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}
