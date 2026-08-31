"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ProductImage } from "@/components/product-image";
import { LOOKBOOK_IMAGES, PRODUCTS, TRENDING } from "@/lib/data";
import { cn } from "@/lib/utils";

const SLIDES = TRENDING.map((t, i) => ({
  ...t,
  name: PRODUCTS.find((p) => p.id === t.id)?.name ?? t.id,
  image: LOOKBOOK_IMAGES[(i + 1) % LOOKBOOK_IMAGES.length],
}));

export function Hero() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function goTo(i: number) {
    setIndex(((i % SLIDES.length) + SLIDES.length) % SLIDES.length);
    restart();
  }

  function restart() {
    if (timer.current) clearInterval(timer.current);
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5200);
  }

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const active = SLIDES[index];

  return (
    <section className="grid grid-cols-1 items-end gap-9 py-10 sm:py-16 min-[1000px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[1000px]:gap-x-16 min-[1000px]:py-24">
      <div>
        <h1 className="ml-[-0.042em] font-heading text-[46px] leading-[1.08] font-normal tracking-[-0.012em] sm:text-[64px] min-[1000px]:text-[88px]">
          <span className="block">Clothes that outlive</span>
          <span className="block">the season that</span>
          <span className="block">made them.</span>
        </h1>
        <p className="mt-8 max-w-[52ch] text-[17px] leading-7 text-foreground/80">
          JYGS makes a short run twice a year — outerwear, knitwear and
          everyday weights in cloth we can name, cut once and then left
          alone. Volume 01 opens to the waitlist first.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3.5">
          <Link
            href="/#waitlist"
            className="inline-flex items-center justify-center rounded-md border border-accent px-4 py-2 font-heading text-sm font-semibold text-accent transition-colors hover:bg-accent/12"
          >
            Join the waitlist
          </Link>
          <Link
            href="/#collection"
            className="inline-flex items-center justify-center rounded-md px-1.5 py-2 font-heading text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
          >
            See the collection
          </Link>
        </div>
        <p className="mt-6.5 text-xs tracking-[0.1em] text-foreground/55 uppercase font-feature-tnum">
          Waitlist open · 400 pieces · ships 12 September
        </p>
      </div>

      <figure className="flex w-full flex-col gap-3.5 mx-0 max-w-[74%] min-[860px]:max-w-full">
        <div
          className="plate relative aspect-[1093/1400] w-full overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-[750ms]"
              style={{
                opacity: i === index ? 1 : 0,
                pointerEvents: i === index ? "auto" : "none",
                transitionTimingFunction: "cubic-bezier(.2,.6,.2,1)",
              }}
            >
              <ProductImage
                alt={`${slide.name} — trending look, full length`}
                hint={`${slide.name} — trending look`}
                src={slide.image}
                priority={i === 0}
              />
            </div>
          ))}
          <span className="absolute top-3.5 left-3.5 z-10 rounded-md border border-accent bg-background px-2.5 py-[5px] text-[10px] tracking-[0.14em] text-accent-2 uppercase">
            Trending now
          </span>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous look"
            className="absolute top-1/2 left-3 z-10 flex size-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300"
            style={{
              opacity: hovered ? 1 : 0,
              transform: `translateY(-50%) translateX(${hovered ? 0 : -6}px)`,
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
            <ChevronLeft className="size-4" strokeWidth={1.4} />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next look"
            className="absolute top-1/2 right-3 z-10 flex size-[34px] -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all duration-300"
            style={{
              opacity: hovered ? 1 : 0,
              transform: `translateY(-50%) translateX(${hovered ? 0 : 6}px)`,
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
            <ChevronRight className="size-4" strokeWidth={1.4} />
          </button>
        </div>

        <figcaption className="flex items-baseline justify-between gap-4">
          <span className="font-heading text-[19px] leading-tight">
            {active.name}
          </span>
          <span className="text-xs tracking-[0.09em] text-foreground/55 uppercase font-feature-tnum">
            {active.meta}
          </span>
        </figcaption>

        <div role="tablist" aria-label="Trending collection" className="grid grid-cols-5 gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={slide.name}
              onClick={() => goTo(i)}
              className={cn(
                "relative aspect-3/4 cursor-pointer overflow-hidden rounded-[2px] border bg-card transition-opacity",
                i === index
                  ? "border-accent opacity-100"
                  : "border-border opacity-60"
              )}
            >
              <ProductImage
                alt={`Look 0${i + 1}`}
                hint={`Look 0${i + 1}`}
                src={slide.image}
                className="pointer-events-none"
              />
            </button>
          ))}
        </div>
      </figure>
    </section>
  );
}
