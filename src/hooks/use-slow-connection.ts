"use client";

import { useSyncExternalStore } from "react";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
};

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  const nav = navigator as Navigator & {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

function isSlow(connection: NetworkInformation | undefined): boolean {
  if (!connection) return false;
  if (connection.saveData) return true;
  return (
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g" ||
    connection.effectiveType === "3g"
  );
}

function subscribe(callback: () => void) {
  const connection = getConnection();
  if (!connection?.addEventListener) return () => {};
  connection.addEventListener("change", callback);
  return () => connection.removeEventListener?.("change", callback);
}

const getServerSnapshot = () => false;

/**
 * True on a slow or data-saver connection (Network Information API —
 * `saveData`, or `effectiveType` of slow-2g/2g/3g). Unsupported in Safari
 * and Firefox, where this quietly reports `false`, same as a normal
 * connection — images there just load lazily like everywhere else.
 */
export function useSlowConnection(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isSlow(getConnection()),
    getServerSnapshot
  );
}
