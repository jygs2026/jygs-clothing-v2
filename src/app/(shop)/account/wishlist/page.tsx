"use client";

import { Heart, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { useOpenBag } from "@/hooks/use-open-bag";
import { useCartStore } from "@/lib/cart-store";
import { defaultSizeFor } from "@/lib/data";
import { SIZES, type Product } from "@/lib/types";
import { useWishlistStore, wishlistProducts } from "@/lib/wishlist-store";

/**
 * Pieces someone has saved for later. Saving is not reserving — Volume 01 is
 * a short run, so the page says as much rather than implying a hold.
 */
export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const products = wishlistProducts(ids);

  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[1.1] font-normal sm:text-[38px]">
        Wishlist
      </h1>
      <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-[24px] text-foreground/68">
        {products.length
          ? "Saved, not held. A piece stays here until you move it to the bag — or until the run sells through, whichever comes first."
          : "Nothing saved yet."}
      </p>

      {products.length ? (
        <ul className="mt-9 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <WishlistCard key={product.id} product={product} />
          ))}
        </ul>
      ) : (
        <EmptyWishlist />
      )}
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="mt-9 rounded-[3px] border border-border bg-card/45 p-8 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex size-13 items-center justify-center rounded-full bg-accent/12 text-accent-2"
      >
        <Heart className="size-5.5" strokeWidth={1.5} />
      </span>
      <p className="mt-5 font-heading text-[19px]">Nothing saved yet</p>
      <p className="mx-auto mt-2 max-w-[40ch] text-[13.5px] leading-[22px] text-foreground/60">
        Tap the heart on any piece and it waits here — useful when a size is
        between runs, or when you are deciding between two coats.
      </p>
      <Button
        render={<Link href="/#collection" />}
        nativeButton={false}
        variant="outline"
        className="mt-6 h-10 px-6 text-[13px] tracking-[0.05em]"
      >
        Browse the collection
      </Button>
    </div>
  );
}

function WishlistCard({ product }: { product: Product }) {
  const remove = useWishlistStore((s) => s.remove);
  const addLine = useCartStore((s) => s.addLine);
  const openBag = useOpenBag();

  const size = defaultSizeFor(product);
  const soldOut = product.out.length === SIZES.length;

  function handleAdd() {
    addLine(product, product.colors[0].name, size);
    toast(`${product.name} · ${size} added to bag`, {
      action: { label: "View bag", onClick: () => openBag() },
    });
  }

  return (
    <li className="flex h-full flex-col">
      <div className="relative">
        <Link
          href={`/product/${product.id}`}
          className="relative block aspect-3/4 w-full overflow-hidden"
        >
          <ProductImage
            src={product.image}
            alt={`${product.name} — front, on figure`}
            hint={`${product.name} — front, on figure`}
          />
        </Link>
        <button
          type="button"
          aria-label={`Remove ${product.name} from wishlist`}
          title="Remove from wishlist"
          onClick={() => {
            remove(product.id);
            toast(`${product.name} removed from your wishlist.`);
          }}
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full border border-border bg-background/95 text-foreground/60 transition-colors hover:border-accent hover:text-accent-2"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      </div>

      <Link href={`/product/${product.id}`} className="group mt-4 block">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-heading text-[19px] leading-[1.2] transition-colors group-hover:text-accent-2">
            {product.name}
          </h2>
          <span className="text-[13px] text-foreground/78 font-feature-tnum">
            {product.price}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] leading-[21px] text-foreground/62">
          {product.cloth}
        </p>
      </Link>

      <div className="mt-auto flex items-center gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={soldOut}
          onClick={handleAdd}
          className="h-9 flex-1 rounded-[3px] text-[12.5px] tracking-[0.05em] hover:border-accent hover:bg-accent/10 hover:text-accent"
        >
          <ShoppingBag className="size-4" strokeWidth={1.4} />
          {soldOut ? "Sold out" : `Add to bag · ${size}`}
        </Button>
      </div>
    </li>
  );
}
