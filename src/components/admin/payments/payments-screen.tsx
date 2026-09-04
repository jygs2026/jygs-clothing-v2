"use client";

import { Download } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminSectionTabs } from "@/components/admin/admin-section-tabs";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { Button } from "@/components/ui/button";
import { count, formatDate, money, moneyShort, percent } from "@/lib/admin/format";
import {
  ALL_PAYMENTS,
  ALL_PAYOUTS,
  METHODS,
  PAYMENT_STATES,
  PAYMENT_STATE_TONE,
  PAYOUT_TONE,
  type Payment,
  type Payout,
} from "@/lib/admin/payments";
import { byNumber, searchAcross, useAdminTable } from "@/lib/admin/table";

/**
 * Money in and money out. Two lists rather than one, because they answer
 * different questions — "did this order's money arrive" and "did the week's
 * takings reach the bank" — and a single table trying to do both would answer
 * neither well.
 */
export function PaymentsScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";
  const [view, setView] = useState<"payments" | "payouts">("payments");

  const stats = useMemo(() => {
    const captured = ALL_PAYMENTS.filter((p) => p.state === "Captured");
    const gross = captured.reduce((sum, p) => sum + p.gross, 0);
    const fees = captured.reduce((sum, p) => sum + p.fee, 0);
    const refunded = ALL_PAYMENTS.filter((p) => p.state === "Refunded")
      .reduce((sum, p) => sum + p.gross, 0);
    return {
      gross,
      fees,
      refunded,
      net: gross - fees - refunded,
      failed: ALL_PAYMENTS.filter((p) => p.state === "Failed").length,
      pending: ALL_PAYMENTS.filter((p) => p.state === "Pending").length,
      captured: captured.length,
    };
  }, []);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Payments"
        blurb="Takings, refunds and payouts, reconciled against what the orders say."
      />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <AdminStatCard label="Taken" value={moneyShort(stats.gross)} detail={`${count(stats.captured)} captured payments`} />
        <AdminStatCard label="Gateway fees" value={moneyShort(stats.fees)} tone="warning" detail={`${percent(stats.fees, stats.gross)} of takings`} />
        <AdminStatCard label="Refunded" value={moneyShort(stats.refunded)} detail="Given back" />
        <AdminStatCard label="Net" value={moneyShort(stats.net)} tone="positive" detail="What the studio keeps" />
        <AdminStatCard
          label="Pending"
          value={count(stats.pending)}
          tone={stats.pending ? "warning" : "muted"}
          detail="Not captured yet"
        />
        <AdminStatCard
          label="Failed"
          value={count(stats.failed)}
          tone={stats.failed ? "warning" : "muted"}
          detail="Worth chasing"
        />
      </div>

      <div className="mt-6">
        <AdminSectionTabs
          tabs={[
            { href: "#payments", label: "Payments", count: ALL_PAYMENTS.length },
            { href: "#payouts", label: "Payouts", count: ALL_PAYOUTS.length },
          ]}
          active={view === "payments" ? "#payments" : "#payouts"}
          onSelect={(href) => setView(href === "#payments" ? "payments" : "payouts")}
        />
      </div>

      {view === "payments" ? (
        <PaymentsTable initialQuery={initialQuery} />
      ) : (
        <PayoutsTable />
      )}
    </div>
  );
}

