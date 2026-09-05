"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { FORCED_THEME, THEME_SWITCHER_ENABLED } from "@/lib/theme-config";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={THEME_SWITCHER_ENABLED ? "system" : FORCED_THEME}
      enableSystem={THEME_SWITCHER_ENABLED}
      forcedTheme={THEME_SWITCHER_ENABLED ? undefined : FORCED_THEME}
    >
      {children}
    </ThemeProvider>
  );
}
