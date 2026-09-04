import type { Tone } from "@/components/admin/status-pill";
import {
  CATALOGUE,
  CATALOGUE_BY_ID,
  LOW_STOCK_AT,
  available,
  categoryOf,
  marginPercent,
  type CatalogueItem,
} from "@/lib/admin/catalogue";
import {
  SEED_CUSTOMERS,
  groupFor,
  type Customer,
  type CustomerGroup,
} from "@/lib/admin/customers";
import { AS_OF, formatDayMonth } from "@/lib/admin/format";
import { ALL_ORDERS, type Order } from "@/lib/admin/orders";
import { ALL_PAYMENTS } from "@/lib/admin/payments";
import { ALL_RETURNS, isOpen, type Return } from "@/lib/admin/returns";

/**
 * Everything the dashboard and the reports read. Not a fifth mock: every
 * figure here is worked out from the orders, returns, payments and catalogue
 * the rest of the studio already shows, so a number on the dashboard and the
 * row it came from can never disagree.
 *
 * Each function takes the orders it should count rather than reaching for
 * `ALL_ORDERS` itself, so the same aggregation serves a week, a year, or one
 * customer's history without being written twice.
 */

/* ---------------------------------------------------------------- window */

export type RangeDays = 7 | 30 | 90 | 365;

export const RANGES: { days: RangeDays; short: string; label: string }[] = [
  { days: 7, short: "7 days", label: "the last 7 days" },
  { days: 30, short: "30 days", label: "the last 30 days" },
  { days: 90, short: "90 days", label: "the last 90 days" },
  { days: 365, short: "12 months", label: "the last 12 months" },
];

/** Beyond this many days the studio stops counting by day and counts by month. */
const MONTHLY_ABOVE = 120;

function monthStart(back: number) {
  return new Date(Date.UTC(AS_OF.getUTCFullYear(), AS_OF.getUTCMonth() - back, 1))
    .toISOString()
    .slice(0, 10);
}

function dayStart(back: number) {
  return new Date(AS_OF.getTime() - back * 86_400_000).toISOString().slice(0, 10);
}

/**
 * The first day a window counts. A long window starts on the first of the
 * month so its twelve columns are twelve whole months rather than eleven and
 * two halves.
 */
export function windowStart(days: number) {
  return days > MONTHLY_ABOVE ? monthStart(11) : dayStart(days - 1);
}

/**
 * The window of the same length immediately before the current one, as the
 * half-open range `[before, from)`. Doubling the day count instead would be
 * wrong at the edges — 90 doubled is 180, which crosses into monthly counting
 * and quietly compares three months against twelve.
 */
export function priorBounds(days: number) {
  return {
    from: windowStart(days),
    before: days > MONTHLY_ABOVE ? monthStart(23) : dayStart(days * 2 - 1),
  };
}

export type Span = {
  from: string;
  /** Orders placed inside the window, newest first. */
  orders: Order[];
  /**
   * The window of the same length immediately before it, for comparison.
   * Deliberately not called `previous`/`current`: the React compiler reads a
   * `.current` property as a ref and gives up on the component that holds it.
   */
  earlier: Order[];
};

export function ordersIn(days: number): Span {
  const { from, before } = priorBounds(days);

  const orders: Order[] = [];
  const earlier: Order[] = [];
  for (const order of ALL_ORDERS) {
    if (order.placed >= from) orders.push(order);
    else if (order.placed >= before) earlier.push(order);
  }
  return { from, orders, earlier };
}

/* ---------------------------------------------------------------- totals */

export type Totals = {
  /** Money actually taken — orders whose payment went through. */
  revenue: number;
  refunded: number;
  orders: number;
  units: number;
  average: number;
  customers: number;
};

export function totalsOf(orders: Order[]): Totals {
  const paid = orders.filter((order) => order.payment === "Paid");
  const revenue = paid.reduce((sum, order) => sum + order.total, 0);
  return {
    revenue,
    refunded: orders
      .filter((order) => order.payment === "Refunded")
      .reduce((sum, order) => sum + order.total, 0),
    orders: orders.length,
    units: orders.reduce((sum, order) => sum + order.items, 0),
    average: paid.length ? Math.round(revenue / paid.length) : 0,
    customers: new Set(orders.map((order) => order.customerId)).size,
  };
}

/* ---------------------------------------------------------------- series */

export type Bucket = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  units: number;
};

export type CountPoint = { key: string; label: string; value: number };

/**
 * The empty columns a window is drawn in, oldest first. Built before anything
 * is counted so a quiet day still gets its place on the axis — a chart that
 * silently skips the days nothing sold is a chart that lies about the shape
 * of a week.
 */