function PaymentsTable({ initialQuery }: { initialQuery: string }) {
  const table = useAdminTable<Payment>({
    rows: ALL_PAYMENTS,
    id: (row) => row.id,
    initialQuery,
    initialPerPage: 25,
    search: useMemo(
      () =>
        searchAcross<Payment>(
          (row) => row.id,
          (row) => row.orderNo,
          (row) => row.customerName,
          (row) => row.method
        ),
      []
    ),
    filters: useMemo(
      () => [
        {
          key: "state",
          label: "All states",
          options: PAYMENT_STATES.map((s) => ({ value: s, label: s })),
          match: (row: Payment, value: string) => row.state === value,
        },
        {
          key: "method",
          label: "All methods",
          options: METHODS.map((m) => ({ value: m, label: m })),
          match: (row: Payment, value: string) => row.method === value,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "newest",
          label: "Newest first",
          compare: (a: Payment, b: Payment) => b.at.localeCompare(a.at),
        },
        {
          value: "largest",
          label: "Largest first",
          compare: byNumber<Payment>((row) => row.gross).high,
        },
      ],
      []
    ),
  });

  const columns = useMemo<Column<Payment>[]>(
    () => [
      {
        key: "id",
        header: "Payment",
        className: "font-admin-mono text-[12.5px]",
        csv: (row) => row.id,
        cell: (row) => row.id,
      },
      {
        key: "order",
        header: "Order",
        csv: (row) => row.orderNo,
        cell: (row) => (
          <div className="min-w-0">
            <Link
              href={`/admin/orders/${row.orderNo}`}
              className="block truncate font-admin-mono text-[12.5px] hover:text-accent-2"
            >
              {row.orderNo}
            </Link>
            <Link
              href={`/admin/customers/${row.customerId}`}
              className="block truncate text-[12px] text-foreground/55 hover:text-accent-2"
            >
              {row.customerName}
            </Link>
          </div>
        ),
      },
      {
        key: "method",
        header: "Method",
        className: "text-foreground/70",
        csv: (row) => row.method,
        cell: (row) => row.method,
      },
      {
        key: "gross",
        header: "Gross",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.gross,
        cell: (row) => money(row.gross),
      },
      {
        key: "fee",
        header: "Fee",
        align: "right",
        hideBelow: "lg",
        className: "text-foreground/60 font-feature-tnum",
        csv: (row) => row.fee,
        cell: (row) => money(row.fee),
      },
      {
        key: "net",
        header: "Net",
        align: "right",
        hideBelow: "xl",
        className: "font-feature-tnum",
        csv: (row) => row.net,
        cell: (row) => (row.net ? money(row.net) : "—"),
      },
      {
        key: "state",
        header: "State",
        csv: (row) => row.state,
        cell: (row) => (
          <StatusPill tone={PAYMENT_STATE_TONE[row.state]}>{row.state}</StatusPill>
        ),
      },
      {
        key: "at",
        header: "Taken",
        hideBelow: "lg",
        className: "text-foreground/62",
        csv: (row) => row.at,
        cell: (row) => formatDate(row.at),
      },
    ],
    []
  );

  return (
    <AdminPanel className="mt-5">
      <TableToolbar table={table} placeholder="Search payments…">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            downloadCsv("jygs-payments.csv", toCsv(columns, table.matched));
            toast(`${table.total} payments exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </TableToolbar>
      <DataTable
        table={table}
        columns={columns}
        noun="payments"
        empty="No payments match that."
        card={{
          title: (row) => <span className="font-admin-mono">{row.orderNo}</span>,
          subtitle: (row) => row.customerName,
          badges: (row) => (
            <>
              <StatusPill tone={PAYMENT_STATE_TONE[row.state]}>{row.state}</StatusPill>
              <StatusPill tone="neutral">{row.method}</StatusPill>
            </>
          ),
          fields: ["gross", "fee", "net", "at"],
        }}
      />
    </AdminPanel>
  );
}

function PayoutsTable() {
  const table = useAdminTable<Payout>({
    rows: ALL_PAYOUTS,
    id: (row) => row.id,
    search: useMemo(() => searchAcross<Payout>((row) => row.week), []),
    sorts: useMemo(
      () => [
        {
          value: "newest",
          label: "Newest first",
          compare: (a: Payout, b: Payout) => b.week.localeCompare(a.week),
        },
        {
          value: "largest",
          label: "Largest first",
          compare: byNumber<Payout>((row) => row.net).high,
        },
      ],
      []
    ),
  });

  const columns = useMemo<Column<Payout>[]>(
    () => [
      {
        key: "week",
        header: "Week beginning",
        className: "font-medium",
        csv: (row) => row.week,
        cell: (row) => formatDate(row.week),
      },
      {
        key: "orders",
        header: "Orders",
        align: "right",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.orders,
        cell: (row) => row.orders,
      },
      {
        key: "gross",
        header: "Gross",
        align: "right",
        className: "font-feature-tnum",
        csv: (row) => row.gross,
        cell: (row) => money(row.gross),
      },
      {
        key: "fees",
        header: "Fees",
        align: "right",
        hideBelow: "lg",
        className: "text-foreground/60 font-feature-tnum",
        csv: (row) => row.fees,
        cell: (row) => money(row.fees),
      },
      {
        key: "refunds",
        header: "Refunds",
        align: "right",
        hideBelow: "lg",
        className: "text-foreground/60 font-feature-tnum",
        csv: (row) => row.refunds,
        cell: (row) => (row.refunds ? money(row.refunds) : "—"),
      },
      {
        key: "net",
        header: "Paid out",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.net,
        cell: (row) => money(row.net),
      },
      {
        key: "state",
        header: "State",
        csv: (row) => row.state,
        cell: (row) => <StatusPill tone={PAYOUT_TONE[row.state]}>{row.state}</StatusPill>,
      },
    ],
    []
  );

  return (
    <AdminPanel className="mt-5">
      <TableToolbar table={table} placeholder="Search payouts…">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            downloadCsv("jygs-payouts.csv", toCsv(columns, table.matched));
            toast(`${table.total} payouts exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </TableToolbar>
      <DataTable
        table={table}
        columns={columns}
        noun="payouts"
        empty="No payouts match that."
        card={{
          title: (row) => formatDate(row.week),
          subtitle: (row) => `${row.orders} orders`,
          badges: (row) => <StatusPill tone={PAYOUT_TONE[row.state]}>{row.state}</StatusPill>,
          fields: ["gross", "fees", "refunds", "net"],
        }}
      />
    </AdminPanel>
  );
}
