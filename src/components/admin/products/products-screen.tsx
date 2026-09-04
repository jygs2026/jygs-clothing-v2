"use client";

import { Download, Eye, MoreVertical, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { ProductThumb } from "@/components/admin/products/product-thumb";
import { StatusMark, StatusPill } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  CATALOGUE,
  CATEGORIES,
  PRODUCT_STATUSES,
  STOCK_LEVELS,
  available,
  stockLevel,
  type CatalogueItem,
} from "@/lib/admin/catalogue";
import { count, formatDate, money, percent } from "@/lib/admin/format";
import { byNumber, byText, searchAcross, useAdminTable } from "@/lib/admin/table";

/** One vocabulary for how full a shelf is, shared with Inventory. */
export const STOCK_TONE = {
  "In stock": "good",
  "Low stock": "warn",
  "Out of stock": "bad",
} as const;

const STATUS_TONE = {
  Active: "good",
  Draft: "neutral",
  Archived: "warn",
} as const;

export function ProductsScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const stats = useMemo(() => {
    const active = CATALOGUE.filter((item) => item.status === "Active");
    return {
      total: CATALOGUE.length,
      active: active.length,
      out: CATALOGUE.filter((item) => stockLevel(item) === "Out of stock").length,
      low: CATALOGUE.filter((item) => stockLevel(item) === "Low stock").length,
      draft: CATALOGUE.filter((item) => item.status === "Draft").length,
      shelf: CATALOGUE.reduce((sum, item) => sum + available(item) * item.price, 0),
    };
  }, []);

  const table = useAdminTable<CatalogueItem>({
    rows: CATALOGUE,
    id: (row) => row.id,
    initialQuery,
    search: useMemo(
      () =>
        searchAcross<CatalogueItem>(
          (row) => row.name,
          (row) => row.sku,
          (row) => row.category,
          (row) => row.cloth
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
          key: "status",
          label: "All statuses",
          options: PRODUCT_STATUSES.map((s) => ({ value: s, label: s })),
          match: (row: CatalogueItem, value: string) => row.status === value,
        },
        {
          key: "stock",
          label: "All stock",
          options: STOCK_LEVELS.map((s) => ({ value: s, label: s })),
          match: (row: CatalogueItem, value: string) => stockLevel(row) === value,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "updated",
          label: "Recently updated",
          compare: (a: CatalogueItem, b: CatalogueItem) => b.updated.localeCompare(a.updated),
        },
        { value: "name", label: "Name A–Z", compare: byText<CatalogueItem>((row) => row.name) },
        {
          value: "priceHigh",
          label: "Highest price",
          compare: byNumber<CatalogueItem>((row) => row.price).high,
        },
        {
          value: "stockLow",
          label: "Least stock",
          compare: byNumber<CatalogueItem>((row) => available(row)).low,
        },
      ],
      []
    ),
  });

  const columns = useMemo<Column<CatalogueItem>[]>(
    () => [
      {
        key: "product",
        header: "Product",
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
              <p className="truncate text-[12px] text-foreground/50">
                {row.colours} colour{row.colours === 1 ? "" : "s"} · {row.category}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "sku",
        header: "SKU",
        hideBelow: "lg",
        className: "font-admin-mono text-[12px] text-foreground/60",
        csv: (row) => row.sku,
        cell: (row) => row.sku,
      },
      {
        key: "category",
        header: "Category",
        hideBelow: "xl",
        className: "text-foreground/70",
        csv: (row) => row.category,
        cell: (row) => row.category,
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
        key: "stock",
        header: "Stock",
        align: "right",
        csv: (row) => available(row),
        cell: (row) => {
          const level = stockLevel(row);
          return (
            <span className="inline-flex flex-col items-end">
              <span className="font-feature-tnum">{available(row)}</span>
              <StatusMark tone={STOCK_TONE[level]}>
                <span className="text-[11.5px]">{level}</span>
              </StatusMark>
            </span>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        csv: (row) => row.status,
        cell: (row) => <StatusPill tone={STATUS_TONE[row.status]}>{row.status}</StatusPill>,
      },
      {
        key: "updated",
        header: "Updated",
        hideBelow: "lg",
        className: "text-foreground/62",
        csv: (row) => row.updated,
        cell: (row) => formatDate(row.updated),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Products"
        blurb="The catalogue — cloth, colours, sizes and photography for every piece in the run."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-products.csv", toCsv(columns, table.matched));
            toast(`${table.total} products exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
        <Button
          size="lg"
          onClick={() =>
            toast("Adding a piece is not wired up.", {
              description: "The catalogue is read from the shop's own product data.",
            })
          }
        >
          <Plus strokeWidth={1.9} />
          Add product
        </Button>
      </AdminPageHeader>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <AdminStatCard label="All products" value={count(stats.total)} detail="In the catalogue" />
        <AdminStatCard
          label="Active"
          value={count(stats.active)}
          tone="positive"
          detail={`${percent(stats.active, stats.total)} of the catalogue`}
        />
        <AdminStatCard
          label="Out of stock"
          value={count(stats.out)}
          tone={stats.out ? "warning" : "muted"}
          detail="Nothing left to sell"
        />
        <AdminStatCard
          label="Low stock"
          value={count(stats.low)}
          tone="warning"
          detail="Worth cutting again"
        />
        <AdminStatCard label="Draft" value={count(stats.draft)} tone="muted" detail="Not published" />
        <AdminStatCard
          label="On the shelf"
          value={money(stats.shelf)}
          detail="Retail value of stock"
        />
      </div>

      <AdminPanel className="mt-5">
        <TableToolbar table={table} placeholder="Search products…" />
        <DataTable
          table={table}
          columns={columns}
          noun="products"
          empty="No pieces match that. Try a different category or stock level."
          rowHref={(row) => `/admin/products/${row.id}`}
          card={{
            lead: (row) => <ProductThumb item={row} />,
            title: (row) => row.name,
            subtitle: (row) => <span className="font-admin-mono">{row.sku}</span>,
            badges: (row) => (
              <>
                <StatusPill tone={STATUS_TONE[row.status]}>{row.status}</StatusPill>
                <StatusMark tone={STOCK_TONE[stockLevel(row)]}>{stockLevel(row)}</StatusMark>
              </>
            ),
            fields: ["price", "stock", "category", "updated"],
          }}
          actions={(row) => (
            <>
              <Link
                href={`/admin/products/${row.id}`}
                aria-label={`Open ${row.name}`}
                className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Eye className="size-3.5" strokeWidth={1.7} />
              </Link>
              <Menu>
                <MenuTrigger
                  aria-label={`More for ${row.name}`}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
                >
                  <MoreVertical className="size-3.5" strokeWidth={1.7} />
                </MenuTrigger>
                <MenuContent className="font-admin">
                  <MenuLinkItem render={<Link href={`/admin/products/${row.id}`} />}>
                    <Eye strokeWidth={1.5} />
                    Open product
                  </MenuLinkItem>
                  <MenuLinkItem render={<Link href={`/admin/inventory?q=${row.sku}`} />}>
                    <Pencil strokeWidth={1.5} />
                    Adjust stock
                  </MenuLinkItem>
                  <MenuItem onClick={() => toast(`${row.name} is read from the shop's catalogue.`)}>
                    <Pencil strokeWidth={1.5} />
                    Edit product
                  </MenuItem>
                </MenuContent>
              </Menu>
            </>
          )}
        />
      </AdminPanel>
    </div>
  );
}
