"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminRangeTabs } from "@/components/admin/admin-range-tabs";
import { AdminSegmented } from "@/components/admin/admin-segmented";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { BarList } from "@/components/admin/charts/bar-list";
import { ShareBar } from "@/components/admin/charts/share-bar";
import { TrendChart } from "@/components/admin/charts/trend-chart";
import { StatusPill, TONE_TEXT } from "@/components/admin/status-pill";
import { available } from "@/lib/admin/catalogue";
import {
  count,
  delta,
  formatDate,
  money,
  moneyShort,
  percent,
  timeAgo,
} from "@/lib/admin/format";
import {
  LOW_STOCK,
  RANGES,
  bench,
  newCustomersIn,
  ordersIn,
  returnsIn,
  revenueByChannel,
  revenueByState,
  seriesFor,
  topProducts,
  totalsOf,
  type RangeDays,
} from "@/lib/admin/insights";
import { ALL_LOGS, LOG_TONE } from "@/lib/admin/logs";
import { ORDER_TONE, describeLines } from "@/lib/admin/orders";
import { cn } from "@/lib/utils";

/**
 * The run at a glance. Three questions in the order a studio actually asks
 * them on a Monday: how did the period go, what is waiting on somebody, and
 * what is selling. Everything below the tiles is a doorway into the section
 * that owns it — the dashboard reports, it does not edit.
 */
