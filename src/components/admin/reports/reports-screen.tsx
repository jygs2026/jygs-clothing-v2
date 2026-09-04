"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminRangeTabs } from "@/components/admin/admin-range-tabs";
import { AdminSectionTabs } from "@/components/admin/admin-section-tabs";
import { AdminSegmented } from "@/components/admin/admin-segmented";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { BarList } from "@/components/admin/charts/bar-list";
import { ShareBar } from "@/components/admin/charts/share-bar";
import { TrendChart } from "@/components/admin/charts/trend-chart";
import { ReportTable } from "@/components/admin/report-table";
import { StatusPill } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { Button } from "@/components/ui/button";
import { available, stockLevel } from "@/lib/admin/catalogue";
import { count, delta, money, moneyShort, percent } from "@/lib/admin/format";
import {
  LOW_STOCK,
  RANGES,
  bestBuckets,
  countSeries,
  customerMix,
  methodMix,
  newCustomersBefore,
  newCustomersIn,
  ordersIn,
  refundedIn,
  repeatShare,
  returnsBefore,
  returnsBy,
  returnsIn,
  revenueByCategory,
  revenueByChannel,
  revenueByState,
  seriesFor,
  topProducts,
  topSpenders,
  totalsOf,
  unitsBySize,
  type Bucket,
  type ProductLine,
  type RangeDays,
  type Span,
  type SpendLine,
} from "@/lib/admin/insights";

type Tab = "sales" | "products" | "customers" | "returns";

const TABS: { href: string; key: Tab; label: string }[] = [
  { href: "#sales", key: "sales", label: "Sales" },
  { href: "#products", key: "products", label: "Products" },
  { href: "#customers", key: "customers", label: "Customers" },
  { href: "#returns", key: "returns", label: "Returns" },
];

/**
 * The numbers behind the dashboard, in four readings of one period: what was
 * taken, what was sold, who bought it and what came back. The period is
 * chosen once at the top and every tab obeys it, so moving between them
 * compares like with like rather than quietly changing the question.
 */
export function ReportsScreen() {
  const [days, setDays] = useState<RangeDays>(90);
  const [tab, setTab] = useState<Tab>("sales");

  const span = useMemo(() => ordersIn(days), [days]);
  const period = RANGES.find((range) => range.days === days)!.label;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Reports"
        blurb="Sales, returns and sell-through over time — the numbers behind the dashboard."
      >
        <AdminRangeTabs value={days} onChange={setDays} />
      </AdminPageHeader>

      <div className="mt-6 overflow-x-auto">
        <AdminSectionTabs
          tabs={TABS.map(({ href, label }) => ({ href, label }))}
          active={`#${tab}`}
          onSelect={(href) => setTab(href.slice(1) as Tab)}
        />
      </div>

      {tab === "sales" ? (
        <Sales days={days} period={period} span={span} />
      ) : tab === "products" ? (
        <Products days={days} period={period} span={span} />
      ) : tab === "customers" ? (
        <Customers days={days} period={period} span={span} />
      ) : (
        <Returns days={days} period={period} span={span} />
      )}
    </div>
  );
}

type TabProps = {
  days: RangeDays;
  period: string;
  span: Span;
};

/* ----------------------------------------------------------------- sales */

