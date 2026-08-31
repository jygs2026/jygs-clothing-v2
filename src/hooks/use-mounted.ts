"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only once hydrated on the client. Using useSyncExternalStore (rather
 * than a useEffect + setState) avoids the extra render pass the
 * react-hooks/set-state-in-effect rule flags.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
