"use client";

import { Carousel } from "@/components/carousel";
import { ProductCard } from "@/components/product-card";
import type { SectionKey } from "@/lib/data";
import type { Product } from "@/lib/types";

export type CarouselItem = {
  product: Product;
  rank?: string;
  meta?: string;
};

/**
 * A `Carousel` of `ProductCard`s — a drop-in for any product list, static
 * data now and an API response later.
 */
export function ProductCarousel({
  items,
  label,
  storageKey,
  from,
}: {
  items: CarouselItem[];
  label: string;
  storageKey?: string;
  /** The shelf these cards sit on — carried into the product page's crumb. */
  from?: SectionKey;
}) {
  return (
    <Carousel label={label} storageKey={storageKey}>
      {items.map(({ product, rank, meta }) => (
        <ProductCard
          key={product.id}
          product={product}
          rank={rank}
          meta={meta}
          from={from}
        />
      ))}
    </Carousel>
  );
}
