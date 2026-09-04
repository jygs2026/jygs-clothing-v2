"use client";

import { Download } from "lucide-react";
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
import { count, formatMoment, timeAgo } from "@/lib/admin/format";
import {
  ALL_LOGS,
  LOG_AREAS,
  LOG_LEVELS,
  LOG_TONE,
  type LogEntry,
} from "@/lib/admin/logs";
import { searchAcross, useAdminTable } from "@/lib/admin/table";

/**
 * What changed in the studio, by whom and when. Read-only on purpose: a log
 * somebody can edit is not a log, and the one thing this screen has to be is
 * trustworthy.
 */
export function LogsScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const stats = useMemo(() => {
    const day = ALL_LOGS.filter((entry) => timeAgo(entry.at).includes("hour") || timeAgo(entry.at) === "Just now");
    return {
      total: ALL_LOGS.length,
      today: day.length,
      warnings: ALL_LOGS.filter((entry) => entry.level === "Warning").length,
      errors: ALL_LOGS.filter((entry) => entry.level === "Error").length,
      actors: new Set(ALL_LOGS.map((entry) => entry.actor)).size,
      areas: LOG_AREAS.length,
    };
  }, []);

  const table = useAdminTable<LogEntry>({
    rows: ALL_LOGS,
    id: (row) => row.id,
    initialQuery,
    initialPerPage: 25,
    search: useMemo(
      () =>
        searchAcross<LogEntry>(
          (row) => row.actor,
          (row) => row.action,
          (row) => row.subject,
          (row) => row.area,
          (row) => row.ip
        ),
      []
    ),
    filters: useMemo(
      () => [
        {
          key: "level",
          label: "All levels",
          options: LOG_LEVELS.map((l) => ({ value: l, label: l })),
          match: (row: LogEntry, value: string) => row.level === value,
        },
        {
          key: "area",
          label: "All areas",
          options: LOG_AREAS.map((a) => ({ value: a, label: a })),
          match: (row: LogEntry, value: string) => row.area === value,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "newest",
          label: "Newest first",
          compare: (a: LogEntry, b: LogEntry) => b.at.localeCompare(a.at),
        },
        {
          value: "oldest",
          label: "Oldest first",
          compare: (a: LogEntry, b: LogEntry) => a.at.localeCompare(b.at),
        },
      ],
      []
    ),
  });

  const columns = useMemo<Column<LogEntry>[]>(
    () => [
      {
        key: "at",
        header: "When",
        className: "whitespace-nowrap text-foreground/70",
        csv: (row) => row.at,
        cell: (row) => (
          <span title={formatMoment(row.at)}>{timeAgo(row.at)}</span>
        ),
      },
      {
        key: "actor",
        header: "Who",
        csv: (row) => row.actor,
        cell: (row) => (
          <div className="flex items-center gap-2.5">
            <UserAvatar name={row.actor} className="size-7 text-[10px]" />
            <div className="min-w-0">
              <p className="truncate font-medium">{row.actor}</p>
              <p className="truncate text-[12px] text-foreground/50">@{row.actorHandle}</p>
            </div>
          </div>
        ),
      },
      {
        key: "action",
        header: "What",
        className: "text-foreground/80",
        csv: (row) => row.action,
        cell: (row) => row.action,
      },
      {
        key: "subject",
        header: "On",
        hideBelow: "lg",
        className: "font-admin-mono text-[12px] text-foreground/60",
        csv: (row) => row.subject,
        cell: (row) => row.subject,
      },
      {
        key: "area",
        header: "Area",
        hideBelow: "xl",
        className: "text-foreground/62",
        csv: (row) => row.area,
        cell: (row) => row.area,
      },
      {
        key: "level",
        header: "Level",
        csv: (row) => row.level,
        cell: (row) => <StatusPill tone={LOG_TONE[row.level]}>{row.level}</StatusPill>,
      },
      {
        key: "ip",
        header: "From",
        hideBelow: "xl",
        className: "font-admin-mono text-[12px] text-foreground/50",
        csv: (row) => row.ip,
        cell: (row) => row.ip,
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="System Logs"
        blurb="A plain record of what changed in the studio, by whom and when."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-logs.csv", toCsv(columns, table.matched));
            toast(`${table.total} entries exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard label="Entries" value={count(stats.total)} detail="Held in the log" />
        <AdminStatCard label="Last 24 hours" value={count(stats.today)} detail="Recent activity" />
        <AdminStatCard
          label="Warnings"
          value={count(stats.warnings)}
          tone="warning"
          detail="Worth reading"
        />
        <AdminStatCard
          label="Errors"
          value={count(stats.errors)}
          tone={stats.errors ? "warning" : "muted"}
          detail="Something failed"
        />
        <AdminStatCard label="People" value={count(stats.actors)} detail="Acted in the studio" />
        <AdminStatCard label="Areas" value={count(stats.areas)} detail="Parts of the admin" />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar table={table} placeholder="Search the log…" />
        <DataTable
          table={table}
          columns={columns}
          noun="entries"
          empty="Nothing in the log matches that."
          card={{
            lead: (row) => <UserAvatar name={row.actor} className="size-9 text-[11px]" />,
            title: (row) => row.action,
            subtitle: (row) => `${row.actor} · ${timeAgo(row.at)}`,
            badges: (row) => (
              <>
                <StatusPill tone={LOG_TONE[row.level]}>{row.level}</StatusPill>
                <StatusPill tone="neutral">{row.area}</StatusPill>
              </>
            ),
            fields: ["subject", "at", "ip"],
            wide: ["subject"],
          }}
        />
      </AdminPanel>
    </div>
  );
}
