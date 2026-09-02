"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { CUSTOM_FAMILIES, CUSTOM_TEES, whatsappLink } from "@/lib/data";
import { SIZES } from "@/lib/types";
import type { CustomFamily, CustomTee } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = CustomFamily | "All";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "All", label: "Everything" },
  ...CUSTOM_FAMILIES.map(({ key, label }) => ({ key: key as Filter, label })),
];

const OPEN_BRIEF =
  "Hello JYGS — I'd like a tee made to my own idea rather than one of the ones on the site.\n\n" +
  "What I have in mind:\n" +
  "How many I need:\n" +
  "When I need them by:";

export function Customize() {
  const [filter, setFilter] = useState<Filter>("All");

  const shown =
    filter === "All" ? CUSTOM_TEES : CUSTOM_TEES.filter((t) => t.family === filter);
  const note = CUSTOM_FAMILIES.find((f) => f.key === filter)?.note;

  return (
    <section id="customize" className="scroll-mt-[120px] pt-18 pb-20">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-5">
        <div>
          <span className="mb-3.5 block text-[13px] tracking-[0.08em] text-accent-2 uppercase font-feature-tnum">
            Printed to order
          </span>
          <h2 className="max-w-[22ch] font-heading text-[30px] font-normal leading-[1.14] tracking-[-0.008em] sm:text-[42px]">
            Customize yours
          </h2>
        </div>
        <div className="flex max-w-[38ch] flex-col items-start gap-3.5 min-[860px]:items-end">
          <p className="text-justify text-[14.5px] leading-[26px] text-foreground/72 [hyphens:auto]">
            Pieces for two, for a group, or for one line worth printing. Take
            any of them as they are, or tell us what to change first — the
            wording, the type, the ink.
          </p>
          <a
            href={whatsappLink(OPEN_BRIEF)}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-md border border-accent px-4 py-2 text-[13px] tracking-[0.06em] text-accent transition-colors hover:bg-accent/10"
          >
            <MessageCircle className="size-4" strokeWidth={1.5} />
            Tell us your idea
          </a>
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2.5">
        <div role="group" aria-label="Filter by kind" className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => {
            const on = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={on}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-[12px] tracking-[0.08em] uppercase transition-colors",
                  on
                    ? "border-accent bg-accent/10 text-accent-2"
                    : "border-border text-foreground/58 hover:border-accent/50 hover:text-accent-2"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        {note ? (
          <p className="text-[12.5px] leading-[22px] text-foreground/52">{note}</p>
        ) : null}
      </div>

      <div className="mt-9 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((tee) => (
          <CustomTeeCard key={tee.product.id} tee={tee} />
        ))}
      </div>
    </section>
  );
}

function CustomTeeCard({ tee }: { tee: CustomTee }) {
  const { product, family, pitch, lead, alt } = tee;
  const buyNow = useCartStore((s) => s.buyNow);
  const router = useRouter();

  const size = SIZES.find((s) => !product.out.includes(s)) ?? "M";
  const color = product.colors[0];

  function get() {
    buyNow(product, color.name, size, 1);
    router.push("/checkout");
  }

  const brief =
    `Hello JYGS — I'd like to customise the ${product.name} (${product.price}).\n\n` +
    `Piece: ${product.name} · ${family}\n` +
    `Colour: ${color.name} · Size: ${size}\n\n` +
    "What I'd like changed:";

  return (
    <article className="flex h-full flex-col">
      <div className="relative">
        <div className="relative block aspect-4/5 w-full overflow-hidden">
          <ProductImage src={product.image} alt={alt} hint={product.name} />
        </div>
        <span className="absolute top-3.5 left-3.5 z-10 inline-flex items-center rounded-[3px] border border-accent bg-background px-2.5 py-[3px] text-[10px] tracking-[0.1em] text-accent uppercase">
          {family}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-heading text-[21px] leading-[1.2] tracking-[-0.004em]">
          {product.name}
        </h3>
        <span className="text-sm text-foreground/78 font-feature-tnum">
          {product.price}
        </span>
      </div>
      <p className="mt-2 text-[13.5px] leading-6 text-foreground/66">
        {product.cloth}
      </p>
      <p className="mt-2.5 text-[13px] leading-[22px] text-accent-2">{pitch}</p>

      <span className="mt-3 text-[11px] tracking-[0.09em] text-foreground/45 uppercase font-feature-tnum">
        Printed in {lead}
      </span>

      <div className="mt-auto grid grid-cols-2 gap-2.5 pt-4">
        <Button
          type="button"
          onClick={get}
          variant="outline"
          className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
          <ShoppingBag className="size-4" strokeWidth={1.4} />
          Get
        </Button>
        <Button
          render={
            <a href={whatsappLink(brief)} target="_blank" rel="noreferrer noopener" />
          }
          nativeButton={false}
          variant="secondary"
          className="border border-border"
        >
          <MessageCircle className="size-4" strokeWidth={1.4} />
          Customize
        </Button>
      </div>
    </article>
  );
}
