"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ALL_PRODUCTS } from "@/lib/data";
import type { Product } from "@/lib/types";

/**
 * Saved pieces, by product id. It is deliberately its own store rather than a
 * field on the account: a wishlist survives signing out the same way the bag
 * does, and a real backend would sync it up on the next sign-in.
 */

/** Two pieces are saved out of the box, so the wishlist has something to show. */
const SEED = ["overcoat", "linen-shirt"];

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      ids: SEED,

      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((saved) => saved !== id)
            // Newest first — the wishlist reads as a list of recent thoughts.
            : [id, ...state.ids],
        })),

      remove: (id) => set((state) => ({ ids: state.ids.filter((saved) => saved !== id) })),

      clear: () => set({ ids: [] }),
    }),
    { name: "jygs-wishlist" }
  )
);

/** Saved ids resolved to products, skipping anything no longer in the catalogue. */
export function wishlistProducts(ids: string[]): Product[] {
  return ids
    .map((id) => ALL_PRODUCTS.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}