function Sales({ days, period, span }: TabProps) {
  const [metric, setMetric] = useState<"revenue" | "orders" | "units">("revenue");

  const now = useMemo(() => totalsOf(span.orders), [span]);
  const before = useMemo(() => totalsOf(span.earlier), [span]);
  const series = useMemo(() => seriesFor(span.orders, days), [span, days]);
  const channels = useMemo(() => revenueByChannel(span.orders), [span]);
  const methods = useMemo(() => methodMix(days), [days]);
  const best = useMemo(() => bestBuckets(series), [series]);

  const columns = useMemo<Column<Bucket>[]>(
    () => [
      {
        key: "label",
        header: days > 120 ? "Month" : "Day",
        className: "font-medium",
        csv: (row) => row.key,
        cell: (row) => row.label,
      },
      {
        key: "orders",
        header: "Orders",
        align: "right",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.orders,
        cell: (row) => count(row.orders),
      },
      {
        key: "units",
        header: "Pieces",
        align: "right",
        hideBelow: "lg",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.units,
        cell: (row) => count(row.units),
      },
      {
        key: "revenue",
        header: "Taken",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.revenue,
        cell: (row) => money(row.revenue),
      },
    ],
    [days]
  );

  return (
    <>
      <Tiles>
        <AdminStatCard
          label="Taken"
          value={moneyShort(now.revenue)}
          trend={moved(now.revenue, before.revenue)}
          detail={`Paid orders in ${period}`}
        />
        <AdminStatCard
          label="Orders"
          value={count(now.orders)}
          trend={moved(now.orders, before.orders)}
          detail="Placed in the period"
        />
        <AdminStatCard
          label="Pieces"
          value={count(now.units)}
          trend={moved(now.units, before.units)}
          detail="Items across every order"
        />
        <AdminStatCard
          label="Average order"
          value={moneyShort(now.average)}
          trend={moved(now.average, before.average)}
          detail="What a basket is worth"
        />
        <AdminStatCard
          label="Customers"
          value={count(now.customers)}
          trend={moved(now.customers, before.customers)}
          detail="People who ordered at least once"
        />
        <AdminStatCard
          label="Refunded"
          value={moneyShort(now.refunded)}
          tone={now.refunded ? "warning" : "muted"}
          trend={moved(now.refunded, before.refunded, true)}
          detail={`${percent(now.refunded, now.revenue + now.refunded)} of everything charged`}
        />
      </Tiles>

      <AdminPanel className="mt-5">
        <AdminPanelHeader
          title="Over the period"
          detail={days > 120 ? "By month" : "By day"}
        >
          <AdminSegmented
            label="Measure"
            value={metric}
            onChange={setMetric}
            options={[
              { value: "revenue", label: "Taken" },
              { value: "orders", label: "Orders" },
              { value: "units", label: "Pieces" },
            ]}
          />
        </AdminPanelHeader>
        <div className="px-2 py-4 sm:px-4">
          <TrendChart
            key={metric}
            caption={`${metric === "revenue" ? "Money taken" : metric === "orders" ? "Orders placed" : "Pieces sold"} over ${period}`}
            points={series.map((bucket) => ({
              key: bucket.key,
              label: bucket.label,
              value: bucket[metric],
            }))}
            format={metric === "revenue" ? moneyShort : count}
          />
        </div>
      </AdminPanel>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <AdminPanel className="p-5">
          <Heading title="How it was ordered" detail="Share of what was taken, by channel" />
          <ShareBar className="mt-4" shares={channels} format={moneyShort} />
        </AdminPanel>
        <AdminPanel className="p-5">
          <Heading title="How it was paid for" detail="Captured payments only" />
          <BarList className="mt-4" rows={methods} format={moneyShort} />
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5">
        <AdminPanelHeader
          title={days > 120 ? "Best months" : "Best days"}
          detail="Where the period's takings actually came from"
        >
          <Export
            name="jygs-sales"
            columns={columns}
            rows={series}
            noun={days > 120 ? "months" : "days"}
          />
        </AdminPanelHeader>
        <ReportTable
          rows={best}
          columns={columns}
          id={(row) => row.key}
          card={{ title: (row) => row.label, fields: ["orders", "units", "revenue"] }}
          empty={`Nothing was taken in ${period}.`}
        />
      </AdminPanel>
    </>
  );
}

/* -------------------------------------------------------------- products */

