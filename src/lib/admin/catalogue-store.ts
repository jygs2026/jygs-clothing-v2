"use client";

import { create } from "zustand";

import {
  CATALOGUE,
  categoryOf,
  type CatalogueItem,
  type ProductStatus,
} from "@/lib/admin/catalogue";
import { SIZES, type Size } from "@/lib/types";

/**
 * The catalogue while somebody is working on it. Session-only, like the
 * customer book and the staff directory — a reload puts it back to what the
 * shop's own product data says, so nobody mistakes it for a real database.
 *
 * Only the screens that *manage* the catalogue read this. Orders, the logs
 * and the reports keep reading the static seed on purpose: an order placed in
 * March recorded what a piece was called and cost in March, and renaming it
 * today must not quietly rewrite what was sold then.
 */

/** What the form collects. Everything else about a piece is derived. */
export type ProductDraft = {
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  status: ProductStatus;
  cloth: string;
  colours: number;
  image?: string;
};

type CatalogueState = {
  items: CatalogueItem[];
  addProduct: (draft: ProductDraft) => CatalogueItem;
  updateProduct: (id: string, draft: ProductDraft) => void;
  duplicateProduct: (id: string) => CatalogueItem | undefined;
  setStatus: (ids: string[], status: ProductStatus) => void;
  removeProducts: (ids: string[]) => void;
  /** Puts a whole list back — what Undo on a removal restores. */
  replaceProducts: (items: CatalogueItem[]) => void;
  /** One size, one step. Never takes a shelf below zero. */
  adjustStock: (id: string, size: Size, delta: number) => void;
  /** Sets a size outright — what the product page's stock table writes. */
  setStock: (id: string, size: Size, onHand: number) => void;
};

const today = () => new Date().toISOString().slice(0, 10);

/** A new piece has nothing on the shelf yet, in any size. */
const emptyStock = () => SIZES.map((size) => ({ size, onHand: 0, committed: 0 }));

/**
 * JYGS-KNI-014, continuing the run rather than restarting it. Reads the
 * highest number already used on that shelf so a new knit cannot be handed a
 * code an archived one still holds.
 */
export function nextSku(items: CatalogueItem[], category: string) {
  const shelf = category.slice(0, 3).toUpperCase();
  const used = items
    .map((item) => new RegExp(`^JYGS-${shelf}-(\\d+)$`).exec(item.sku)?.[1])
    .filter((n): n is string => Boolean(n))
    .map(Number);
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `JYGS-${shelf}-${String(next).padStart(3, "0")}`;
}

export const useCatalogueStore = create<CatalogueState>()((set, get) => ({
  items: CATALOGUE,

  addProduct: (draft) => {
    const item: CatalogueItem = {
      ...draft,
      id: `p-${Date.now().toString(36)}`,
      category: draft.category || categoryOf(draft.name),
      stock: emptyStock(),
      out: [],
      updated: today(),
    };
    set((state) => ({ items: [item, ...state.items] }));
    return item;
  },

  updateProduct: (id, draft) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...draft, updated: today() } : item
      ),
    })),

  duplicateProduct: (id) => {
    const source = get().items.find((item) => item.id === id);
    if (!source) return undefined;
    const copy: CatalogueItem = {
      ...source,
      id: `p-${Date.now().toString(36)}`,
      sku: nextSku(get().items, source.category),
      name: `${source.name} (copy)`,
      // A copy is somewhere to start, not something to sell — and it has none
      // of the original's stock, which belongs to the piece already cut.
      status: "Draft",
      stock: emptyStock(),
      updated: today(),
    };
    set((state) => ({ items: [copy, ...state.items] }));
    return copy;
  },

  setStatus: (ids, status) =>
    set((state) => ({
      items: state.items.map((item) =>
        ids.includes(item.id) ? { ...item, status, updated: today() } : item
      ),
    })),

  removeProducts: (ids) =>
    set((state) => ({ items: state.items.filter((item) => !ids.includes(item.id)) })),

  replaceProducts: (items) => set({ items }),

  adjustStock: (id, size, delta) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: item.stock.map((row) =>
                row.size === size
                  ? { ...row, onHand: Math.max(0, row.onHand + delta) }
                  : row
              ),
              updated: today(),
            }
          : item
      ),
    })),

  setStock: (id, size, onHand) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: item.stock.map((row) =>
                row.size === size ? { ...row, onHand: Math.max(0, onHand) } : row
              ),
              updated: today(),
            }
          : item
      ),
    })),
}));

/** The catalogue as a lookup, rebuilt only when the catalogue itself changes. */
export function useCatalogueById() {
  const items = useCatalogueStore((s) => s.items);
  return new Map(items.map((item) => [item.id, item]));
}
