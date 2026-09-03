import type { Address, PaymentCard, Size } from "@/lib/types";

/**
 * Stand-in order history for the account page. Real orders will come from
 * whatever stores them; the shape is deliberately close to what a checkout
 * would write, so the components survive the swap.
 */
export type AccountOrderLine = {
  productId: string;
  color: string;
  size: Size;
  qty: number;
};

export type AccountOrder = {
  no: string;
  placed: string;
  status: "Delivered" | "In transit" | "Being cut";
  /** What the courier last said — the line under the status. */
  note: string;
  total: number;
  lines: AccountOrderLine[];
};

export const MOCK_ORDERS: AccountOrder[] = [
  {
    no: "JY-4869",
    placed: "24 August 2026",
    status: "In transit",
    note: "Left the studio Tuesday · arriving Thursday",
    total: 40000,
    lines: [
      { productId: "overshirt", color: "Ash", size: "M", qty: 1 },
      { productId: "hoodie", color: "Chalk", size: "M", qty: 1 },
    ],
  },
  {
    no: "JY-4841",
    placed: "2 July 2026",
    status: "Delivered",
    note: "Signed for on 5 July",
    total: 6800,
    lines: [{ productId: "crew", color: "Bone", size: "S", qty: 1 }],
  },
  {
    no: "JY-4820",
    placed: "18 May 2026",
    status: "Being cut",
    note: "Made to order · four weeks from the mill",
    total: 7600,
    lines: [{ productId: "his-hers-blanks", color: "Chalk", size: "M", qty: 2 }],
  },
];

/**
 * The customer a Google sign-in returns, filled in the way a returning
 * customer's record would be. Signing in by email starts empty instead, so
 * both the populated and the "nothing here yet" states are reachable.
 */
export const DEMO_PROFILE: {
  phone: string;
  avatar: string;
  address: Address;
} = {
  phone: "+91 98404 21188",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces&q=80&auto=format",
  address: {
    line: "12 Rutland Gate, Kilpauk",
    city: "Chennai",
    postcode: "600010",
    country: "India",
  },
};

/** Saved ways to pay. Nothing but what a receipt would print is ever kept. */
export const DEMO_CARDS: PaymentCard[] = [
  {
    id: "card-visa",
    brand: "Visa",
    last4: "4291",
    expiry: "04/29",
    holder: "Ananya Iyer",
    primary: true,
  },
  {
    id: "card-mastercard",
    brand: "Mastercard",
    last4: "8842",
    expiry: "11/27",
    holder: "Ananya Iyer",
    primary: false,
  },
];
