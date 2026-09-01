"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CarouselItem = {
  product: Product;
  rank?: string;
  meta?: string;
};

/**
 * Horizontally-scrolling product shelf: native touch/trackpad scrolling,
 * mouse drag-to-scroll on desktop, smooth-scrolling arrow controls, and
 * scroll-snap so it always settles on a card. Takes `items` shaped for
 * `ProductCard`, so it's a drop-in for any product list — static data now,
 * an API response later.
 */
export function ProductCarousel({ items }: { items: CarouselItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });

  function updateEdges() {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [items.length]);

  function step(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const gap = 28;
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // touch/pen keep native scrolling
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.startScroll - dx;
  }

  function endDrag() {
    drag.current.active = false;
  }

  function onClickCapture(e: React.MouseEvent) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="region"
        aria-label="Scrollable product carousel"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className="no-scrollbar flex snap-x snap-mandatory gap-x-7 overflow-x-auto scroll-smooth pb-2 cursor-grab select-none active:cursor-grabbing"
      >
        {items.map(({ product, rank, meta }) => (
          <div
            key={product.id}
            data-carousel-card
            className="w-[220px] shrink-0 snap-start sm:w-[240px] lg:w-[258px]"
          >
            <ProductCard product={product} rank={rank} meta={meta} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Scroll to previous products"
        className={cn(
          "absolute top-1/2 -left-3.5 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)] transition-opacity duration-200 sm:-left-4.5",
          canPrev ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ChevronLeft className="size-4" strokeWidth={1.4} />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Scroll to more products"
        className={cn(
          "absolute top-1/2 -right-3.5 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)] transition-opacity duration-200 sm:-right-4.5",
          canNext ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ChevronRight className="size-4" strokeWidth={1.4} />
      </button>
    </div>
  );
}
