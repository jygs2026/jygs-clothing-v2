"use client";

import { create } from "zustand";

import { ALL_PROMOTIONS, type Promotion } from "@/lib/admin/promotions";

/**
 * The promotions while somebody is working on them. Session-only, like the
 * catalogue and the customer book.
 *
 * Unlike orders or returns, a promotion is a decision rather than a
 * consequence — so this is the one module where creating a record from
 * nothing is the normal way to use the screen, not an afterthought.
 */

/** What the form collects. `used` is a consequence, so it is never edited. */
export type PromotionDraft = Omit<Promotion, "id" | "used">;

type PromotionState = {
  promotions: Promotion[];
  addPromotion: (draft: PromotionDraft) => Promotion;
  updatePromotion: (id: string, draft: PromotionDraft) => void;
  duplicatePromotion: (id: string) => Promotion | undefined;
  /** Pause a running code, or start a paused one. */
  toggleActive: (ids: string[], active: boolean) => void;
  removePromotions: (ids: string[]) => void;
  /** Puts a whole list back — what Undo on a removal restores. */
  replacePromotions: (promotions: Promotion[]) => void;
};

/**
 * VOLUME01 → VOLUME02. A duplicated code has to differ from the one it came
 * from, and a trailing number is how the studio already tells two runs of the
 * same offer apart.
 */
function nextCode(codes: Set<string>, code: string) {
  const [, stem, digits] = /^(.*?)(\d*)$/.exec(code) ?? [];
  const width = digits?.length || 2;
  for (let n = Number(digits || 0) + 1; n < 1000; n++) {
    const candidate = `${stem}${String(n).padStart(width, "0")}`;
    if (!codes.has(candidate)) return candidate;
  }
  return `${code}-COPY`;
}

export const usePromotionStore = create<PromotionState>()((set, get) => ({
  promotions: ALL_PROMOTIONS,

  addPromotion: (draft) => {
    const promotion: Promotion = {
      ...draft,
      id: `pr-${Date.now().toString(36)}`,
      // Nobody has used a code that did not exist a moment ago.
      used: 0,
    };
    set((state) => ({ promotions: [promotion, ...state.promotions] }));
    return promotion;
  },

  updatePromotion: (id, draft) =>
    set((state) => ({
      promotions: state.promotions.map((promotion) =>
        promotion.id === id ? { ...promotion, ...draft } : promotion
      ),
    })),

  duplicatePromotion: (id) => {
    const source = get().promotions.find((promotion) => promotion.id === id);
    if (!source) return undefined;
    const codes = new Set(get().promotions.map((promotion) => promotion.code));
    const copy: Promotion = {
      ...source,
      id: `pr-${Date.now().toString(36)}`,
      code: nextCode(codes, source.code),
      used: 0,
      // A copy arrives switched off: a second live code with the same terms
      // is almost never what was meant, and it is one click to start it.
      active: false,
    };
    set((state) => ({ promotions: [copy, ...state.promotions] }));
    return copy;
  },

  toggleActive: (ids, active) =>
    set((state) => ({
      promotions: state.promotions.map((promotion) =>
        ids.includes(promotion.id) ? { ...promotion, active } : promotion
      ),
    })),

  removePromotions: (ids) =>
    set((state) => ({
      promotions: state.promotions.filter((promotion) => !ids.includes(promotion.id)),
    })),

  replacePromotions: (promotions) => set({ promotions }),
}));
