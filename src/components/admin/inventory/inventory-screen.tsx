"use client";

import { Download, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { ProductThumb } from "@/components/admin/products/product-thumb";
import { STOCK_TONE } from "@/components/admin/products/products-screen";
import { StatusMark } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  LOW_STOCK_AT,
  STOCK_LEVELS,
  available,
  committed,
  onHand,
  stockLevel,
  type CatalogueItem,
} from "@/lib/admin/catalogue";
import { useCatalogueStore } from "@/lib/admin/catalogue-store";
import { count, moneyShort, percent } from "@/lib/admin/format";
import { byNumber, byText, searchAcross, useAdminTable } from "@/lib/admin/table";
import type { Size } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * What is on the shelf, and the one thing this screen exists to let somebody
 * do: change it. Adjustments are held for the session only — the point is to
 * show the interaction, not to pretend a warehouse is listening.
 *
 * They are written to the shared catalogue rather than to this screen's own
 * state, so cutting ten more of a piece here is the same ten the Products
 * list and the product's own page report. A count that only one screen
 * believes is worse than no count at all.
 */
export function InventoryScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const rows = useCatalogueStore((s) => s.items);
  const adjustStock = useCatalogueStore((s) => s.adjustStock);

  /**
   * What this sitting has changed, per size, so the header can offer to put
   * it back. The stock itself lives in the store; this only remembers the
   * distance travelled from where the session started.
   */
  const [adjusted, setAdjusted] = useState<Record<string, number>>({});

  const stats = useMemo(() => {
    const units = rows.reduce((sum, item) => sum + onHand(item), 0);
    return {
      units,
      value: rows.reduce((sum, item) => sum + available(item) * item.cost, 0),
      out: rows.filter((item) => stockLevel(item) === "Out of stock").length,
      low: rows.filter((item) => stockLevel(item) === "Low stock").length,
      committed: rows.reduce((sum, item) => sum + committed(item), 0),
      lines: rows.length,
    };
  }, [rows]);

  // Held stable so the column definitions below, which close over it, do not
  // have to be rebuilt on every keystroke in the search box.
  const adjust = useCallback(
    (item: CatalogueItem, size: Size, by: number) => {
      const current = item.stock.find((row) => row.size === size)?.onHand ?? 0;
      // Never below zero: a shelf cannot hold minus two.
      if (current + by < 0) return;
      adjustStock(item.id, size, by);
      const key = `${item.id}:${size}`;
      setAdjusted((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + by }));
    },
    [adjustStock]
  );

  /** Walks every adjustment back by the distance it travelled. */
  function discard() {
    for (const [key, delta] of Object.entries(adjusted)) {
      if (!delta) continue;
      const [id, size] = key.split(":");
      adjustStock(id, size as Size, -delta);
    }
    setAdjusted({});
    toast("Adjustments discarded.");
  }

  const table = useAdminTable<CatalogueItem>({
    rows,
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
          key: "stock",
          label: "All stock",
          options: STOCK_LEVELS.map((s) => ({ value: s, label: s })),
          match: (row: CatalogueItem, value: string) => stockLevel(row) === value,
        },
        {
          key: "category",
          label: "All categories",
          options: CATEGORIES.map((c) => ({ value: c, label: c })),
          match: (row: CatalogueItem, value: string) => row.category === value,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "lowest",
          label: "Least stock first",
          compare: byNumber<CatalogueItem>((row) => available(row)).low,
        },
        {
          value: "highest",
          label: "Most stock first",
          compare: byNumber<CatalogueItem>((row) => available(row)).high,
        },
        { value: "name", label: "Name A–Z", compare: byText<CatalogueItem>((row) => row.name) },
      ],
      []
    ),
    initialSort: "lowest",
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
              <p className="truncate font-admin-mono text-[11.5px] text-foreground/50">
                {row.sku}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "sizes",
        header: "By size",
        hideBelow: "lg",
        csv: (row) => row.stock.map((s) => `${s.size}:${s.onHand}`).join(" "),
        cell: (row) => (
          <div className="flex items-center gap-1">
            {row.stock.map((entry) => (
              <span
                key={entry.size}
                title={`${entry.size} — ${entry.onHand} on hand`}
                className={cn(
                  "flex h-9 min-w-10 flex-col items-center justify-center rounded border px-1 text-[11px] leading-none sm:h-7 sm:min-w-9 sm:text-[10px]",
                  entry.onHand === 0
                    ? "border-rose-600/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : entry.onHand <= 4
                      ? "border-amber-600/25 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      : "border-border bg-muted/60 text-foreground/70"
                )}
              >
                <span className="text-foreground/45">{entry.size}</span>
                <span className="mt-px font-medium font-feature-tnum">{entry.onHand}</span>
              </span>
            ))}
          </div>
        ),
      },
      {
        key: "onHand",
        header: "On hand",
        align: "right",
        className: "font-feature-tnum",
        csv: (row) => onHand(row),
        cell: (row) => onHand(row),
      },
      {
        key: "committed",
        header: "Spoken for",
        align: "right",
        hideBelow: "xl",
        className: "text-foreground/60 font-feature-tnum",
        csv: (row) => committed(row),
        cell: (row) => committed(row),
      },
      {
        key: "available",
        header: "Available",
        align: "right",
        csv: (row) => available(row),
        cell: (row) => (
          <span className="inline-flex flex-col items-end">
            <span className="font-medium font-feature-tnum">{available(row)}</span>
            <StatusMark tone={STOCK_TONE[stockLevel(row)]}>
              <span className="text-[11.5px]">{stockLevel(row)}</span>
            </StatusMark>
          </span>
        ),
      },
      {
        key: "adjust",
        header: "Adjust M",
        align: "right",
        cell: (row) => {
          // The middle size carries most of the run, so it is the one worth a
          // control in the row; the rest are adjusted on the product page.
          const size: Size = "M";
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => adjust(row, size, -1)}
                aria-label={`One fewer ${row.name} in ${size}`}
                className="flex size-7 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Minus className="size-3" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => adjust(row, size, 1)}
                aria-label={`One more ${row.name} in ${size}`}
                className="flex size-7 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-3" strokeWidth={2} />
              </button>
            </div>
          );
        },
      },
    ],
    [adjust]
  );

  const changes = Object.values(adjusted).filter(Boolean).length;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Inventory"
        blurb="Stock by size and colour: what is cut, what is committed and what is left."
      >
        {changes > 0 ? (
          <Button variant="outline" size="lg" onClick={discard}>
            Discard {changes} change{changes === 1 ? "" : "s"}
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-inventory.csv", toCsv(columns, table.matched));
            toast(`${table.total} lines exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard label="Pieces on hand" value={count(stats.units)} detail={`Across ${stats.lines} products`} />
        <AdminStatCard label="Spoken for" value={count(stats.committed)} detail="In open orders" />
        <AdminStatCard
          label="Out of stock"
          value={count(stats.out)}
          tone={stats.out ? "warning" : "muted"}
          detail={`${percent(stats.out, stats.lines)} of the catalogue`}
        />
        <AdminStatCard label="Low stock" value={count(stats.low)} tone="warning" detail={`At or under ${LOW_STOCK_AT}`} />
        <AdminStatCard label="Stock at cost" value={moneyShort(stats.value)} detail="What it cost to make" />
        <AdminStatCard
          label="Unsaved"
          value={changes}
          tone={changes ? "warning" : "muted"}
          detail={changes ? "Adjustments held in the page" : "Nothing changed"}
        />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar table={table} placeholder="Search stock…" />
        <DataTable
          table={table}
          columns={columns}
          noun="products"
          empty="No stock matches that."
          card={{
            lead: (row) => <ProductThumb item={row} className="size-14 rounded-lg" />,
            title: (row) => row.name,
            subtitle: (row) => <span className="font-admin-mono">{row.sku}</span>,
            badges: (row) => (
              <StatusMark tone={STOCK_TONE[stockLevel(row)]}>{stockLevel(row)}</StatusMark>
            ),
            metric: (row) => ({
              value: available(row),
              label: "Available",
              tone: STOCK_TONE[stockLevel(row)],
            }),
            fields: ["onHand", "committed", "sizes"],
            wide: ["sizes"],
          }}
        />
      </AdminPanel>
    </div>
  );
}
