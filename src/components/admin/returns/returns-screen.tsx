"use client";

import { Check, Download, MoreVertical, Undo2, X } from "lucide-react";
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
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { count, money, percent, timeAgo } from "@/lib/admin/format";
import { ALL_ORDERS } from "@/lib/admin/orders";
import {
  ALL_RETURNS,
  RETURN_REASONS,
  RETURN_STAGES,
  RETURN_TONE,
  isOpen,
  type Return,
} from "@/lib/admin/returns";
import { byNumber, searchAcross, useAdminTable } from "@/lib/admin/table";

const CONDITION_TONE = {
  "As new": "good",
  "Worn once": "info",
  Marked: "warn",
  "Not resellable": "bad",
} as const;

export function ReturnsScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const stats = useMemo(() => {
    const open = ALL_RETURNS.filter(isOpen);
    const refunded = ALL_RETURNS.filter((entry) => entry.stage === "Refunded");
    const refundedValue = refunded.reduce((sum, entry) => sum + entry.amount, 0);
    const sold = ALL_ORDERS.length;
    return {
      total: ALL_RETURNS.length,
      open: open.length,
      refunded: refunded.length,
      refundedValue,
      rate: sold ? (ALL_RETURNS.length / sold) * 100 : 0,
      resellable: ALL_RETURNS.filter((entry) => entry.condition === "As new").length,
    };
  }, []);

  const table = useAdminTable<Return>({
    rows: ALL_RETURNS,
    id: (row) => row.id,
    initialQuery,
    search: useMemo(
      () =>
        searchAcross<Return>(
          (row) => row.id,
          (row) => row.orderNo,
          (row) => row.customerName,
          (row) => row.piece
        ),
      []
    ),
    filters: useMemo(
      () => [
        {
          key: "stage",
          label: "All stages",
          options: RETURN_STAGES.map((s) => ({ value: s, label: s })),
          match: (row: Return, value: string) => row.stage === value,
        },
        {
          key: "reason",
          label: "All reasons",
          options: RETURN_REASONS.map((r) => ({ value: r, label: r })),
          match: (row: Return, value: string) => row.reason === value,
        },
        {
          key: "open",
          label: "Open and settled",
          options: [
            { value: "open", label: "Still open" },
            { value: "settled", label: "Settled" },
          ],
          match: (row: Return, value: string) =>
            value === "open" ? isOpen(row) : !isOpen(row),
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "newest",
          label: "Newest first",
          compare: (a: Return, b: Return) => b.opened.localeCompare(a.opened),
        },
        {
          value: "oldest",
          label: "Longest waiting",
          compare: (a: Return, b: Return) => a.opened.localeCompare(b.opened),
        },
        {
          value: "largest",
          label: "Largest refund",
          compare: byNumber<Return>((row) => row.amount).high,
        },
      ],
      []
    ),
  });

  const columns = useMemo<Column<Return>[]>(
    () => [
      {
        key: "id",
        header: "Return",
        className: "font-admin-mono text-[12.5px]",
        csv: (row) => row.id,
        cell: (row) => row.id,
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
              <Link
                href={`/admin/orders/${row.orderNo}`}
                className="block truncate font-admin-mono text-[11.5px] text-foreground/50 hover:text-accent-2"
              >
                {row.orderNo}
              </Link>
            </div>
          </div>
        ),
      },
      {
        key: "piece",
        header: "Piece",
        hideBelow: "lg",
        className: "text-foreground/70",
        csv: (row) => `${row.piece} (${row.size})`,
        cell: (row) => (
          <span className="line-clamp-1">
            {row.piece} <span className="text-foreground/45">· {row.size}</span>
          </span>
        ),
      },
      {
        key: "reason",
        header: "Reason",
        className: "text-foreground/70",
        csv: (row) => row.reason,
        cell: (row) => row.reason,
      },
      {
        key: "condition",
        header: "Condition",
        hideBelow: "xl",
        csv: (row) => row.condition,
        cell: (row) => (
          <StatusPill tone={CONDITION_TONE[row.condition]}>{row.condition}</StatusPill>
        ),
      },
      {
        key: "amount",
        header: "Refund",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.amount,
        cell: (row) => money(row.amount),
      },
      {
        key: "stage",
        header: "Stage",
        csv: (row) => row.stage,
        cell: (row) => <StatusPill tone={RETURN_TONE[row.stage]}>{row.stage}</StatusPill>,
      },
      {
        key: "opened",
        header: "Opened",
        hideBelow: "lg",
        className: "text-foreground/62",
        csv: (row) => row.opened,
        cell: (row) => timeAgo(`${row.opened}T12:00:00Z`),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Returns"
        blurb="Pieces coming back: the reason given, the condition found and what was refunded."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-returns.csv", toCsv(columns, table.matched));
            toast(`${table.total} returns exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard label="All returns" value={count(stats.total)} detail="Since the studio opened" />
        <AdminStatCard
          label="Still open"
          value={count(stats.open)}
          tone={stats.open ? "warning" : "muted"}
          detail="Waiting on the studio"
        />
        <AdminStatCard label="Refunded" value={count(stats.refunded)} detail={`${percent(stats.refunded, stats.total)} of returns`} />
        <AdminStatCard label="Given back" value={money(stats.refundedValue)} detail="All time" />
        <AdminStatCard
          label="Return rate"
          value={`${stats.rate.toFixed(1)}%`}
          tone={stats.rate > 8 ? "warning" : "positive"}
          detail="Of every order placed"
        />
        <AdminStatCard
          label="Back as new"
          value={count(stats.resellable)}
          tone="positive"
          detail="Can go back on the shelf"
        />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar table={table} placeholder="Search returns…" />
        <DataTable
          table={table}
          columns={columns}
          noun="returns"
          empty="No returns match that."
          card={{
            lead: (row) => <UserAvatar name={row.customerName} className="size-9 text-[11px]" />,
            title: (row) => row.customerName,
            subtitle: (row) => (
              <span className="font-admin-mono">
                {row.id} · {row.orderNo}
              </span>
            ),
            badges: (row) => (
              <>
                <StatusPill tone={RETURN_TONE[row.stage]}>{row.stage}</StatusPill>
                <StatusPill tone={CONDITION_TONE[row.condition]}>{row.condition}</StatusPill>
              </>
            ),
            fields: ["piece", "reason", "amount", "opened"],
            wide: ["piece"],
          }}
          actions={(row) => (
            <Menu>
              <MenuTrigger
                aria-label={`More for ${row.id}`}
                className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
              >
                <MoreVertical className="size-3.5" strokeWidth={1.7} />
              </MenuTrigger>
              <MenuContent className="font-admin">
                <MenuLinkItem render={<Link href={`/admin/orders/${row.orderNo}`} />}>
                  <Undo2 strokeWidth={1.5} />
                  Open the order
                </MenuLinkItem>
                <MenuSeparator />
                <MenuItem
                  disabled={!isOpen(row)}
                  onClick={() => toast(`${row.id} — approvals are not wired up.`)}
                >
                  <Check strokeWidth={1.5} />
                  Approve and refund {money(row.amount)}
                </MenuItem>
                <MenuItem
                  disabled={!isOpen(row)}
                  onClick={() => toast(`${row.id} — rejections are not wired up.`)}
                  className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive data-highlighted:[&_svg]:text-destructive"
                >
                  <X strokeWidth={1.5} />
                  Reject the return
                </MenuItem>
              </MenuContent>
            </Menu>
          )}
        />
      </AdminPanel>
    </div>
  );
}
