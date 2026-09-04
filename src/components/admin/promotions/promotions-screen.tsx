"use client";

import {
  Copy,
  Download,
  Files,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { PromotionDialog } from "@/components/admin/promotions/promotion-dialog";
import { StatusPill } from "@/components/admin/status-pill";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { count, formatDate, money, percent } from "@/lib/admin/format";
import {
  PROMOTION_KINDS,
  PROMOTION_STATES,
  PROMOTION_TONE,
  offerOf,
  stateOf,
  type Promotion,
} from "@/lib/admin/promotions";
import { usePromotionStore } from "@/lib/admin/promotions-store";
import { byNumber, byText, searchAcross, useAdminTable } from "@/lib/admin/table";
import { cn } from "@/lib/utils";

export function PromotionsScreen() {
  const initialQuery = useSearchParams().get("q") ?? "";

  const promotions = usePromotionStore((s) => s.promotions);
  const duplicatePromotion = usePromotionStore((s) => s.duplicatePromotion);
  const toggleActive = usePromotionStore((s) => s.toggleActive);
  const removePromotions = usePromotionStore((s) => s.removePromotions);
  const replacePromotions = usePromotionStore((s) => s.replacePromotions);

  const [editing, setEditing] = useState<Promotion | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  function openForm(promotion: Promotion | null) {
    setEditing(promotion);
    setFormOpen(true);
  }

  function setRunning(rows: Promotion[], active: boolean) {
    toggleActive(rows.map((row) => row.id), active);
    table.clearSelection();
    toast(
      rows.length === 1
        ? `${rows[0].code} ${active ? "resumed" : "paused"}.`
        : `${rows.length} codes ${active ? "resumed" : "paused"}.`
    );
  }

  function remove(rows: Promotion[]) {
    const before = promotions;
    const what = rows.length === 1 ? rows[0].code : `${rows.length} promotions`;
    removePromotions(rows.map((row) => row.id));
    table.clearSelection();
    toast(`${what} removed.`, {
      action: { label: "Undo", onClick: () => replacePromotions(before) },
    });
  }

  function duplicate(row: Promotion) {
    const copy = duplicatePromotion(row.id);
    if (!copy) return;
    toast(`${copy.code} created from ${row.code}.`, {
      description: "Switched off, with its own count starting at zero.",
      action: { label: "Edit", onClick: () => openForm(copy) },
    });
  }

  const stats = useMemo(() => {
    const running = promotions.filter((p) => stateOf(p) === "Running");
    const redemptions = promotions.reduce((sum, p) => sum + p.used, 0);
    return {
      total: promotions.length,
      running: running.length,
      scheduled: promotions.filter((p) => stateOf(p) === "Scheduled").length,
      redemptions,
      busiest: [...promotions].sort((a, b) => b.used - a.used)[0],
      capped: promotions.filter((p) => p.limit && p.used >= p.limit * 0.8).length,
    };
  }, [promotions]);

  const table = useAdminTable<Promotion>({
    rows: promotions,
    id: (row) => row.id,
    initialQuery,
    search: useMemo(
      () => searchAcross<Promotion>((row) => row.code, (row) => row.name),
      []
    ),
    filters: useMemo(
      () => [
        {
          key: "state",
          label: "All states",
          options: PROMOTION_STATES.map((s) => ({ value: s, label: s })),
          match: (row: Promotion, value: string) => stateOf(row) === value,
        },
        {
          key: "kind",
          label: "All kinds",
          options: PROMOTION_KINDS.map((k) => ({ value: k, label: k })),
          match: (row: Promotion, value: string) => row.kind === value,
        },
      ],
      []
    ),
    sorts: useMemo(
      () => [
        {
          value: "used",
          label: "Most used",
          compare: byNumber<Promotion>((row) => row.used).high,
        },
        {
          value: "ending",
          label: "Ending soonest",
          compare: (a: Promotion, b: Promotion) => a.ends.localeCompare(b.ends),
        },
        { value: "code", label: "Code A–Z", compare: byText<Promotion>((row) => row.code) },
      ],
      []
    ),
  });

  const columns = useMemo<Column<Promotion>[]>(
    () => [
      {
        key: "code",
        header: "Code",
        csv: (row) => row.code,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-admin-mono text-[13px] font-medium">{row.code}</p>
            <p className="truncate text-[12px] text-foreground/50">{row.name}</p>
          </div>
        ),
      },
      {
        key: "offer",
        header: "Offer",
        className: "text-foreground/75",
        csv: (row) => offerOf(row),
        cell: (row) => offerOf(row),
      },
      {
        key: "minimum",
        header: "Minimum",
        align: "right",
        hideBelow: "xl",
        className: "text-foreground/62 font-feature-tnum",
        csv: (row) => row.minimum,
        cell: (row) => (row.minimum ? money(row.minimum) : "None"),
      },
      {
        key: "used",
        header: "Used",
        align: "right",
        csv: (row) => row.used,
        cell: (row) => {
          const share = row.limit ? Math.min((row.used / row.limit) * 100, 100) : 0;
          return (
            <span className="inline-flex flex-col items-end gap-1">
              <span className="font-medium font-feature-tnum">
                {count(row.used)}
                {row.limit ? (
                  <span className="text-foreground/45"> / {count(row.limit)}</span>
                ) : null}
              </span>
              {row.limit ? (
                <span
                  aria-hidden="true"
                  className="block h-1 w-16 overflow-hidden rounded-full bg-muted"
                >
                  <span
                    className={cn(
                      "block h-full rounded-full",
                      share >= 90 ? "bg-amber-500" : "bg-accent"
                    )}
                    style={{ width: `${Math.max(share, 2)}%` }}
                  />
                </span>
              ) : (
                <span className="text-[11px] text-foreground/40">No ceiling</span>
              )}
            </span>
          );
        },
      },
      {
        key: "runs",
        header: "Runs",
        hideBelow: "lg",
        className: "text-foreground/62",
        csv: (row) => `${row.starts} to ${row.ends}`,
        cell: (row) => (
          <span className="whitespace-nowrap">
            {formatDate(row.starts)} — {formatDate(row.ends)}
          </span>
        ),
      },
      {
        key: "state",
        header: "State",
        csv: (row) => stateOf(row),
        cell: (row) => (
          <StatusPill tone={PROMOTION_TONE[stateOf(row)]}>{stateOf(row)}</StatusPill>
        ),
      },
    ],
    []
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Promotions"
        blurb="Codes, launch offers and waitlist releases, with the dates they run."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-promotions.csv", toCsv(columns, table.matched));
            toast(`${table.total} promotions exported.`);
          }}
        >
          <Download strokeWidth={1.7} />
          Export
        </Button>
        <Button size="lg" onClick={() => openForm(null)}>
          <Plus strokeWidth={1.9} />
          Create promotion
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard label="All promotions" value={count(stats.total)} detail="Ever created" />
        <AdminStatCard label="Running" value={count(stats.running)} tone="positive" detail="Live right now" />
        <AdminStatCard label="Scheduled" value={count(stats.scheduled)} detail="Not started yet" />
        <AdminStatCard label="Redemptions" value={count(stats.redemptions)} detail="Across every code" />
        <AdminStatCard
          label="Busiest code"
          value={stats.busiest?.code ?? "—"}
          tone={stats.busiest ? "default" : "muted"}
          detail={stats.busiest ? `${count(stats.busiest.used)} uses` : "Nothing created yet"}
        />
        <AdminStatCard
          label="Near their ceiling"
          value={count(stats.capped)}
          tone={stats.capped ? "warning" : "muted"}
          detail="80% of the limit used"
        />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar
          table={table}
          placeholder="Search promotions…"
          bulk={(rows) => (
            <>
              <Button variant="outline" size="sm" onClick={() => setRunning(rows, true)}>
                <Play strokeWidth={1.7} />
                Resume
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRunning(rows, false)}>
                <Pause strokeWidth={1.7} />
                Pause
              </Button>
              <Button variant="destructive" size="sm" onClick={() => remove(rows)}>
                <Trash2 strokeWidth={1.7} />
                Remove
              </Button>
            </>
          )}
        />
        <DataTable
          table={table}
          columns={columns}
          noun="promotions"
          empty="No promotions match that."
          selectable
          card={{
            title: (row) => <span className="font-admin-mono">{row.code}</span>,
            subtitle: (row) => row.name,
            badges: (row) => (
              <>
                <StatusPill tone={PROMOTION_TONE[stateOf(row)]}>{stateOf(row)}</StatusPill>
                <StatusPill tone="neutral">{offerOf(row)}</StatusPill>
              </>
            ),
            fields: ["used", "minimum", "runs"],
            wide: ["runs"],
          }}
          actions={(row) => (
            <Menu>
              <MenuTrigger
                aria-label={`More for ${row.code}`}
                className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
              >
                <MoreVertical className="size-3.5" strokeWidth={1.7} />
              </MenuTrigger>
              <MenuContent className="font-admin">
                <MenuItem
                  onClick={() => {
                    navigator.clipboard?.writeText(row.code);
                    toast(`${row.code} copied.`);
                  }}
                >
                  <Copy strokeWidth={1.5} />
                  Copy code
                </MenuItem>
                <MenuItem onClick={() => openForm(row)}>
                  <Pencil strokeWidth={1.5} />
                  Edit promotion
                </MenuItem>
                <MenuItem onClick={() => setRunning([row], !row.active)}>
                  {row.active ? <Pause strokeWidth={1.5} /> : <Play strokeWidth={1.5} />}
                  {row.active ? "Pause" : "Resume"}
                </MenuItem>
                <MenuItem onClick={() => duplicate(row)}>
                  <Files strokeWidth={1.5} />
                  Duplicate
                </MenuItem>
                <MenuItem
                  onClick={() => remove([row])}
                  className="text-destructive data-highlighted:text-destructive"
                >
                  <Trash2 strokeWidth={1.5} />
                  Remove
                </MenuItem>
              </MenuContent>
            </Menu>
          )}
        />
      </AdminPanel>

      <PromotionDialog open={formOpen} onOpenChange={setFormOpen} promotion={editing} />

      <p className="mt-3 text-[12px] leading-[18px] text-foreground/45">
        A promotion&rsquo;s state is worked out from its dates, its ceiling and whether it
        is switched on — {percent(stats.running, stats.total)} of them are live today.
      </p>
    </div>
  );
}
