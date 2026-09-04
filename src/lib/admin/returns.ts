import type { Tone } from "@/components/admin/status-pill";
import { daysBefore, pick } from "@/lib/admin/format";
import { ALL_ORDERS, type Order } from "@/lib/admin/orders";

/**
 * Pieces coming back. Every return is anchored to a real order — the ones
 * already refunded, plus a handful still on their way in — so the money on
 * this screen is the same money missing from takings, and nobody has to
 * reconcile two invented lists.
 */

export type ReturnStage = "Requested" | "In transit" | "Received" | "Refunded" | "Rejected";

export type ReturnReason =
  | "Too small"
  | "Too large"
  | "Not as pictured"
  | "Changed mind"
  | "Arrived marked"
  | "Late";

export type Condition = "As new" | "Worn once" | "Marked" | "Not resellable";

export type Return = {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  piece: string;
  size: string;
  reason: ReturnReason;
  condition: Condition;
  stage: ReturnStage;
  /** What went back to the customer, or what would if it is approved. */
  amount: number;
  opened: string;
};

export const RETURN_STAGES: ReturnStage[] = [
  "Requested",
  "In transit",
  "Received",
  "Refunded",
  "Rejected",
];

export const RETURN_REASONS: ReturnReason[] = [
  "Too small",
  "Too large",
  "Not as pictured",
  "Changed mind",
  "Arrived marked",
  "Late",
];

export const RETURN_TONE: Record<ReturnStage, Tone> = {
  Requested: "info",
  "In transit": "violet",
  Received: "brand",
  Refunded: "good",
  Rejected: "neutral",
};

function returnFor(order: Order, index: number, stage: ReturnStage): Return {
  const line = order.lines[0];
  const seed = index * 17 + order.no.length;
  return {
    id: `RT-${1000 + index}`,
    orderNo: order.no,
    customerId: order.customerId,
    customerName: order.customerName,
    piece: line?.name ?? "—",
    size: line?.size ?? "—",
    reason: pick(RETURN_REASONS, seed),
    condition: pick<Condition>(
      ["As new", "As new", "As new", "Worn once", "Marked", "Not resellable"],
      seed * 3
    ),
    stage,
    // A return is for the piece that came back, not the whole order.
    amount: line ? line.unit * line.qty : order.total,
    opened: stage === "Refunded" ? order.placed : daysBefore(index % 21),
  };
}

/**
 * Everything already refunded is a settled return; a few recent orders are
 * still somewhere in the process, so the screen has live work on it and not
 * just history.
 */
export const ALL_RETURNS: Return[] = (() => {
  const settled = ALL_ORDERS.filter((order) => order.status === "Refunded");
  const open = ALL_ORDERS.filter(
    (order) => order.status === "Delivered" || order.status === "In transit"
  ).slice(0, 26);

  const rows = [
    ...settled.map((order, i) => returnFor(order, i, "Refunded")),
    ...open.map((order, i) =>
      returnFor(order, settled.length + i, pick<ReturnStage>(
        ["Requested", "Requested", "In transit", "Received", "Rejected"],
        i * 5 + 1
      ))
    ),
  ];
  return rows.sort((a, b) => b.opened.localeCompare(a.opened));
})();

/** What has not been settled yet — the work the screen actually exists for. */
export function isOpen(entry: Return) {
  return entry.stage !== "Refunded" && entry.stage !== "Rejected";
}
