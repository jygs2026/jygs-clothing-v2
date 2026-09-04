"use client";

import { Download, Eye, MoreVertical, Package, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { StatusPill } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { UserAvatar } from "@/components/admin/user-avatar";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuTrigger } from "@/components/ui/menu";
import { count, formatDate, money, moneyShort, percent } from "@/lib/admin/format";
import {
  ALL_ORDERS,
  CHANNELS,
  ORDER_STATUSES,
  ORDER_TONE,
  PAYMENT_STATUSES,
  PAYMENT_TONE,
  describeLines,
  revenueOf,
  type Order,
} from "@/lib/admin/orders";
import { byNumber, searchAcross, useAdminTable } from "@/lib/admin/table";

export function OrdersScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const stats = useMemo(() => {
    const open = ALL_ORDERS.filter(
      (o) => o.status === "Placed" || o.status === "Being cut" || o.status === "In transit"
    );
    const delivered = ALL_ORDERS.filter((o) => o.status === "Delivered");
    const revenue = revenueOf(ALL_ORDERS);
    return {
      total: ALL_ORDERS.length,
      open: open.length,
      delivered: delivered.length,
      unpaid: ALL_ORDERS.filter((o) => o.payment === "Pending" || o.payment === "Failed").length,
      revenue,
      average: ALL_ORDERS.length ? Math.round(revenue / ALL_ORDERS.length) : 0,
    };
  }, []);

  const table = useAdminTable<Order>({
    rows: ALL_ORDERS,
    id: (row) => row.no,
    initialQuery,
    initialPerPage: 25,
    search: useMemo(
      () =>
        searchAcross<Order>(
          (row) => row.no,
          (row) => row.customerName,
          (row) => row.city,
          (row) => row.lines.map((line) => line.name).join(" ")
        ),
      []
    ),
    filters: useMemo(
      () => [
        {
          key: "status",
          label: "All statuses",
          options: ORDER_STATUSES.map((s) => ({ value: s, label: s })),
          match: (row: Order, value: string) => row.status === value,
        },
        {
          key: "payment",
          label: "All payments",
          options: PAYMENT_STATUSES.map((s) => ({ value: s, label: s })),
          match: (row: Order, value: string) => row.payment === value,
        },
        {
          key: "channel",
          label: "All channels",
          options: CHANNELS.map((c) => ({ value: c, label: c })),
          match: (row: Order, value: string) => row.channel === value,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        { value: "newest", label: "Newest first", compare: (a: Order, b: Order) => b.placed.localeCompare(a.placed) },
        { value: "oldest", label: "Oldest first", compare: (a: Order, b: Order) => a.placed.localeCompare(b.placed) },
        { value: "largest", label: "Largest first", compare: byNumber<Order>((row) => row.total).high },
        { value: "smallest", label: "Smallest first", compare: byNumber<Order>((row) => row.total).low },
      ],
      []
    ),
  });

  const columns = useMemo<Column<Order>[]>(
    () => [
      {
        key: "no",
        header: "Order",
        className: "font-admin-mono text-[12.5px]",
        csv: (row) => row.no,
        cell: (row) => (
          <Link href={`/admin/orders/${row.no}`} className="hover:text-accent-2">
            {row.no}
          </Link>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        csv: (row) => row.customerName,
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <UserAvatar name={row.customerName} className="size-7 text-[10px]" />
            <div className="min-w-0">
              <Link
                href={`/admin/customers/${row.customerId}`}
                className="block truncate font-medium hover:text-accent-2"
              >
                {row.customerName}
              </Link>
              <p className="truncate text-[12px] text-foreground/50">
                {row.city}, {row.state}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "pieces",
        header: "Pieces",
        hideBelow: "xl",
        className: "text-foreground/70",
        csv: (row) => describeLines(row),
        cell: (row) => <span className="line-clamp-1">{describeLines(row)}</span>,
      },
      {
        key: "items",
        header: "Items",
        align: "right",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.items,
        cell: (row) => row.items,
      },
      {
        key: "total",
        header: "Total",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.total,
        cell: (row) => money(row.total),
      },
      {
        key: "status",
        header: "Status",
        csv: (row) => row.status,
        cell: (row) => <StatusPill tone={ORDER_TONE[row.status]}>{row.status}</StatusPill>,
      },
      {
        key: "payment",
        header: "Payment",
        hideBelow: "lg",
        csv: (row) => row.payment,
        cell: (row) => <StatusPill tone={PAYMENT_TONE[row.payment]}>{row.payment}</StatusPill>,
      },
      {
        key: "placed",
        header: "Placed",
        hideBelow: "lg",
        className: "text-foreground/62",
        csv: (row) => row.placed,
        cell: (row) => formatDate(row.placed),
      },
      {
        key: "channel",
        header: "Channel",
        hideBelow: "xl",
        className: "text-foreground/62",
        csv: (row) => row.channel,
        cell: (row) => row.channel,
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Orders"
        blurb="Every order from placed to delivered, with the ones waiting on the bench first."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-orders.csv", toCsv(columns, table.matched));
            toast(`${table.total} orders exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard label="All orders" value={count(stats.total)} detail="Since the studio opened" />
        <AdminStatCard label="On the bench" value={count(stats.open)} tone="warning" detail="Placed, being cut or moving" />
        <AdminStatCard label="Delivered" value={count(stats.delivered)} tone="positive" detail={`${percent(stats.delivered, stats.total)} of all orders`} />
        <AdminStatCard label="Needs payment" value={count(stats.unpaid)} tone={stats.unpaid ? "warning" : "muted"} detail="Pending or failed" />
        <AdminStatCard label="Revenue" value={moneyShort(stats.revenue)} detail="Paid orders only" />
        <AdminStatCard label="Average order" value={money(stats.average)} detail="Across every order" />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar table={table} placeholder="Search orders…" />
        <DataTable
          table={table}
          columns={columns}
          noun="orders"
          empty="No orders match that. Try a different status, channel or name."
          rowHref={(row) => `/admin/orders/${row.no}`}
          card={{
            lead: (row) => <UserAvatar name={row.customerName} className="size-9 text-[11px]" />,
            title: (row) => row.customerName,
            subtitle: (row) => (
              <span className="font-admin-mono">
                {row.no} · {formatDate(row.placed)}
              </span>
            ),
            badges: (row) => (
              <>
                <StatusPill tone={ORDER_TONE[row.status]}>{row.status}</StatusPill>
                <StatusPill tone={PAYMENT_TONE[row.payment]}>{row.payment}</StatusPill>
              </>
            ),
            fields: ["items", "total", "pieces", "channel"],
            wide: ["pieces"],
          }}
          actions={(row) => (
            <>
              <Link
                href={`/admin/orders/${row.no}`}
                aria-label={`Open ${row.no}`}
                className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Eye className="size-3.5" strokeWidth={1.7} />
              </Link>
              <Menu>
                <MenuTrigger
                  aria-label={`More for ${row.no}`}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
                >
                  <MoreVertical className="size-3.5" strokeWidth={1.7} />
                </MenuTrigger>
                <MenuContent className="font-admin">
                  <MenuLinkItem render={<Link href={`/admin/orders/${row.no}`} />}>
                    <Eye strokeWidth={1.5} />
                    Open order
                  </MenuLinkItem>
                  <MenuLinkItem render={<Link href={`/admin/customers/${row.customerId}`} />}>
                    <Package strokeWidth={1.5} />
                    See the customer
                  </MenuLinkItem>
                  <MenuItem onClick={() => toast(`${row.no} is not editable in the mock.`)}>
                    <Truck strokeWidth={1.5} />
                    Mark dispatched
                  </MenuItem>
                  <MenuItem onClick={() => toast(`${row.no} is not editable in the mock.`)}>
                    <XCircle strokeWidth={1.5} />
                    Cancel order
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
