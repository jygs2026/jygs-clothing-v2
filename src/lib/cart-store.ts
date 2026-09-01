"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ALL_PRODUCTS, priceToNumber } from "@/lib/data";
import type { BagLine, CheckoutStep, Order, Product } from "@/lib/types";

type CartState = {
  bag: BagLine[];
  open: boolean;
  step: CheckoutStep;
  paying: boolean;
  order: Order | null;

  count: () => number;
  total: () => number;

  addLine: (
    product: Product,
    colorName: string,
    size: string,
    qty?: number
  ) => void;
  buyNow: (
    product: Product,
    colorName: string,
    size: string,
    qty?: number
  ) => void;
  changeLineSize: (key: string, size: string) => void;
  incrementLine: (key: string) => void;
  decrementLine: (key: string) => void;
  removeLine: (key: string) => void;

  openBag: () => void;
  closeBag: () => void;

  startCheckout: () => void;
  backToBag: () => void;
  goToDetails: () => void;
  submitDetails: (details: { email: string; name: string; city: string; postcode: string }) => void;
  submitPayment: () => Promise<void>;
  finishOrder: () => void;
};

function lineKey(productId: string, colorName: string, size: string) {
  return `${productId}|${colorName}|${size}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      bag: [],
      open: false,
      step: "bag",
      paying: false,
      order: null,

      count: () => get().bag.reduce((n, b) => n + b.qty, 0),
      total: () => get().bag.reduce((n, b) => n + b.qty * b.unit, 0),

      addLine: (product, colorName, size, qty = 1) => {
        const key = lineKey(product.id, colorName, size);
        set((state) => {
          const at = state.bag.findIndex((b) => b.key === key);
          if (at > -1) {
            const bag = state.bag.map((b, i) =>
              i === at ? { ...b, qty: b.qty + qty } : b
            );
            return { bag };
          }
          const bag = state.bag.concat({
            key,
            productId: product.id,
            name: product.name,
            color: colorName,
            size,
            qty,
            unit: priceToNumber(product.price),
          });
          return { bag };
        });
      },

      buyNow: (product, colorName, size, qty = 1) => {
        get().addLine(product, colorName, size, qty);
        set({ open: true, step: "details" });
      },

      changeLineSize: (key, size) => {
        set((state) => {
          const index = state.bag.findIndex((b) => b.key === key);
          if (index === -1) return state;
          const line = state.bag[index];
          if (line.size === size) return state;
          const newKey = lineKey(line.productId, line.color, size);
          const dupeAt = state.bag.findIndex(
            (b, i) => i !== index && b.key === newKey
          );
          if (dupeAt > -1) {
            return {
              bag: state.bag
                .map((b, i) =>
                  i === dupeAt ? { ...b, qty: b.qty + line.qty } : b
                )
                .filter((_, i) => i !== index),
            };
          }
          return {
            bag: state.bag.map((b, i) =>
              i === index ? { ...b, key: newKey, size } : b
            ),
          };
        });
      },

      incrementLine: (key) => {
        set((state) => ({
          bag: state.bag.map((b) => (b.key === key ? { ...b, qty: b.qty + 1 } : b)),
        }));
      },

      decrementLine: (key) => {
        set((state) => {
          const line = state.bag.find((b) => b.key === key);
          if (!line) return state;
          if (line.qty > 1) {
            return {
              bag: state.bag.map((b) =>
                b.key === key ? { ...b, qty: b.qty - 1 } : b
              ),
            };
          }
          return { bag: state.bag.filter((b) => b.key !== key) };
        });
      },

      removeLine: (key) => {
        set((state) => ({ bag: state.bag.filter((b) => b.key !== key) }));
      },

      openBag: () => set({ open: true }),
      closeBag: () => set({ open: false }),

      startCheckout: () => set({ step: "details" }),
      backToBag: () => set({ step: "bag" }),
      goToDetails: () => set({ step: "details" }),

      submitDetails: ({ email, name, city, postcode }) => {
        set({
          step: "payment",
          order: {
            no: "",
            email,
            shipTo: [name, city, postcode].filter(Boolean).join(", "),
            paid: "",
            count: get().count(),
          },
        });
      },

      submitPayment: async () => {
        if (get().paying) return;
        set({ paying: true });
        await new Promise((resolve) => setTimeout(resolve, 900));
        set((state) => ({
          paying: false,
          step: "done",
          bag: [],
          order: state.order
            ? {
                ...state.order,
                no: "JY-" + String(4820 + state.bag.length * 7),
                paid: formatTotal(state.bag),
                count: state.count(),
              }
            : state.order,
        }));
      },

      finishOrder: () => set({ open: false, step: "bag", bag: [], order: null }),
    }),
    {
      name: "jygs-bag",
      partialize: (state) => ({ bag: state.bag }),
    }
  )
);

function formatTotal(bag: BagLine[]) {
  const total = bag.reduce((n, b) => n + b.qty * b.unit, 0);
  return "₹" + total.toLocaleString("en-IN");
}

export function productForLine(productId: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === productId);
}
