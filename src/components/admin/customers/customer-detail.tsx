"use client";

import { ChevronLeft, Mail, MapPin, Pencil, Phone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { AdminCard, AdminCardList } from "@/components/admin/admin-card-list";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { CustomerDialog } from "@/components/admin/customers/customer-dialog";
import { GroupPill } from "@/components/admin/customers/group-pill";
import { StatusDot } from "@/components/admin/status-dot";
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
import { averageOrder, groupFor } from "@/lib/admin/customers";
import { ORDER_TONE, ordersForCustomer, type Order } from "@/lib/admin/orders";
import { useCustomerStore } from "@/lib/admin/customers-store";
import { formatDate, money, timeAgo } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/**
 * One customer, and everything the studio knows about them. The order history
 * is worked out from their totals rather than stored, so it always adds up to
 * the spend shown beside it.
 */
export function CustomerDetail() {
  const params = useParams<{ id: string }>();
  const customer = useCustomerStore((s) =>
    s.customers.find((entry) => entry.id === params.id)
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const orders = useMemo(() => (customer ? ordersForCustomer(customer) : []), [customer]);
  // Newest first on the page; `orders` stays oldest-first so the running
  // totals in ordersFor read in the order they happened.
  const history = useMemo(() => [...orders].reverse(), [orders]);

  if (!customer) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        <Back />
        <div className="mt-6 rounded-lg border border-dashed border-border bg-admin-surface px-6 py-16 text-center">
          <p className="text-[15px] font-medium">No customer by that id.</p>
          <p className="mx-auto mt-1.5 max-w-[46ch] text-[13.5px] leading-[22px] text-foreground/58">
            The book is held in the page, so a reload puts it back to the
            forty-two it starts with — anything added since is gone.
          </p>
        </div>
      </div>
    );
  }

  const last = orders[orders.length - 1];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <Back />

      <header className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar name={customer.name} className="size-12 text-[15px]" />
          <div className="min-w-0">
            <h1 className="truncate text-[26px] leading-tight font-semibold tracking-[-0.015em] sm:text-[30px]">
              {customer.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <GroupPill group={groupFor(customer)} />
              <StatusDot status={customer.status} />
              <span className="text-[12.5px] text-foreground/50">
                Customer since {formatDate(customer.joined)}
              </span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="lg" onClick={() => setDialogOpen(true)}>
          <Pencil strokeWidth={1.7} />
          Edit details
        </Button>
      </header>

      <AdminStatRow cols={4}>
        <AdminStatCard
          label="Orders"
          value={customer.orders}
          detail={customer.orders ? "All time" : "Nothing yet"}
        />
        <AdminStatCard
          label="Total spent"
          value={money(customer.spent)}
          detail="All time"
        />
        <AdminStatCard
          label="Average order"
          value={money(averageOrder(customer))}
          detail={customer.orders ? `Across ${customer.orders} orders` : "No orders yet"}
        />
        <AdminStatCard
          label="Last order"
          value={last ? timeAgo(`${last.placed}T12:00:00Z`) : "—"}
          detail={last ? `Order ${last.no}` : "Nothing on the bench"}
          tone={last ? "default" : "muted"}
        />
      </AdminStatRow>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <section className="rounded-lg border border-border bg-admin-surface p-5">
          <h2 className="text-[14px] font-semibold">Contact</h2>
          <dl className="mt-4 grid gap-4">
            <Detail icon={Mail} label="Email">
              <a
                href={`mailto:${customer.email}`}
                className="-my-1.5 inline-block break-all rounded-md py-1.5 transition-colors hover:text-accent-2 sm:my-0 sm:py-0"
              >
                {customer.email}
              </a>
            </Detail>
            <Detail icon={Phone} label="Phone">
              <a
                href={`tel:${customer.phone.replace(/\s/g, "")}`}
                className="-my-1.5 inline-block rounded-md py-1.5 transition-colors hover:text-accent-2 font-feature-tnum sm:my-0 sm:py-0"
              >
                {customer.phone}
              </a>
            </Detail>
            <Detail icon={MapPin} label="Where">
              {customer.city}, {customer.state}
            </Detail>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-admin-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-[14px] font-semibold">Order history</h2>
            <p className="text-[12.5px] text-foreground/55 font-feature-tnum">
              {orders.length} {orders.length === 1 ? "order" : "orders"} ·{" "}
              {money(customer.spent)}
            </p>
          </header>

          {orders.length === 0 ? (
            <p className="px-5 py-14 text-center text-[13.5px] text-foreground/55">
              Nothing ordered yet.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <Table containerClassName="admin-table-scroll">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <Th className="pl-5">Order</Th>
                      <Th>Placed</Th>
                      <Th>Pieces</Th>
                      <Th>Status</Th>
                      <Th className="pr-5 text-right">Total</Th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((order) => (
                      <TableRow key={order.no}>
                        <TableCell className="py-3 pl-5 font-admin-mono text-[12.5px]">
                          {order.no}
                        </TableCell>
                        <TableCell className="text-[13px] text-foreground/70">
                          {formatDate(order.placed)}
                        </TableCell>
                        <TableCell className="text-[13px] text-foreground/70">
                          {describe(order)}
                        </TableCell>
                        <TableCell>
                          <OrderStatus status={order.status} />
                        </TableCell>
                        <TableCell className="pr-5 text-right text-[13px] font-medium font-feature-tnum">
                          {money(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <AdminCardList>
                {history.map((order) => (
                  <AdminCard
                    key={order.no}
                    title={<span className="font-admin-mono text-[13px]">{order.no}</span>}
                    subtitle={formatDate(order.placed)}
                    badges={<OrderStatus status={order.status} />}
                    fields={[
                      { label: "Pieces", value: describe(order), wide: true },
                      { label: "Total", value: money(order.total) },
                    ]}
                  />
                ))}
              </AdminCardList>
            </>
          )}
        </section>
      </div>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={customer}
      />
    </div>
  );
}

function Back() {
  return (
    <Link
      href="/admin/customers"
      className="-mx-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[12.5px] text-foreground/55 transition-colors duration-(--admin-fast) hover:bg-muted hover:text-accent-2 sm:mx-0 sm:h-auto sm:px-0 sm:hover:bg-transparent"
    >
      <ChevronLeft className="size-3.5" strokeWidth={1.7} />
      Customers
    </Link>
  );
}

function OrderStatus({ status }: { status: Order["status"] }) {
  return <StatusPill tone={ORDER_TONE[status]}>{status}</StatusPill>;
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-foreground/40" strokeWidth={1.6} />
      <div className="min-w-0">
        <dt className="text-[11px] tracking-[0.08em] text-foreground/45 uppercase">
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
      className={cn(
        "px-2 text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase",
        className
      )}
    >
      {children}
    </TableHead>
  );
}

/** "The Ash Overshirt + 1 more" — what the box held, in one line. */
function describe(order: Order) {
  const [first, ...rest] = order.lines;
  if (!first) return "—";
  return rest.length ? `${first.name} + ${rest.length} more` : first.name;
}