function skeleton(days: number): { key: string; label: string }[] {
  if (days > MONTHLY_ABOVE) {
    return Array.from({ length: 12 }, (_, i) => {
      const at = new Date(
        Date.UTC(AS_OF.getUTCFullYear(), AS_OF.getUTCMonth() - (11 - i), 1)
      );
      return {
        key: at.toISOString().slice(0, 7),
        label: at.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
      };
    });
  }
  return Array.from({ length: days }, (_, i) => {
    const key = dayStart(days - 1 - i);
    return { key, label: formatDayMonth(key) };
  });
}

function bucketKey(iso: string, days: number) {
  return days > MONTHLY_ABOVE ? iso.slice(0, 7) : iso.slice(0, 10);
}

export function seriesFor(orders: Order[], days: number): Bucket[] {
  const buckets = new Map(
    skeleton(days).map((column) => [
      column.key,
      { ...column, revenue: 0, orders: 0, units: 0 },
    ])
  );
  for (const order of orders) {
    const bucket = buckets.get(bucketKey(order.placed, days));
    if (!bucket) continue;
    bucket.orders += 1;
    bucket.units += order.items;
    if (order.payment === "Paid") bucket.revenue += order.total;
  }
  return [...buckets.values()];
}

/** The same columns, counting dated things that are not orders. */
export function countSeries(dates: string[], days: number): CountPoint[] {
  const buckets = new Map(
    skeleton(days).map((column) => [column.key, { ...column, value: 0 }])
  );
  for (const date of dates) {
    const bucket = buckets.get(bucketKey(date, days));
    if (bucket) bucket.value += 1;
  }
  return [...buckets.values()];
}

