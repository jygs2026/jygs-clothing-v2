"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { ProductThumb } from "@/components/admin/products/product-thumb";
import { StatusPill } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  margin,
  marginPercent,
  type CatalogueItem,
} from "@/lib/admin/catalogue";
import { useCatalogueStore } from "@/lib/admin/catalogue-store";
import { money, moneyShort } from "@/lib/admin/format";
import { ALL_ORDERS } from "@/lib/admin/orders";
import { byNumber, byText, searchAcross, useAdminTable } from "@/lib/admin/table";
import { cn } from "@/lib/utils";

/**
 * What each piece costs to make and what it sells for. Units sold come out of
 * the order book, so the contribution column is what the studio has actually
 * earned on a piece rather than what it would earn if everything sold.
 */

/** Below this the studio is not covering its overheads on a piece. */
const THIN_MARGIN = 55;

export function PricingScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const soldBy = useMemo(() => {
    const units = new Map<string, number>();
    for (const order of ALL_ORDERS) {
      if (order.payment !== "Paid") continue;
      for (const line of order.lines) {
        units.set(line.productId, (units.get(line.productId) ?? 0) + line.qty);
      }
    }
    return units;
  }, []);

  const items = useCatalogueStore((s) => s.items);

  const stats = useMemo(() => {
    const margins = items.map(marginPercent);
    const contribution = items.reduce(
      (sum, item) => sum + margin(item) * (soldBy.get(item.id) ?? 0),
      0
    );
    const revenue = items.reduce(
      (sum, item) => sum + item.price * (soldBy.get(item.id) ?? 0),
      0
    );
    return {
      average: margins.reduce((a, b) => a + b, 0) / (margins.length || 1),
      thin: items.filter((item) => marginPercent(item) < THIN_MARGIN).length,
      best: [...items].sort((a, b) => marginPercent(b) - marginPercent(a))[0],
      contribution,
      revenue,
      cost: revenue - contribution,
    };
  }, [items, soldBy]);

  const table = useAdminTable<CatalogueItem>({
    rows: items,
    id: (row) => row.id,
    initialQuery,
    initialPerPage: 25,
    search: useMemo(
      () =>
        searchAcross<CatalogueItem>(
          (row) => row.name,
          (row) => row.sku,
          (row) => row.category
        ),
      []
    ),
    filters: useMemo(
      () => [
        {
          key: "category",
          label: "All categories",
          options: CATEGORIES.map((c) => ({ value: c, label: c })),
          match: (row: CatalogueItem, value: string) => row.category === value,
        },
        {
          key: "margin",
          label: "All margins",
          options: [
            { value: "thin", label: `Under ${THIN_MARGIN}%` },
            { value: "healthy", label: `${THIN_MARGIN}% and over` },
          ],
          match: (row: CatalogueItem, value: string) =>
            value === "thin"
              ? marginPercent(row) < THIN_MARGIN
              : marginPercent(row) >= THIN_MARGIN,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "thinnest",
          label: "Thinnest margin",
          compare: byNumber<CatalogueItem>(marginPercent).low,
        },
        {
          value: "fattest",
          label: "Best margin",
          compare: byNumber<CatalogueItem>(marginPercent).high,
        },
        {
          value: "priceHigh",
          label: "Highest price",
          compare: byNumber<CatalogueItem>((row) => row.price).high,
        },
        { value: "name", label: "Name A–Z", compare: byText<CatalogueItem>((row) => row.name) },
      ],
      []
    ),
    initialSort: "thinnest",
  });

  const columns = useMemo<Column<CatalogueItem>[]>(
    () => [
      {
        key: "product",
        header: "Piece",
        csv: (row) => row.name,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <ProductThumb item={row} />
            <div className="min-w-0">
              <Link
                href={`/admin/products/${row.id}`}
                className="block truncate font-medium hover:text-accent-2"
              >
                {row.name}
              </Link>
              <p className="truncate text-[12px] text-foreground/50">{row.category}</p>
            </div>
          </div>
        ),
      },
      {
        key: "cost",
        header: "Cost",
        align: "right",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.cost,
        cell: (row) => money(row.cost),
      },
      {
        key: "price",
        header: "Price",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.price,
        cell: (row) => money(row.price),
      },
      {
        key: "margin",
        header: "Margin",
        align: "right",
        csv: (row) => Math.round(marginPercent(row)),
        cell: (row) => {
          const share = marginPercent(row);
          return (
            <span className="inline-flex items-center justify-end gap-2.5">
              <span
                aria-hidden="true"
                className="hidden h-1 w-14 overflow-hidden rounded-full bg-muted lg:block"
              >
                <span
                  className={cn(
                    "block h-full rounded-full",
                    share < THIN_MARGIN ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.max(share, 2)}%` }}
                />
              </span>
              <span
                className={cn(
                  "font-medium font-feature-tnum",
                  share < THIN_MARGIN && "text-amber-700 dark:text-amber-400"
                )}
              >
                {Math.round(share)}%
              </span>
            </span>
          );
        },
      },
      {
        key: "each",
        header: "Per piece",
        align: "right",
        hideBelow: "lg",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => margin(row),
        cell: (row) => money(margin(row)),
      },
      {
        key: "sold",
        header: "Sold",
        align: "right",
        hideBelow: "xl",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => soldBy.get(row.id) ?? 0,
        cell: (row) => soldBy.get(row.id) ?? 0,
      },
      {
        key: "contribution",
        header: "Contribution",
        align: "right",
        hideBelow: "lg",
        className: "font-medium font-feature-tnum",
        csv: (row) => margin(row) * (soldBy.get(row.id) ?? 0),
        cell: (row) => money(margin(row) * (soldBy.get(row.id) ?? 0)),
      },
    ],
    [soldBy]
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Pricing"
        blurb="What each piece costs to make and what it sells for, across every market."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-pricing.csv", toCsv(columns, table.matched));
            toast(`${table.total} pieces exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard
          label="Average margin"
          value={`${Math.round(stats.average)}%`}
          tone={stats.average >= THIN_MARGIN ? "positive" : "warning"}
          detail="Across the catalogue"
        />
        <AdminStatCard
          label="Thin margins"
          value={stats.thin}
          tone={stats.thin ? "warning" : "muted"}
          detail={`Under ${THIN_MARGIN}%`}
        />
        <AdminStatCard
          label="Best margin"
          value={stats.best ? `${Math.round(marginPercent(stats.best))}%` : "—"}
          tone={stats.best ? "default" : "muted"}
          detail={stats.best?.name ?? "Nothing in the catalogue"}
        />
        <AdminStatCard label="Revenue" value={moneyShort(stats.revenue)} detail="Paid orders" />
        <AdminStatCard label="Cost of goods" value={moneyShort(stats.cost)} detail="What it cost to make" />
        <AdminStatCard
          label="Contribution"
          value={moneyShort(stats.contribution)}
          tone="positive"
          detail="Before overheads"
        />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar table={table} placeholder="Search pricing…" />
        <DataTable
          table={table}
          columns={columns}
          noun="pieces"
          empty="No pieces match that."
          card={{
            lead: (row) => <ProductThumb item={row} />,
            title: (row) => row.name,
            subtitle: (row) => row.category,
            badges: (row) => (
              <StatusPill tone={marginPercent(row) < THIN_MARGIN ? "warn" : "good"}>
                {Math.round(marginPercent(row))}% margin
              </StatusPill>
            ),
            fields: ["cost", "price", "each", "sold", "contribution"],
          }}
        />
      </AdminPanel>
    </div>
  );
}
