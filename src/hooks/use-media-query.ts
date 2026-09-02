"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Anything narrower than this gets the full-page bag instead of the sheet. */
export const DESKTOP_BAG_QUERY = "(min-width: 640px)";

/**
 * Live matchMedia result. The server snapshot is always `false`, so a caller
 * that gates desktop-only UI renders nothing until hydration — fine here
 * because the bag sheet starts closed either way.
 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
