"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useSlowConnection } from "@/hooks/use-slow-connection";
import { LOOKBOOK_IMAGES, PRODUCTS, TRENDING } from "@/lib/data";

const SLIDES = TRENDING.map((t, i) => ({
  ...t,
  name: PRODUCTS.find((p) => p.id === t.id)?.name ?? t.id,
  image: LOOKBOOK_IMAGES[(i + 1) % LOOKBOOK_IMAGES.length],
}));

const EASE = [0.2, 0.6, 0.2, 1] as const;

export function Hero() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const slow = useSlowConnection();

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
    }, 5000);
  }

  useEffect(() => {
    restart();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const active = SLIDES[index];

  return (
    <section className="relative left-1/2 w-screen -ml-[50vw]">
      <div className="relative h-[92vh] max-h-[820px] min-h-[600px] w-full overflow-hidden bg-[#1a1917]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-[900ms]"
            style={{
              opacity: i === index ? 1 : 0,
              transitionTimingFunction: "cubic-bezier(.2,.6,.2,1)",
            }}
          >
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{ scale: i === index ? 1 : 1.07 }}
              transition={{ duration: 6.5, ease: "linear" }}
            >
              <Image
                src={slide.image}
                alt={`${slide.name} — trending look, full length`}
                fill
                preload={i === 0 && !slow}
                loading={i === 0 && !slow ? "eager" : "lazy"}
                quality={i !== 0 && slow ? 40 : 75}
                sizes="100vw"
                style={{ filter: "sepia(0.16) saturate(0.88) contrast(1.06)" }}
                className="object-cover object-top"
              />
            </motion.div>
          </div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/25 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex h-full max-w-[1240px] flex-col justify-between px-5 py-6 sm:px-6 sm:py-9">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-md border border-white/35 bg-black/25 px-2.5 py-[5px] text-[10px] tracking-[0.14em] text-white uppercase backdrop-blur-sm">
              Trending now
            </span>
            <span className="text-[11px] tracking-[0.14em] text-white/65 uppercase font-feature-tnum">
              {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>

          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="max-w-[680px]"
          >
            <span className="mb-4 block text-[13px] tracking-[0.14em] text-[#e1ad66] uppercase font-feature-tnum">
              Volume 01 — Ash &amp; Bone
            </span>
            <h1 className="ml-[-0.03em] font-heading text-[42px] leading-[1.06] font-normal tracking-[-0.012em] text-white sm:text-[60px] min-[1000px]:text-[80px]">
              <span className="block">Clothes that outlive</span>
              <span className="block">the season that</span>
              <span className="block">made them.</span>
            </h1>
            <p className="mt-6 max-w-[50ch] text-[15.5px] leading-7 text-white/78 sm:text-[16.5px]">
              JYGS makes a short run twice a year — outerwear, knitwear and
              everyday weights in cloth we can name, cut once and then left
              alone.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/#waitlist"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 font-heading text-sm font-semibold text-[#1a1917] transition-opacity hover:opacity-85"
              >
                Join the waitlist
              </Link>
              <Link
                href="/#collection"
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-4 py-2 font-heading text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the collection
              </Link>
            </div>
          </motion.div>
        </div>

      </div>

      <div className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-6 sm:pt-7">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <span className="font-heading text-[19px] leading-tight">
            {active.name}
          </span>
          <span className="text-xs tracking-[0.09em] text-foreground/55 uppercase font-feature-tnum">
            {active.meta}
          </span>
        </div>
        <p className="mt-4 text-xs tracking-[0.1em] text-foreground/55 uppercase font-feature-tnum">
          Waitlist open · 400 pieces · ships 12 September
        </p>
      </div>
    </section>
  );
}
