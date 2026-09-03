"use client";

import { create } from "zustand";

/**
 * Whether the search panel is showing. It lives in a store rather than in the
 * header because three things open it — the header magnifier, the item in the
 * mobile menu, and the "/" key — and the panel itself is mounted once, beside
 * the bag sheet, so it can cover the page from anywhere.
 */
type SearchState = {
  open: boolean;
  /** Carried into the panel so a refine on the results page starts filled. */
  query: string;
  openSearch: (query?: string) => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
};

export const useSearchStore = create<SearchState>()((set) => ({
  open: false,
  query: "",
  openSearch: (query) => set((state) => ({ open: true, query: query ?? state.query })),
  closeSearch: () => set({ open: false }),
  setQuery: (query) => set({ query }),
}));
