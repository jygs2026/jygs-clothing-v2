import type { ReactNode } from "react";

import { AdminCard, AdminCardList } from "@/components/admin/admin-card-list";
import type { Column } from "@/components/admin/table/columns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * A short, finished list — the ten best sellers, the five busiest days.
 * `DataTable` is the right shape for a list somebody searches, sorts and
 * pages through; a report's table is none of those things, and giving it a
 * toolbar and a pager it does not need would only be furniture.
 *
 * The columns are described the same way, so a report's table and a module's
 * table stay in step, and both fold to the same cards below `md`.
 */
export function ReportTable<T>({
  rows,
  columns,
  id,
  card,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  id: (row: T) => string;
  card: {
    title: (row: T) => ReactNode;
    subtitle?: (row: T) => ReactNode;
    /** Column keys, in card order. */
    fields: string[];
  };
  empty: string;
}) {
  if (!rows.length) {
    return <p className="px-5 py-10 text-center text-[13px] text-foreground/50">{empty}</p>;
  }

  const byKey = new Map(columns.map((column) => [column.key, column]));

  return (
    <>
      <div className="hidden md:block">
        <Table containerClassName="admin-table-scroll">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column, i) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "px-2 text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase",
                    i === 0 && "pl-5",
                    i === columns.length - 1 && "pr-5",
                    column.align === "right" && "text-right",
                    column.hideBelow === "lg" && "hidden lg:table-cell",
                    column.hideBelow === "xl" && "hidden xl:table-cell"
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={id(row)}>
                {columns.map((column, i) => (
                  <TableCell
                    key={column.key}
                    className={cn(
                      "px-2 py-3 text-[13px]",
                      i === 0 && "pl-5",
                      i === columns.length - 1 && "pr-5",
                      column.align === "right" && "text-right",
                      column.hideBelow === "lg" && "hidden lg:table-cell",
                      column.hideBelow === "xl" && "hidden xl:table-cell",
                      column.className
                    )}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AdminCardList>
        {rows.map((row) => (
          <AdminCard
            key={id(row)}
            title={card.title(row)}
            subtitle={card.subtitle?.(row)}
            fields={card.fields.flatMap((key) => {
              const column = byKey.get(key);
              return column ? [{ label: column.header, value: column.cell(row) }] : [];
            })}
          />
        ))}
      </AdminCardList>
    </>
  );
}
