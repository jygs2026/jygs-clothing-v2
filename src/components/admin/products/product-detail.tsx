"use client";

import { ChevronLeft, ExternalLink, Minus, Package, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { ProductDialog } from "@/components/admin/products/product-dialog";
import { ProductThumb } from "@/components/admin/products/product-thumb";
import { STOCK_TONE } from "@/components/admin/products/products-screen";
import { StatusMark, StatusPill } from "@/components/admin/status-pill";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LOW_STOCK_AT,
  available,
  committed,
  marginPercent,
  onHand,
  stockLevel,
} from "@/lib/admin/catalogue";
import { useCatalogueById, useCatalogueStore } from "@/lib/admin/catalogue-store";
import { formatDate, money, percent } from "@/lib/admin/format";
import { ALL_ORDERS } from "@/lib/admin/orders";
import { cn } from "@/lib/utils";

/**
 * One piece: what it is, what it costs to make, what is on the shelf size by
 * size, and what it has actually sold. The sales figures are counted out of
 * the order book rather than stored, so this page and the orders screen can
 * never disagree about how many went out.
 */
export function ProductDetail() {
  const params = useParams<{ id: string }>();
  const item = useCatalogueById().get(params.id);
  const adjustStock = useCatalogueStore((s) => s.adjustStock);
  const [editing, setEditing] = useState(false);

  const sold = useMemo(() => {
    if (!item) return { units: 0, revenue: 0, orders: 0 };
    let units = 0;
    let revenue = 0;
    let orders = 0;
    for (const order of ALL_ORDERS) {
      const lines = order.lines.filter((line) => line.productId === item.id);
      if (!lines.length) continue;
      orders += 1;
      for (const line of lines) {
        units += line.qty;
        if (order.payment === "Paid") revenue += line.qty * line.unit;
      }
    }
    return { units, revenue, orders };
  }, [item]);

  if (!item) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        <Back />
        <div className="mt-6 rounded-lg border border-dashed border-border bg-admin-surface px-6 py-16 text-center">
          <p className="text-[15px] font-medium">No piece by that name.</p>
        </div>
      </div>
    );
  }

  const level = stockLevel(item);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <Back />

      <header className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-center gap-4">
          <ProductThumb item={item} className="size-14 rounded-lg" />
          <div className="min-w-0">
            <h1 className="truncate text-[26px] leading-tight font-semibold tracking-[-0.015em] sm:text-[30px]">
              {item.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <StatusPill tone={item.status === "Active" ? "good" : "neutral"}>
                {item.status}
              </StatusPill>
              <StatusMark tone={STOCK_TONE[level]}>{level}</StatusMark>
              <span className="font-admin-mono text-[12px] text-foreground/50">{item.sku}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href={`/product/${item.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            <ExternalLink strokeWidth={1.7} />
            <span className="max-sm:sr-only">View in the shop</span>
          </Link>
          <Button size="lg" onClick={() => setEditing(true)}>
            <Pencil strokeWidth={1.7} />
            Edit
          </Button>
        </div>
      </header>

      <AdminStatRow cols={4}>
        <AdminStatCard label="Price" value={money(item.price)} detail={`Costs ${money(item.cost)} to make`} />
        <AdminStatCard
          label="Margin"
          value={`${Math.round(marginPercent(item))}%`}
          tone={marginPercent(item) > 55 ? "positive" : "warning"}
          detail={`${money(item.price - item.cost)} a piece`}
        />
        <AdminStatCard
          label="Available"
          value={available(item)}
          tone={available(item) <= LOW_STOCK_AT ? "warning" : "default"}
          detail={`${onHand(item)} on hand, ${committed(item)} spoken for`}
        />
        <AdminStatCard
          label="Sold"
          value={sold.units}
          detail={`${money(sold.revenue)} across ${sold.orders} orders`}
        />
      </AdminStatRow>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <AdminPanel>
          <AdminPanelHeader
            title="Stock by size"
            detail={`${onHand(item)} on hand across ${item.stock.length} sizes`}
          />
          <Table containerClassName="admin-table-scroll">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <Th className="pl-5">Size</Th>
                <Th className="text-right">On hand</Th>
                <Th className="text-right">Spoken for</Th>
                <Th className="text-right">Available</Th>
                <Th className="hidden sm:table-cell">Depth</Th>
                <Th className="pr-4 text-right sm:pr-5">Cut</Th>
              </TableRow>
            </TableHeader>
            <TableBody>
              {item.stock.map((row) => {
                const free = row.onHand - row.committed;
                const deepest = Math.max(...item.stock.map((entry) => entry.onHand), 1);
                return (
                  <TableRow key={row.size}>
                    <TableCell className="py-3 pl-5 text-[13px] font-medium">{row.size}</TableCell>
                    <TableCell className="text-right text-[13px] font-feature-tnum">
                      {row.onHand}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-foreground/60 font-feature-tnum">
                      {row.committed}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right text-[13px] font-medium font-feature-tnum",
                        free === 0 && "text-rose-700 dark:text-rose-400"
                      )}
                    >
                      {free}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        aria-hidden="true"
                        className="block h-1 w-full max-w-[140px] overflow-hidden rounded-full bg-muted"
                      >
                        <span
                          className={cn(
                            "block h-full rounded-full transition-[width] duration-(--admin-medium) ease-admin",
                            free === 0 ? "bg-rose-500/70" : "bg-accent"
                          )}
                          style={{ width: `${Math.max((row.onHand / deepest) * 100, 2)}%` }}
                        />
                      </span>
                    </TableCell>
                    {/*
                     * Inventory only carries a control for M, because a table
                     * of three hundred rows has no room for eight. This page
                     * is one piece, so every size gets one — which is where
                     * somebody who has just cut a run comes to enter it.
                     */}
                    <TableCell className="pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, row.size, -1)}
                          disabled={row.onHand === 0}
                          aria-label={`One fewer in ${row.size}`}
                          className="flex size-9 items-center justify-center rounded-md border border-border text-foreground/60 transition-[background-color,color,transform] duration-(--admin-fast) ease-admin hover:bg-muted hover:text-foreground active:scale-90 disabled:pointer-events-none disabled:opacity-35 sm:size-7"
                        >
                          <Minus className="size-3" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustStock(item.id, row.size, 1)}
                          aria-label={`One more in ${row.size}`}
                          className="flex size-9 items-center justify-center rounded-md border border-border text-foreground/60 transition-[background-color,color,transform] duration-(--admin-fast) ease-admin hover:bg-muted hover:text-foreground active:scale-90 sm:size-7"
                        >
                          <Plus className="size-3" strokeWidth={2} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AdminPanel>

        <AdminPanel className="p-5">
          <h2 className="text-[14px] font-semibold">The piece itself</h2>
          <dl className="mt-4 grid gap-3.5">
            <Fact label="Cloth">{item.cloth}</Fact>
            <Fact label="Category">{item.category}</Fact>
            <Fact label="Colours">{item.colours}</Fact>
            <Fact label="Not cut in">
              {item.out.length ? item.out.join(", ") : "Every size"}
            </Fact>
            <Fact label="Last updated">{formatDate(item.updated)}</Fact>
            <Fact label="Share of stock value">
              {percent(available(item) * item.price, 1)}
            </Fact>
          </dl>

          <Link
            href={`/admin/inventory?q=${item.sku}`}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-5 w-full")}
          >
            <Package strokeWidth={1.7} />
            Adjust stock
          </Link>
        </AdminPanel>
      </div>

      <ProductDialog
        open={editing}
        onOpenChange={setEditing}
        product={item}
      />
    </div>
  );
}

function Back() {
  return (
    <Link
      href="/admin/products"
      className="-mx-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-foreground/55 transition-colors duration-(--admin-fast) hover:bg-muted hover:text-accent-2 sm:mx-0 sm:h-auto sm:px-0 sm:hover:bg-transparent"
    >
      <ChevronLeft className="size-3.5" strokeWidth={1.7} />
      Products
    </Link>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.08em] text-foreground/45 uppercase">{label}</dt>
      <dd className="mt-0.5 text-[13.5px] leading-[20px] text-foreground/80">{children}</dd>
    </div>
  );
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <TableHead
      className={cn(
        "px-2 text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase",
        className
      )}
    >
      {children}
    </TableHead>
  );
}
