import { CATALOGUE, type CatalogueItem } from "@/lib/admin/catalogue";
import { AS_OF, pick, seeded } from "@/lib/admin/format";
import { SEED_CUSTOMERS, type Customer } from "@/lib/admin/customers";
import type { Tone } from "@/components/admin/status-pill";
import type { Size } from "@/lib/types";

/**
 * Orders are the spine of the studio. Returns, payments, the dashboard and
 * every report are worked out from this one list rather than mocked
 * separately, so the figures on two screens can never disagree — a refund on
 * the returns page is the same rupee as the one missing from takings.
 *
 * Each customer's history is generated from what is already known about them
 * (how many they placed, what they spent, when they joined) and the line
 * totals are made to add up to that spend exactly. Everything is a pure
 * function of a seed, so the server and the browser build the same orders.
 */

export type OrderStatus =
  | "Placed"
  | "Being cut"
  | "In transit"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export type PaymentStatus = "Paid" | "Pending" | "Refunded" | "Failed";

export type Channel = "Web" | "WhatsApp" | "Studio";

export type OrderLine = {
  productId: string;
  name: string;
  sku: string;
  size: Size;
  qty: number;
  unit: number;
};

export type Order = {
  no: string;
  customerId: string;
  customerName: string;
  city: string;
  state: string;
  placed: string;
  lines: OrderLine[];
  items: number;
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  channel: Channel;
};

