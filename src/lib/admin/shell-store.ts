"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useMounted } from "@/hooks/use-mounted";

/**
 * How the studio's window is arranged. The rail's width is a preference the
 * same person keeps across sessions, so it is remembered; the mobile drawer
 * is a moment, so it is not.
 */
type AdminShellState = {
  /** Desktop only — the rail narrows to its icons. */
  collapsed: boolean;
  /** Narrow screens — the rail is over the page rather than beside it. */
  drawerOpen: boolean;
  toggleCollapsed: () => void;
  setDrawerOpen: (open: boolean) => void;
};

export const useAdminShellStore = create<AdminShellState>()(
  persist(
    (set) => ({
      collapsed: false,
      drawerOpen: false,
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    }),
    {
      name: "jygs-admin-shell",
      partialize: (state) => ({ collapsed: state.collapsed }),
    }
  )
);

/**
 * The rail width, safe to render on the server. The stored preference only
 * exists in the browser, so until hydration every reader has to agree the
 * rail is wide — otherwise the markup React was handed no longer matches.
 */
export function useAdminCollapsed() {
  const collapsed = useAdminShellStore((s) => s.collapsed);
  return useMounted() && collapsed;
}
