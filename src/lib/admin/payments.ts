import type { Tone } from "@/components/admin/status-pill";
import { AS_OF, pick } from "@/lib/admin/format";
import { ALL_ORDERS, type Order } from "@/lib/admin/orders";

/**
 * Money in and money out. Every payment is one order's — the studio does not
 * take money for anything else — so takings here always reconcile with the
 * orders screen. Payouts are the weekly sweep of what has settled.
 */

export type Method = "Card" | "UPI" | "Net banking" | "Wallet" | "Cash on delivery";

export type PaymentState = "Captured" | "Pending" | "Refunded" | "Failed";

export type Payment = {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  method: Method;
  state: PaymentState;
  gross: number;
  /** What the gateway kept. */
  fee: number;
  /** What the studio actually receives. */
  net: number;
  at: string;
};

export const METHODS: Method[] = ["Card", "UPI", "Net banking", "Wallet", "Cash on delivery"];
export const PAYMENT_STATES: PaymentState[] = ["Captured", "Pending", "Refunded", "Failed"];

export const PAYMENT_STATE_TONE: Record<PaymentState, Tone> = {
  Captured: "good",
  Pending: "warn",
  Refunded: "neutral",
  Failed: "bad",
};

/** What each rail costs the studio, as a share of the sale. */
const FEE_RATE: Record<Method, number> = {
  Card: 0.0235,
  UPI: 0.006,
  "Net banking": 0.014,
  Wallet: 0.019,
  "Cash on delivery": 0.03,
};

function stateFor(order: Order): PaymentState {
  switch (order.payment) {
    case "Paid":
      return "Captured";
    case "Pending":
      return "Pending";
    case "Refunded":
      return "Refunded";
    default:
      return "Failed";
  }
}

export const ALL_PAYMENTS: Payment[] = ALL_ORDERS.map((order, i) => {
  const method = pick(METHODS, order.no.length + i * 3);
  const gross = order.total;
  const fee = Math.round(gross * FEE_RATE[method]);
  return {
    id: `PY-${20000 + i}`,
    orderNo: order.no,
    customerId: order.customerId,
    customerName: order.customerName,
    method,
    state: stateFor(order),
    gross,
    fee,
    // A refund gives back the sale but not the gateway's cut.
    net: stateFor(order) === "Captured" ? gross - fee : 0,
    at: order.placed,
  };
});

export type Payout = {
  id: string;
  /** The week the takings were swept, as an ISO date for its Monday. */
  week: string;
  orders: number;
  gross: number;
  fees: number;
  refunds: number;
  net: number;
  state: "Paid out" | "In transit" | "Scheduled";
};

/**
 * The weekly sweep. Grouped from the payments rather than invented, so the
 * total paid out equals the total captured, less fees and refunds — which is
 * the one thing anybody checks on this screen.
 */
export const ALL_PAYOUTS: Payout[] = (() => {
  const weeks = new Map<string, Payout>();

  for (const payment of ALL_PAYMENTS) {
    const date = new Date(`${payment.at}T00:00:00Z`);
    // Back up to the Monday that starts this payment's week.
    const monday = new Date(date);
    monday.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);

    const row =
      weeks.get(key) ??
      ({
        id: `PO-${key.replace(/-/g, "")}`,
        week: key,
        orders: 0,
        gross: 0,
        fees: 0,
        refunds: 0,
        net: 0,
        state: "Paid out",
      } satisfies Payout);

    if (payment.state === "Captured") {
      row.orders += 1;
      row.gross += payment.gross;
      row.fees += payment.fee;
    } else if (payment.state === "Refunded") {
      row.refunds += payment.gross;
    }
    row.net = row.gross - row.fees - row.refunds;
    weeks.set(key, row);
  }

  const today = AS_OF.toISOString().slice(0, 10);
  return [...weeks.values()]
    .map((row) => {
      const daysOld = Math.round(
        (AS_OF.getTime() - new Date(`${row.week}T00:00:00Z`).getTime()) / 86_400_000
      );
      // The studio is paid a week in arrears, so the newest sweeps are still
      // moving and this week's has not been swept at all.
      return {
        ...row,
        state:
          daysOld < 7 ? ("Scheduled" as const)
          : daysOld < 14 ? ("In transit" as const)
          : ("Paid out" as const),
      };
    })
    .filter((row) => row.week <= today)
    .sort((a, b) => b.week.localeCompare(a.week));
})();

export const PAYOUT_TONE: Record<Payout["state"], Tone> = {
  "Paid out": "good",
  "In transit": "violet",
  Scheduled: "info",
};
