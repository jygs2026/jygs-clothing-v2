"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useOpenBag } from "@/hooks/use-open-bag";
import { useCartStore } from "@/lib/cart-store";
import { defaultSizeFor, type SectionKey } from "@/lib/data";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/lib/wishlist-store";

export function ProductCard({
  product,
  rank,
  meta,
  from,
}: {
  product: Product;
  rank?: string;
  meta?: string;
  from?: SectionKey;
}) {
  const [hovered, setHovered] = useState(false);
  const openBag = useOpenBag();
  const addLine = useCartStore((s) => s.addLine);
  const toggleSaved = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.ids.includes(product.id));
  const mounted = useMounted();
  const router = useRouter();
  // The wishlist is restored from localStorage; the server cannot know what
  // is saved, so the heart fills only once the browser has caught up.
  const saved = mounted && inWishlist;

  // `from` names the shelf this card sits on, so the product page's
  // breadcrumb can point back to it.
  const href = from ? `/product/${product.id}?from=${from}` : `/product/${product.id}`;
  const firstAvailableSize = defaultSizeFor(product);

  function handleAdd() {
    addLine(product, product.colors[0].name, firstAvailableSize);
    toast(`${product.name} · ${firstAvailableSize} added to bag`, {
      action: {
        label: "View bag",
        onClick: () => openBag(),
      },
    });
  }

  function handleSave() {
    toggleSaved(product.id);
    toast(
      saved
        ? `${product.name} removed from your wishlist`
        : `${product.name} saved to your wishlist`,
      { action: { label: "Wishlist", onClick: () => router.push("/account/wishlist") } }
    );
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

        <button
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${product.name} from wishlist`
              : `Save ${product.name} to wishlist`
          }
          title={saved ? "Saved to wishlist" : "Save to wishlist"}
          onClick={handleSave}
          className={cn(
            "absolute top-3.5 right-3.5 z-10 flex size-8 items-center justify-center rounded-full border bg-background/95 transition-colors",
            saved
              ? "border-accent text-accent-2"
              : "border-border text-foreground/55 hover:border-accent hover:text-accent-2"
          )}
        >
          <Heart
            className="size-4"
            strokeWidth={1.5}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
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
