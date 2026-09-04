"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * How the shop behaves. Unlike the other stores this one is persisted: a
 * setting is a decision, and losing it on reload would make the screen feel
 * broken rather than provisional.
 */
export type Settings = {
  studioName: string;
  contactEmail: string;
  supportPhone: string;
  addressLine: string;
  city: string;
  postcode: string;

  currency: "INR";
  orderPrefix: string;
  /** Below this many pieces available, the studio is warned. */
  lowStockAt: number;

  freeShippingOver: number;
  standardShipping: number;
  expressShipping: number;
  /** Working days, quoted to the customer at checkout. */
  dispatchDays: number;

  taxPercent: number;
  pricesIncludeTax: boolean;

  returnWindowDays: number;
  restockOnReturn: boolean;

  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  notifyFailedPayment: boolean;
  notifyWeeklyDigest: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  studioName: "JYGS",
  contactEmail: "studio@jygs.in",
  supportPhone: "+91 99944 52406",
  addressLine: "12 Rutland Gate, Kilpauk",
  city: "Chennai",
  postcode: "600010",

  currency: "INR",
  orderPrefix: "JY",
  lowStockAt: 12,

  freeShippingOver: 10000,
  standardShipping: 250,
  expressShipping: 800,
  dispatchDays: 3,

  taxPercent: 12,
  pricesIncludeTax: true,

  returnWindowDays: 14,
  restockOnReturn: true,

  notifyNewOrder: true,
  notifyLowStock: true,
  notifyFailedPayment: true,
  notifyWeeklyDigest: false,
};

type SettingsState = {
  settings: Settings;
  save: (patch: Partial<Settings>) => void;
  reset: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      save: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
      reset: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: "jygs-admin-settings",
      // A setting added in a later version must not be missing on a machine
      // that stored the older shape.
      merge: (stored, current) => ({
        ...current,
        settings: { ...DEFAULT_SETTINGS, ...(stored as SettingsState)?.settings },
      }),
    }
  )
);