function Products({ period, span }: TabProps) {
  const products = useMemo(() => topProducts(span.orders, 10), [span]);
  const categories = useMemo(() => revenueByCategory(span.orders), [span]);
  const sizes = useMemo(() => unitsBySize(span.orders), [span]);
  const units = products.reduce((sum, row) => sum + row.units, 0);
  const earned = products.reduce((sum, row) => sum + row.margin, 0);
  const revenue = products.reduce((sum, row) => sum + row.revenue, 0);
  const soldOut = LOW_STOCK.filter((item) => available(item) <= 0).length;

  const columns = useMemo<Column<ProductLine>[]>(
    () => [
      {
        key: "name",
        header: "Piece",
        className: "font-medium",
        csv: (row) => row.name,
        cell: (row) => (
          <Link href={`/admin/products/${row.id}`} className="hover:text-accent-2">
            {row.name}
          </Link>
        ),
      },
      {
        key: "sku",
        header: "SKU",
        hideBelow: "lg",
        className: "font-admin-mono text-[12.5px] text-foreground/60",
        csv: (row) => row.sku,
        cell: (row) => row.sku,
      },
      {
        key: "category",
        header: "Shelf",
        hideBelow: "xl",
        className: "text-foreground/70",
        csv: (row) => row.category,
        cell: (row) => row.category,
      },
      {
        key: "units",
        header: "Pieces",
        align: "right",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.units,
        cell: (row) => count(row.units),
      },
      {
        key: "revenue",
        header: "Taken",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.revenue,
        cell: (row) => money(row.revenue),
      },
      {
        key: "margin",
        header: "Kept",
        align: "right",
        hideBelow: "lg",
        className: "font-feature-tnum",
        csv: (row) => row.margin,
        cell: (row) => (
          <span className="text-emerald-700 dark:text-emerald-400">{money(row.margin)}</span>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Tiles>
        <AdminStatCard label="Pieces sold" value={count(units)} detail={`Across the ten best in ${period}`} />
        <AdminStatCard label="Taken by them" value={moneyShort(revenue)} detail="What the ten brought in" />
        <AdminStatCard
          label="Kept"
          value={moneyShort(earned)}
          tone="positive"
          detail={`${percent(earned, revenue)} of what they took`}
        />
        <AdminStatCard label="Shelves selling" value={count(categories.length)} detail="Categories with a sale in the period" />
        <AdminStatCard
          label="Running low"
          value={count(LOW_STOCK.length - soldOut)}
          tone={LOW_STOCK.length > soldOut ? "warning" : "muted"}
          detail="Live pieces near the warning line"
        />
        <AdminStatCard
          label="Sold out"
          value={count(soldOut)}
          tone={soldOut ? "warning" : "muted"}
          detail="Live in the shop with nothing behind it"
        />
      </Tiles>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <AdminPanel className="p-5">
          <Heading title="By shelf" detail={`What each category took over ${period}`} />
          <BarList className="mt-4" rows={categories} format={moneyShort} />
        </AdminPanel>
        <AdminPanel className="p-5">
          <Heading title="By size" detail="Pieces sold — the number that decides the next cut" />
          <BarList className="mt-4" rows={sizes} format={count} />
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5">
        <AdminPanelHeader title="Selling best" detail="The ten pieces that took the most">
          <Export name="jygs-products" columns={columns} rows={products} noun="pieces" />
        </AdminPanelHeader>
        <ReportTable
          rows={products}
          columns={columns}
          id={(row) => row.id}
          card={{
            title: (row) => row.name,
            subtitle: (row) => row.sku,
            fields: ["category", "units", "revenue", "margin"],
          }}
          empty={`Nothing sold in ${period}.`}
        />
      </AdminPanel>

      <AdminPanel className="mt-5">
        <AdminPanelHeader
          title="Needs cutting"
          detail="Emptiest first, whether or not it sold in this period"
        />
        <ul className="divide-y divide-border">
          {LOW_STOCK.slice(0, 8).map((item) => {
            const left = available(item);
            const level = stockLevel(item);
            return (
              <li key={item.id}>
                <Link
                  href={`/admin/products/${item.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px]">{item.name}</span>
                    <span className="block truncate font-admin-mono text-[11.5px] text-foreground/48">
                      {item.sku} · {item.category}
                    </span>
                  </span>
                  <StatusPill tone={level === "Out of stock" ? "bad" : "warn"}>
                    {level === "Out of stock" ? "Sold out" : `${left} left`}
                  </StatusPill>
                </Link>
              </li>
            );
          })}
        </ul>
      </AdminPanel>
    </>
  );
}

/* ------------------------------------------------------------- customers */

function Customers({ days, period, span }: TabProps) {
  const fresh = useMemo(() => newCustomersIn(days), [days]);
  const joins = useMemo(() => countSeries(fresh.map((c) => c.joined), days), [fresh, days]);
  const mix = useMemo(() => customerMix(), []);
  const states = useMemo(() => revenueByState(span.orders), [span]);
  const spenders = useMemo(() => topSpenders(span.orders, 8), [span]);
  const split = useMemo(
    () => repeatShare(span.orders, span.from),
    [span]
  );

  const now = useMemo(() => totalsOf(span.orders), [span]);
  const before = useMemo(() => totalsOf(span.earlier), [span]);
  const freshBefore = useMemo(() => newCustomersBefore(days), [days]);

  const columns = useMemo<Column<SpendLine>[]>(
    () => [
      {
        key: "name",
        header: "Customer",
        className: "font-medium",
        csv: (row) => row.name,
        cell: (row) => (
          <Link href={`/admin/customers/${row.id}`} className="hover:text-accent-2">
            {row.name}
          </Link>
        ),
      },
      {
        key: "city",
        header: "City",
        hideBelow: "lg",
        className: "text-foreground/70",
        csv: (row) => row.city,
        cell: (row) => row.city,
      },
      {
        key: "orders",
        header: "Orders",
        align: "right",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.orders,
        cell: (row) => count(row.orders),
      },
      {
        key: "spent",
        header: "Spent",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.spent,
        cell: (row) => money(row.spent),
      },
    ],
    []
  );

  return (
    <>
      <Tiles>
        <AdminStatCard
          label="Who ordered"
          value={count(now.customers)}
          trend={moved(now.customers, before.customers)}
          detail={`Distinct people in ${period}`}
        />
        <AdminStatCard
          label="New to the book"
          value={count(fresh.length)}
          trend={moved(fresh.length, freshBefore)}
          detail="Joined inside the period"
        />
        <AdminStatCard
          label="Ordered before"
          value={percent(split.repeat, now.orders)}
          trend={null}
          detail={`${count(split.repeat)} of ${count(now.orders)} orders`}
        />
        <AdminStatCard
          label="Average order"
          value={moneyShort(now.average)}
          trend={moved(now.average, before.average)}
          detail="What a basket is worth"
        />
        <AdminStatCard
          label="Per customer"
          value={moneyShort(now.customers ? Math.round(now.revenue / now.customers) : 0)}
          trend={null}
          detail="Taken, divided by who bought"
        />
        <AdminStatCard
          label="States buying"
          value={count(states.length)}
          trend={null}
          detail="Where the period's orders went"
        />
      </Tiles>

      <AdminPanel className="mt-5">
        <AdminPanelHeader
          title="New customers"
          detail={`People who joined during ${period}, ${days > 120 ? "by month" : "by day"}`}
        />
        <div className="px-2 py-4 sm:px-4">
          <TrendChart
            caption={`New customers over ${period}`}
            points={joins}
            format={count}
            height={200}
          />
        </div>
      </AdminPanel>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <AdminPanel className="p-5">
          <Heading title="The book by kind" detail="Every customer, grouped by how often they buy" />
          <ShareBar className="mt-4" shares={mix} format={count} />
        </AdminPanel>
        <AdminPanel className="p-5">
          <Heading title="Where they are" detail={`Taken by state over ${period}`} />
          <BarList className="mt-4" rows={states} format={moneyShort} limit={6} />
        </AdminPanel>
      </div>

      <AdminPanel className="mt-5">
        <AdminPanelHeader title="Spent the most" detail="Inside the period, not all time">
          <Export name="jygs-customers" columns={columns} rows={spenders} noun="customers" />
        </AdminPanelHeader>
        <ReportTable
          rows={spenders}
          columns={columns}
          id={(row) => row.id}
          card={{
            title: (row) => row.name,
            subtitle: (row) => row.city,
            fields: ["orders", "spent"],
          }}
          empty={`Nobody ordered in ${period}.`}
        />
      </AdminPanel>
    </>
  );
}

/* --------------------------------------------------------------- returns */

function Returns({ days, period, span }: TabProps) {
  const entries = useMemo(() => returnsIn(days), [days]);
  const earlier = useMemo(() => returnsBefore(days), [days]);
  const opened = useMemo(() => countSeries(entries.map((entry) => entry.opened), days), [entries, days]);
  const reasons = useMemo(() => returnsBy(entries, (entry) => entry.reason), [entries]);
  const conditions = useMemo(() => returnsBy(entries, (entry) => entry.condition), [entries]);
  const stages = useMemo(() => returnsBy(entries, (entry) => entry.stage), [entries]);

  const refunded = refundedIn(entries);
  const now = useMemo(() => totalsOf(span.orders), [span]);
  const resellable = entries.filter((entry) => entry.condition === "As new").length;

  return (
    <>
      <Tiles>
        <AdminStatCard
          label="Came back"
          value={count(entries.length)}
          tone={entries.length ? "warning" : "muted"}
          trend={moved(entries.length, earlier, true)}
          detail={`Opened in ${period}`}
        />
        <AdminStatCard
          label="Return rate"
          value={percent(entries.length, now.orders)}
          trend={null}
          detail={`Of ${count(now.orders)} orders placed`}
        />
        <AdminStatCard
          label="Refunded"
          value={moneyShort(refunded)}
          tone={refunded ? "warning" : "muted"}
          trend={null}
          detail="Money already given back"
        />
        <AdminStatCard
          label="Still open"
          value={count(stages.filter((s) => s.label !== "Refunded" && s.label !== "Rejected").reduce((sum, s) => sum + s.value, 0))}
          trend={null}
          detail="Requested, in transit or on the bench"
        />
        <AdminStatCard
          label="Back on the shelf"
          value={count(resellable)}
          tone="positive"
          trend={null}
          detail={`${percent(resellable, entries.length)} came back as new`}
        />
        <AdminStatCard
          label="Commonest reason"
          value={reasons[0]?.label ?? "—"}
          trend={null}
          detail={
            reasons[0]
              ? `${count(reasons[0].value)} of ${count(entries.length)} returns`
              : "Nothing came back in the period"
          }
        />
      </Tiles>

      <AdminPanel className="mt-5">
        <AdminPanelHeader
          title="Returns opened"
          detail={`Over ${period}, ${days > 120 ? "by month" : "by day"}`}
        />
        <div className="px-2 py-4 sm:px-4">
          <TrendChart
            caption={`Returns opened over ${period}`}
            points={opened}
            format={count}
            height={200}
          />
        </div>
      </AdminPanel>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
        <AdminPanel className="p-5">
          <Heading title="Why" detail="The reason the customer gave" />
          <BarList className="mt-4" rows={reasons} format={count} empty="Nothing came back." />
        </AdminPanel>
        <AdminPanel className="p-5">
          <Heading title="In what state" detail="What the studio found in the box" />
          <BarList className="mt-4" rows={conditions} format={count} empty="Nothing came back." />
        </AdminPanel>
        <AdminPanel className="p-5">
          <Heading title="How far along" detail="Where each one has got to" />
          <ShareBar className="mt-4" shares={stages} format={count} empty="Nothing came back." />
        </AdminPanel>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- shared */

function Tiles({ children }: { children: React.ReactNode }) {
  return (
    <AdminStatRow>{children}</AdminStatRow>
  );
}

function Heading({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="min-w-0">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      <p className="mt-0.5 text-[12.5px] text-foreground/55">{detail}</p>
    </div>
  );
}

function Export<T>({
  name,
  columns,
  rows,
  noun,
}: {
  name: string;
  columns: Column<T>[];
  rows: T[];
  noun: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 sm:h-7"
      onClick={() => {
        downloadCsv(`${name}.csv`, toCsv(columns, rows));
        toast(`${rows.length} ${noun} exported.`);
      }}
    >
      <Download strokeWidth={1.7} />
      Export
    </Button>
  );
}

/** A move against the window before, with refunds and returns read the other way up. */
function moved(now: number, before: number, lowerIsBetter = false) {
  const change = delta(now, before);
  if (!change) return null;
  return { label: change.label, up: lowerIsBetter ? !change.up : change.up };
}