export const ORDER_STATUSES: OrderStatus[] = [
  "Placed",
  "Being cut",
  "In transit",
  "Delivered",
  "Cancelled",
  "Refunded",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["Paid", "Pending", "Refunded", "Failed"];
export const CHANNELS: Channel[] = ["Web", "WhatsApp", "Studio"];

const SIZE_MIX: Size[] = ["S", "M", "M", "L", "L", "XL", "XS"];

/**
 * Where an order has got to. Only the two most recent can still be moving —
 * anything older has landed, or come back — which is what makes the status
 * column worth a glance rather than a column of identical pills.
 */
function statusAt(fromEnd: number, hash: number): OrderStatus {
  if (fromEnd === 0) {
    return pick<OrderStatus>(["Placed", "Being cut", "In transit", "Delivered"], hash);
  }
  if (fromEnd === 1) {
    return pick<OrderStatus>(["In transit", "Delivered", "Delivered"], hash);
  }
  if (hash % 23 === 0) return "Cancelled";
  if (hash % 11 === 0) return "Refunded";
  return "Delivered";
}

function paymentFor(status: OrderStatus, hash: number): PaymentStatus {
  if (status === "Refunded") return "Refunded";
  if (status === "Cancelled") return hash % 2 === 0 ? "Refunded" : "Failed";
  if (status === "Placed") return hash % 4 === 0 ? "Pending" : "Paid";
  return "Paid";
}

/** One customer's orders, oldest first, summing exactly to what they spent. */
export function ordersForCustomer(customer: Customer): Order[] {
  if (customer.orders === 0) return [];

  const joined = new Date(`${customer.joined}T00:00:00Z`).getTime();
  const span = AS_OF.getTime() - joined;
  const seed = Number(customer.id.replace(/\D/g, "")) || customer.name.length;
  const random = seeded(seed);

  // Weights that sum to the order count, spread so no two customers get the
  // same shape, then scaled to the exact total spent.
  const weights = Array.from(
    { length: customer.orders },
    (_, i) => 6 + ((seed * 7 + i * 11) % 9)
  );
  const weightTotal = weights.reduce((a, b) => a + b, 0);

  let running = 0;
  return weights.map((weight, i) => {
    const last = i === customer.orders - 1;
    // The last order takes the remainder, so the column adds up exactly.
    const total = last
      ? customer.spent - running
      : Math.round((customer.spent * weight) / weightTotal / 10) * 10;
    running += total;

    const at = joined + (span * (i + 0.5)) / customer.orders;
    const hash = (seed * 13 + i * 7) % 97;
    const status = statusAt(customer.orders - 1 - i, hash);

    return {
      no: `JY-${4000 + seed * 17 + i * 3}`,
      customerId: customer.id,
      customerName: customer.name,
      city: customer.city,
      state: customer.state,
      placed: new Date(at).toISOString().slice(0, 10),
      lines: linesFor(total, seed + i, random),
      items: 0, // filled in below, once the lines are known
      total,
      status,
      payment: paymentFor(status, hash),
      channel: pick<Channel>(["Web", "Web", "Web", "Web", "WhatsApp", "Studio"], hash),
    };
  }).map((order) => ({ ...order, items: order.lines.reduce((n, l) => n + l.qty, 0) }));
}

/**
 * What was in the box. The pieces are real ones from the catalogue and the
 * unit prices are theirs; the last line absorbs the rounding so the lines
 * always add up to the order total the customer was actually charged.
 */
function linesFor(total: number, seed: number, random: () => number): OrderLine[] {
  const howMany = 1 + Math.floor(random() * 2.4);
  const chosen: CatalogueItem[] = [];
  for (let i = 0; i < howMany; i++) {
    const item = CATALOGUE[(seed * 5 + i * 13) % CATALOGUE.length];
    if (!chosen.includes(item)) chosen.push(item);
  }

  const weights = chosen.map((item) => item.price || 1);
  const weightTotal = weights.reduce((a, b) => a + b, 0);

  let running = 0;
  return chosen.map((item, i) => {
    const last = i === chosen.length - 1;
    const share = last
      ? total - running
      : Math.round((total * weights[i]) / weightTotal / 10) * 10;
    running += share;
    const qty = 1 + ((seed + i) % 2);
    return {
      productId: item.id,
      name: item.name,
      sku: item.sku,
      size: pick(SIZE_MIX, seed + i * 3),
      qty,
      unit: Math.round(share / qty),
    };
  });
}

/** Every order the studio has taken, newest first. */
export const ALL_ORDERS: Order[] = SEED_CUSTOMERS.flatMap(ordersForCustomer).sort((a, b) =>
  b.placed.localeCompare(a.placed)
);

export const ORDERS_BY_CUSTOMER = ALL_ORDERS.reduce((map, order) => {
  const list = map.get(order.customerId);
  if (list) list.push(order);
  else map.set(order.customerId, [order]);
  return map;
}, new Map<string, Order[]>());

/** Money the studio actually kept: what was paid, less what went back. */
export function revenueOf(orders: Order[]) {
  return orders
    .filter((order) => order.payment === "Paid")
    .reduce((sum, order) => sum + order.total, 0);
}

export function refundedOf(orders: Order[]) {
  return orders
    .filter((order) => order.payment === "Refunded")
    .reduce((sum, order) => sum + order.total, 0);
}

/** Orders placed on each of the last `days` days, oldest first. */
export function dailySeries(orders: Order[], days: number) {
  const buckets = new Map<string, { orders: number; revenue: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(AS_OF.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    buckets.set(day, { orders: 0, revenue: 0 });
  }
  for (const order of orders) {
    const bucket = buckets.get(order.placed);
    if (!bucket) continue;
    bucket.orders += 1;
    if (order.payment === "Paid") bucket.revenue += order.total;
  }
  return [...buckets].map(([day, value]) => ({ day, ...value }));
}

/** How each status is coloured, wherever an order is shown. */
export const ORDER_TONE: Record<OrderStatus, Tone> = {
  Placed: "info",
  "Being cut": "brand",
  "In transit": "violet",
  Delivered: "good",
  Cancelled: "neutral",
  Refunded: "warn",
};

export const PAYMENT_TONE: Record<PaymentStatus, Tone> = {
  Paid: "good",
  Pending: "warn",
  Refunded: "neutral",
  Failed: "bad",
};

/** "The Ash Overshirt + 1 more" — what the box held, in one line. */
export function describeLines(order: Order) {
  const [first, ...rest] = order.lines;
  if (!first) return "—";
  return rest.length ? `${first.name} + ${rest.length} more` : first.name;
}

export const ORDERS_BY_NO = new Map(ALL_ORDERS.map((order) => [order.no, order]));
