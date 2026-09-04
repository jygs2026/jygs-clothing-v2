"use client";

import { ChevronLeft, MapPin, Printer, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AdminPanel, AdminPanelHeader } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { UserAvatar } from "@/components/admin/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, money, timeAgo } from "@/lib/admin/format";
import { ORDERS_BY_NO, ORDER_TONE, PAYMENT_TONE } from "@/lib/admin/orders";
import { useSettingsStore } from "@/lib/admin/settings-store";

/**
 * One order, and the line the studio needs before it can act on it: who it is
 * for, what is in it, and what the money did. The totals are worked back out
 * from the lines, so the page can never show a sum its own rows disagree with.
 */
export function OrderDetail() {
  const params = useParams<{ no: string }>();
  const order = ORDERS_BY_NO.get(decodeURIComponent(params.no));
  const settings = useSettingsStore((s) => s.settings);

  if (!order) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        <Back />
        <div className="mt-6 rounded-lg border border-dashed border-border bg-admin-surface px-6 py-16 text-center">
          <p className="text-[15px] font-medium">No order by that number.</p>
          <p className="mx-auto mt-1.5 max-w-[46ch] text-[13.5px] leading-[22px] text-foreground/58">
            Check the number, or go back and find it in the list.
          </p>
        </div>
      </div>
    );
  }

  const goods = order.lines.reduce((sum, line) => sum + line.qty * line.unit, 0);
  const shipping = goods >= settings.freeShippingOver ? 0 : settings.standardShipping;
  // Prices are shown tax-inclusive, so tax is carved out of the total rather
  // than added to it — printing it the other way would overstate the order.
  const tax = settings.pricesIncludeTax
    ? Math.round(goods - goods / (1 + settings.taxPercent / 100))
    : Math.round(goods * (settings.taxPercent / 100));

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <Back />

      <header className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="font-admin-mono text-[24px] leading-tight font-semibold sm:text-[28px]">
            {order.no}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <StatusPill tone={ORDER_TONE[order.status]}>{order.status}</StatusPill>
            <StatusPill tone={PAYMENT_TONE[order.payment]}>{order.payment}</StatusPill>
            <span className="text-[12.5px] text-foreground/55">
              Placed {formatDate(order.placed)} · {timeAgo(`${order.placed}T12:00:00Z`)}
            </span>
          </div>
        </div>

        <Button variant="outline" size="lg" onClick={() => window.print()}>
          <Printer strokeWidth={1.7} />
          Print
        </Button>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminStatCard
          label="Items"
          value={order.items}
          detail={`${order.lines.length} line${order.lines.length === 1 ? "" : "s"}`}
        />
        <AdminStatCard label="Goods" value={money(goods)} detail="Before shipping" />
        <AdminStatCard
          label="Shipping"
          value={shipping ? money(shipping) : "Free"}
          detail={shipping ? "Standard" : `Over ${money(settings.freeShippingOver)}`}
        />
        <AdminStatCard
          label="Total"
          value={money(order.total)}
          detail={`Includes ${money(tax)} tax`}
        />
      </div>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <AdminPanel>
          <AdminPanelHeader title="What was in the box" detail={`${order.items} pieces`} />

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <Th className="pl-5">Piece</Th>
                  <Th>SKU</Th>
                  <Th>Size</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Unit</Th>
                  <Th className="pr-5 text-right">Line</Th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.lines.map((line, i) => (
                  <TableRow key={`${line.productId}-${i}`}>
                    <TableCell className="py-3 pl-5 text-[13px] font-medium">
                      <Link
                        href={`/admin/products/${line.productId}`}
                        className="hover:text-accent-2"
                      >
                        {line.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-admin-mono text-[12px] text-foreground/60">
                      {line.sku}
                    </TableCell>
                    <TableCell className="text-[13px] text-foreground/70">{line.size}</TableCell>
                    <TableCell className="text-right text-[13px] font-feature-tnum">
                      {line.qty}
                    </TableCell>
                    <TableCell className="text-right text-[13px] text-foreground/70 font-feature-tnum">
                      {money(line.unit)}
                    </TableCell>
                    <TableCell className="pr-5 text-right text-[13px] font-medium font-feature-tnum">
                      {money(line.qty * line.unit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="divide-y divide-border md:hidden">
            {order.lines.map((line, i) => (
              <li key={`${line.productId}-${i}`} className="px-4 py-3.5">
                <p className="text-[14px] font-medium">{line.name}</p>
                <p className="mt-0.5 font-admin-mono text-[11.5px] text-foreground/50">
                  {line.sku}
                </p>
                <p className="mt-2 flex items-center justify-between text-[13px] text-foreground/70">
                  <span>
                    Size {line.size} · {line.qty} × {money(line.unit)}
                  </span>
                  <span className="font-medium text-foreground font-feature-tnum">
                    {money(line.qty * line.unit)}
                  </span>
                </p>
              </li>
            ))}
          </ul>

          <dl className="border-t border-border px-5 py-4 text-[13px]">
            <Row label="Goods" value={money(goods)} />
            <Row label="Shipping" value={shipping ? money(shipping) : "Free"} />
            <Row label={`Tax (${settings.taxPercent}%, included)`} value={money(tax)} muted />
            <Row label="Total" value={money(order.total)} strong />
          </dl>
        </AdminPanel>

        <AdminPanel className="p-5">
          <h2 className="text-[14px] font-semibold">Customer</h2>
          <Link
            href={`/admin/customers/${order.customerId}`}
            className="mt-3.5 flex items-center gap-3 hover:text-accent-2"
          >
            <UserAvatar name={order.customerName} />
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-medium">
                {order.customerName}
              </span>
              <span className="block truncate text-[12px] text-foreground/50">
                See every order
              </span>
            </span>
          </Link>

          <dl className="mt-4 grid gap-3.5 border-t border-border pt-4">
            <Detail icon={MapPin} label="Ships to">
              {order.city}, {order.state}
            </Detail>
            <Detail icon={User} label="Came in through">
              {order.channel}
            </Detail>
          </dl>
        </AdminPanel>
      </div>
    </div>
  );
}

function Back() {
  return (
    <Link
      href="/admin/orders"
      className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/55 transition-colors hover:text-accent-2"
    >
      <ChevronLeft className="size-3.5" strokeWidth={1.7} />
      Orders
    </Link>
  );
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={
        strong
          ? "mt-2 flex items-center justify-between border-t border-border pt-2.5 text-[14px] font-semibold"
          : "flex items-center justify-between py-1"
      }
    >
      <dt className={muted ? "text-foreground/50" : "text-foreground/70"}>{label}</dt>
      <dd className={muted ? "text-foreground/50 font-feature-tnum" : "font-feature-tnum"}>
        {value}
      </dd>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground/40" strokeWidth={1.6} />
      <div className="min-w-0">
        <dt className="text-[10.5px] tracking-[0.08em] text-foreground/45 uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-[13.5px] text-foreground/80">{children}</dd>
      </div>
    </div>
  );
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <TableHead
      className={`px-2 text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase ${className ?? ""}`}
    >
      {children}
    </TableHead>
  );
}