export function DashboardScreen() {
  const [days, setDays] = useState<RangeDays>(30);
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");

  const view = useMemo(() => {
    const { orders, earlier, from } = ordersIn(days);
    const returns = returnsIn(days);
    return {
      from,
      now: totalsOf(orders),
      before: totalsOf(earlier),
      series: seriesFor(orders, days),
      channels: revenueByChannel(orders),
      states: revenueByState(orders),
      products: topProducts(orders, 5),
      // ALL_ORDERS is newest first, so the window keeps that order.
      recent: orders.slice(0, 6),
      returns: returns.length,
      newCustomers: newCustomersIn(days).length,
    };
  }, [days]);

  const { now, before } = view;
  const waiting = useMemo(() => bench(), []);
  const period = RANGES.find((range) => range.days === days)!.label;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Dashboard"
        blurb="The run at a glance — what sold, what is moving and what needs a decision today."
      >
        <AdminRangeTabs value={days} onChange={setDays} />
      </AdminPageHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <AdminStatCard
          label="Taken"
          value={moneyShort(now.revenue)}
          trend={toTrend(now.revenue, before.revenue)}
          detail={`Paid orders in ${period}`}
        />
        <AdminStatCard
          label="Orders"
          value={count(now.orders)}
          trend={toTrend(now.orders, before.orders)}
          detail={`${count(now.units)} pieces went out`}
        />
        <AdminStatCard
          label="Average order"
          value={moneyShort(now.average)}
          trend={toTrend(now.average, before.average)}
          detail="Across everything paid for"
        />
        <AdminStatCard
          label="Customers"
          value={count(now.customers)}
          trend={toTrend(now.customers, before.customers)}
          detail={`${count(view.newCustomers)} of them new to the book`}
        />
        <AdminStatCard
          label="Returns"
          value={count(view.returns)}
          tone={view.returns ? "warning" : "muted"}
          trend={null}
          detail={`${percent(view.returns, now.orders)} of orders came back`}
        />
        <AdminStatCard
          label="Refunded"
          value={moneyShort(now.refunded)}
          tone={now.refunded ? "warning" : "muted"}
          trend={toTrend(now.refunded, before.refunded, { lowerIsBetter: true })}
          detail="Money given back in the period"
        />
      </div>

      <AdminPanel className="mt-5">
        <AdminPanelHeader
          title={metric === "revenue" ? "What was taken" : "Orders placed"}
          detail={`Over ${period}, ${days > 120 ? "by month" : "by day"}`}
        >
          <AdminSegmented
            label="Measure"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "revenue", label: "Taken" },
              { value: "orders", label: "Orders" },
            ]}
          />
        </AdminPanelHeader>
        <div className="px-2 py-4 sm:px-4">
          <TrendChart
            key={metric}
            caption={
              metric === "revenue"
                ? `Money taken over ${period}`
                : `Orders placed over ${period}`
            }
            points={view.series.map((bucket) => ({
              key: bucket.key,
              label: bucket.label,
              value: metric === "revenue" ? bucket.revenue : bucket.orders,
            }))}
            format={metric === "revenue" ? moneyShort : count}
          />
        </div>
      </AdminPanel>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
        <AdminPanel className="lg:col-span-2">
          <AdminPanelHeader title="Latest orders" detail={`Newest first, from ${formatDate(view.from)}`}>
            <SeeAll href="/admin/orders" />
          </AdminPanelHeader>
          {view.recent.length ? (
            <ul className="divide-y divide-border">
              {view.recent.map((order) => (
                <li key={order.no}>
                  <Link
                    href={`/admin/orders/${order.no}`}
                    className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-admin-mono text-[12.5px]">{order.no}</span>
                        <StatusPill tone={ORDER_TONE[order.status]}>{order.status}</StatusPill>
                      </p>
                      <p className="mt-1 truncate text-[13px] text-foreground/70">
                        {order.customerName} · {order.city}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-foreground/48">
                        {describeLines(order)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13.5px] font-medium font-feature-tnum">
                        {money(order.total)}
                      </p>
                      <p className="mt-1 text-[11.5px] text-foreground/45">
                        {formatDate(order.placed)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing was ordered in {period}.</Empty>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Waiting on somebody" detail="Across the whole studio, not the period" />
          {waiting.length ? (
            <ul className="divide-y divide-border">
              {waiting.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span
                      aria-hidden="true"
                      className={cn("size-1.5 shrink-0 rounded-full bg-current", TONE_TEXT[item.tone])}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px]">{item.label}</span>
                      <span className="block truncate text-[11.5px] text-foreground/48">
                        {item.detail}
                      </span>
                    </span>
                    <span className="shrink-0 text-[15px] font-semibold font-feature-tnum">
                      {count(item.count)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing is waiting. The bench is clear.</Empty>
          )}
        </AdminPanel>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
        <AdminPanel className="p-5">
          <PanelTitle title="Selling best" detail={`By what was taken over ${period}`} href="/admin/products" />
          <BarList
            className="mt-4"
            rows={view.products.map((product) => ({
              label: product.name,
              value: product.revenue,
              hint: `${count(product.units)} pieces · ${product.category}`,
              href: `/admin/products/${product.id}`,
            }))}
            format={moneyShort}
            empty="Nothing sold in this period."
          />
        </AdminPanel>

        <AdminPanel className="p-5">
          <PanelTitle title="Where it went" detail="The five busiest states" href="/admin/customers" />
          <BarList
            className="mt-4"
            rows={view.states.map((state) => ({ label: state.label, value: state.value }))}
            format={moneyShort}
            limit={5}
            empty="Nowhere yet in this period."
          />
        </AdminPanel>

        <AdminPanel className="p-5">
          <PanelTitle title="How they ordered" detail="Share of what was taken" href="/admin/orders" />
          <ShareBar className="mt-4" shares={view.channels} format={moneyShort} />
        </AdminPanel>
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <AdminPanel>
          <AdminPanelHeader title="Running low" detail={`${LOW_STOCK.length} pieces at or under the warning line`}>
            <SeeAll href="/admin/inventory" />
          </AdminPanelHeader>
          {LOW_STOCK.length ? (
            <ul className="divide-y divide-border">
              {LOW_STOCK.slice(0, 5).map((item) => {
                const left = available(item);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/admin/products/${item.id}`}
                      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px]">{item.name}</span>
                        <span className="block truncate font-admin-mono text-[11.5px] text-foreground/48">
                          {item.sku}
                        </span>
                      </span>
                      <StatusPill tone={left <= 0 ? "bad" : "warn"}>
                        {left <= 0 ? "Sold out" : `${left} left`}
                      </StatusPill>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Every piece has depth behind it.</Empty>
          )}
        </AdminPanel>

        <AdminPanel>
          <AdminPanelHeader title="Latest activity" detail="What changed in the studio">
            <SeeAll href="/admin/logs" />
          </AdminPanelHeader>
          <ul className="divide-y divide-border">
            {ALL_LOGS.slice(0, 5).map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-5 py-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full bg-current",
                    TONE_TEXT[LOG_TONE[entry.level]]
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">
                    {entry.action}{" "}
                    <span className="font-admin-mono text-[12px] text-foreground/55">
                      {entry.subject}
                    </span>
                  </span>
                  <span className="block truncate text-[11.5px] text-foreground/48">
                    {entry.actor} · {timeAgo(entry.at)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      </div>
    </div>
  );
}

/**
 * A move against the period before. Falling refunds are good news and rising
 * ones are not, which is the opposite of every other figure here.
 */
function toTrend(now: number, before: number, options?: { lowerIsBetter?: boolean }) {
  const moved = delta(now, before);
  if (!moved) return null;
  return {
    label: moved.label,
    up: options?.lowerIsBetter ? !moved.up : moved.up,
  };
}

function PanelTitle({
  title,
  detail,
  href,
}: {
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        <p className="mt-0.5 text-[12.5px] text-foreground/55">{detail}</p>
      </div>
      <SeeAll href={href} />
    </div>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex shrink-0 items-center gap-1 text-[12.5px] text-foreground/58 transition-colors hover:text-accent-2"
    >
      See all
      <ArrowRight className="size-3.5" strokeWidth={1.7} />
    </Link>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-5 py-10 text-center text-[13px] text-foreground/50">{children}</p>;
}