export function bestBuckets(buckets: Bucket[], limit = 5) {
  return [...buckets]
    .filter((bucket) => bucket.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/* ------------------------------------------------------------ breakdowns */

export type Slice = { label: string; value: number; hint?: string };

function ranked(map: Map<string, number>): Slice[] {
  return [...map]
    .map(([label, value]) => ({ label, value }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Revenue means money taken, so an unpaid order is not revenue anywhere. */
function paidOnly(orders: Order[]) {
  return orders.filter((order) => order.payment === "Paid");
}

export function revenueByChannel(orders: Order[]): Slice[] {
  const map = new Map<string, number>();
  for (const order of paidOnly(orders)) {
    map.set(order.channel, (map.get(order.channel) ?? 0) + order.total);
  }
  return ranked(map);
}

export function revenueByState(orders: Order[]): Slice[] {
  const map = new Map<string, number>();
  for (const order of paidOnly(orders)) {
    map.set(order.state, (map.get(order.state) ?? 0) + order.total);
  }
  return ranked(map);
}

export function revenueByCategory(orders: Order[]): Slice[] {
  const map = new Map<string, number>();
  for (const order of paidOnly(orders)) {
    for (const line of order.lines) {
      const category =
        CATALOGUE_BY_ID.get(line.productId)?.category ?? categoryOf(line.name);
      map.set(category, (map.get(category) ?? 0) + line.unit * line.qty);
    }
  }
  return ranked(map);
}

/** Which sizes actually leave the studio — the number that decides a cut. */
export function unitsBySize(orders: Order[]): Slice[] {
  const map = new Map<string, number>();
  for (const order of paidOnly(orders)) {
    for (const line of order.lines) {
      map.set(line.size, (map.get(line.size) ?? 0) + line.qty);
    }
  }
  return ranked(map);
}

export type ProductLine = {
  id: string;
  name: string;
  sku: string;
  category: string;
  units: number;
  revenue: number;
  /**
   * What was left after the cloth and the making. Taken as a share of what
   * the line actually charged rather than the catalogue's own margin in
   * rupees: an order's line prices come from what the customer paid, which a
   * discount or a made-to-order quote can put either side of the list price,
   * and multiplying those units by a list-price margin can quietly claim the
   * studio kept more than it took.
   */
  margin: number;
};

export function topProducts(orders: Order[], limit = 10): ProductLine[] {
  const map = new Map<string, ProductLine>();
  for (const order of paidOnly(orders)) {
    for (const line of order.lines) {
      const item = CATALOGUE_BY_ID.get(line.productId);
      const row = map.get(line.productId) ?? {
        id: line.productId,
        name: line.name,
        sku: line.sku,
        category: item?.category ?? categoryOf(line.name),
        units: 0,
        revenue: 0,
        margin: 0,
      };
      row.units += line.qty;
      row.revenue += line.unit * line.qty;
      row.margin += item ? (line.unit * line.qty * marginPercent(item)) / 100 : 0;
      map.set(line.productId, row);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

/* ------------------------------------------------------------- customers */

export type SpendLine = {
  id: string;
  name: string;
  city: string;
  orders: number;
  spent: number;
};

/** Who spent the most inside the window — not all time, which the book shows. */
export function topSpenders(orders: Order[], limit = 8): SpendLine[] {
  const map = new Map<string, SpendLine>();
  for (const order of paidOnly(orders)) {
    const row = map.get(order.customerId) ?? {
      id: order.customerId,
      name: order.customerName,
      city: order.city,
      orders: 0,
      spent: 0,
    };
    row.orders += 1;
    row.spent += order.total;
    map.set(order.customerId, row);
  }
  return [...map.values()].sort((a, b) => b.spent - a.spent).slice(0, limit);
}

export function newCustomersIn(days: number): Customer[] {
  const from = windowStart(days);
  return SEED_CUSTOMERS.filter((customer) => customer.joined >= from);
}

/** How many joined during the window before this one, for the comparison. */
export function newCustomersBefore(days: number) {
  const { from, before } = priorBounds(days);
  return SEED_CUSTOMERS.filter(
    (customer) => customer.joined >= before && customer.joined < from
  ).length;
}

export function customerMix(): Slice[] {
  const map = new Map<CustomerGroup, number>();
  for (const customer of SEED_CUSTOMERS) {
    const group = groupFor(customer);
    map.set(group, (map.get(group) ?? 0) + 1);
  }
  return [...map].map(([label, value]) => ({ label, value }));
}

/**
 * How many of the window's orders came from somebody who had already bought
 * before it started. The one number that says whether a run is building a
 * following or only finding strangers.
 */
export function repeatShare(orders: Order[], from: string) {
  const earlier = new Set(
    ALL_ORDERS.filter((order) => order.placed < from).map((order) => order.customerId)
  );
  const repeat = orders.filter((order) => earlier.has(order.customerId)).length;
  return { repeat, fresh: orders.length - repeat };
}

/* --------------------------------------------------------------- returns */

export function returnsIn(days: number): Return[] {
  const from = windowStart(days);
  return ALL_RETURNS.filter((entry) => entry.opened >= from);
}

export function returnsBefore(days: number) {
  const { from, before } = priorBounds(days);
  return ALL_RETURNS.filter((entry) => entry.opened >= before && entry.opened < from)
    .length;
}

export function returnsBy(entries: Return[], key: (entry: Return) => string): Slice[] {
  const map = new Map<string, number>();
  for (const entry of entries) map.set(key(entry), (map.get(key(entry)) ?? 0) + 1);
  return ranked(map);
}

export function refundedIn(entries: Return[]) {
  return entries
    .filter((entry) => entry.stage === "Refunded")
    .reduce((sum, entry) => sum + entry.amount, 0);
}

/* -------------------------------------------------------------- payments */

export function methodMix(days: number): Slice[] {
  const from = windowStart(days);
  const map = new Map<string, number>();
  for (const payment of ALL_PAYMENTS) {
    if (payment.state !== "Captured" || payment.at < from) continue;
    map.set(payment.method, (map.get(payment.method) ?? 0) + payment.gross);
  }
  return ranked(map);
}

/* ------------------------------------------------------------- the bench */

/** Pieces the studio is about to run out of, emptiest first. */
export const LOW_STOCK: CatalogueItem[] = CATALOGUE.filter(
  (item) => item.status === "Active" && available(item) <= LOW_STOCK_AT
).sort((a, b) => available(a) - available(b));

export type BenchItem = {
  key: string;
  label: string;
  count: number;
  detail: string;
  href: string;
  tone: Tone;
};

/**
 * What is waiting on somebody. Ordered by what goes wrong soonest if it is
 * left: an order nobody has cut, then money that never arrived, then a piece
 * about to sell out from under the shop.
 */
export function bench(): BenchItem[] {
  const rows: BenchItem[] = [
    {
      key: "to-cut",
      label: "Orders to make up",
      count: ALL_ORDERS.filter(
        (order) => order.status === "Placed" || order.status === "Being cut"
      ).length,
      detail: "Placed or on the cutting table",
      href: "/admin/orders",
      tone: "brand",
    },
    {
      key: "unpaid",
      label: "Payments not taken",
      count: ALL_ORDERS.filter((order) => order.payment === "Pending").length,
      detail: "Waiting on the customer's bank",
      href: "/admin/payments?q=",
      tone: "warn",
    },
    {
      key: "failed",
      label: "Payments failed",
      count: ALL_ORDERS.filter((order) => order.payment === "Failed").length,
      detail: "Worth chasing before the order ages",
      href: "/admin/payments",
      tone: "bad",
    },
    {
      key: "returns",
      label: "Returns still open",
      count: ALL_RETURNS.filter(isOpen).length,
      detail: "Requested, in transit or on the bench",
      href: "/admin/returns",
      tone: "info",
    },
    {
      key: "low",
      label: "Pieces running low",
      count: LOW_STOCK.filter((item) => available(item) > 0).length,
      detail: `${LOW_STOCK_AT} or fewer left to sell`,
      href: "/admin/inventory",
      tone: "warn",
    },
    {
      key: "out",
      label: "Sold out",
      count: CATALOGUE.filter(
        (item) => item.status === "Active" && available(item) <= 0
      ).length,
      detail: "Live in the shop with nothing behind it",
      href: "/admin/inventory",
      tone: "bad",
    },
  ];
  return rows.filter((row) => row.count > 0);
}
