"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEMO_CARDS, DEMO_PROFILE } from "@/lib/account-data";
import type { Address, PaymentCard } from "@/lib/types";

/**
 * Sign-in and the customer record behind it, mocked end to end. Nothing here
 * talks to a server: Google returns a sample customer after a short pause, any
 * six digits pass as the emailed code, and every profile edit lands in
 * localStorage. It exists so the account UI can be built and reviewed before
 * there is a backend to build it against — swap the bodies of the async
 * actions for real calls and the components need no changes.
 */

export type Account = {
  name: string;
  email: string;
  /** When the account was opened — shown on the profile panel. */
  since: string;
  phone: string;
  /** A data URL from the picker, a remote photo, or null for initials. */
  avatar: string | null;
  address: Address | null;
  cards: PaymentCard[];
};

/** What a Google sign-in hands back, once there is a real one. */
const GOOGLE_ACCOUNT: Account = {
  name: "Ananya Iyer",
  email: "ananya.iyer@gmail.com",
  since: "March 2026",
  phone: DEMO_PROFILE.phone,
  avatar: DEMO_PROFILE.avatar,
  address: DEMO_PROFILE.address,
  cards: DEMO_CARDS,
};

type Busy = false | "google" | "sending" | "verifying";

type ProfilePatch = Partial<Pick<Account, "name" | "email" | "phone">>;

type AuthState = {
  account: Account | null;
  /** The email flow is two steps: hand over an address, then the code. */
  step: "email" | "code";
  pendingEmail: string;
  busy: Busy;
  error: string | null;

  signInWithGoogle: () => Promise<void>;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  editEmail: () => void;
  signOut: () => void;

  updateProfile: (patch: ProfilePatch) => void;
  setAvatar: (avatar: string | null) => void;
  updateAddress: (address: Address) => void;
  addCard: (card: Omit<PaymentCard, "id" | "primary">) => void;
  removeCard: (id: string) => void;
  makeCardPrimary: (id: string) => void;
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** "ananya.iyer" → "Ananya Iyer", so the mock account has a name to greet. */
function nameFromEmail(email: string) {
  return (
    email
      .split("@")[0]
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" ") || "Guest"
  );
}

export function initialsOf(account: Account) {
  const parts = account.name.split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? account.email[0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Someone signing in by email starts with nothing but an address on file. */
function freshAccount(email: string): Account {
  return {
    name: nameFromEmail(email),
    email,
    since: "Today",
    phone: "",
    avatar: null,
    address: null,
    cards: [],
  };
}

/**
 * An account persisted by an earlier build has no profile fields. Fill them in
 * on the way out of storage rather than letting a page read `undefined.map`.
 */
function withDefaults(account: Partial<Account> | null | undefined): Account | null {
  if (!account?.email) return null;
  return {
    name: account.name ?? nameFromEmail(account.email),
    email: account.email,
    since: account.since ?? "Today",
    phone: account.phone ?? "",
    avatar: account.avatar ?? null,
    address: account.address ?? null,
    cards: account.cards ?? [],
  };
}

/** Exactly one card is the default; promoting one demotes the rest. */
function onlyPrimary(cards: PaymentCard[], id: string) {
  return cards.map((card) => ({ ...card, primary: card.id === id }));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      step: "email",
      pendingEmail: "",
      busy: false,
      error: null,

      signInWithGoogle: async () => {
        if (get().busy) return;
        set({ busy: "google", error: null });
        await pause(900); // stands in for the OAuth round trip
        set({ account: GOOGLE_ACCOUNT, busy: false, step: "email", pendingEmail: "" });
      },

      sendCode: async (email) => {
        if (get().busy) return;
        set({ busy: "sending", error: null });
        await pause(800); // stands in for the send
        set({ busy: false, step: "code", pendingEmail: email });
      },

      verifyCode: async (code) => {
        if (get().busy) return;
        const digits = code.replace(/\D/g, "");
        if (digits.length !== 6) {
          set({ error: "Enter the six digits from the email." });
          return;
        }
        set({ busy: "verifying", error: null });
        await pause(700); // stands in for the check
        set({
          account: freshAccount(get().pendingEmail),
          busy: false,
          step: "email",
          pendingEmail: "",
        });
      },

      editEmail: () => set({ step: "email", error: null }),

      signOut: () =>
        set({ account: null, step: "email", pendingEmail: "", error: null }),

      updateProfile: (patch) =>
        set((state) =>
          state.account ? { account: { ...state.account, ...patch } } : state
        ),

      setAvatar: (avatar) =>
        set((state) =>
          state.account ? { account: { ...state.account, avatar } } : state
        ),

      updateAddress: (address) =>
        set((state) =>
          state.account ? { account: { ...state.account, address } } : state
        ),

      addCard: (card) =>
        set((state) => {
          if (!state.account) return state;
          const added: PaymentCard = {
            ...card,
            id: `card-${Date.now().toString(36)}`,
            // The first card on the account is the one we would charge.
            primary: state.account.cards.length === 0,
          };
          return { account: { ...state.account, cards: [...state.account.cards, added] } };
        }),

      removeCard: (id) =>
        set((state) => {
          if (!state.account) return state;
          const cards = state.account.cards.filter((card) => card.id !== id);
          // Removing the default promotes whatever is left at the top.
          if (cards.length && !cards.some((card) => card.primary)) {
            cards[0] = { ...cards[0], primary: true };
          }
          return { account: { ...state.account, cards } };
        }),

      makeCardPrimary: (id) =>
        set((state) =>
          state.account
            ? { account: { ...state.account, cards: onlyPrimary(state.account.cards, id) } }
            : state
        ),
    }),
    {
      name: "jygs-account",
      // Only the account survives a reload; a half-finished code entry should not.
      partialize: (state) => ({ account: state.account }),
      version: 1,
      migrate: (persisted) => ({
        account: withDefaults((persisted as { account?: Partial<Account> })?.account),
      }),
    }
  )
);
