"use client";

import type { ReactNode } from "react";

import { AdminCard, AdminCardList } from "@/components/admin/admin-card-list";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminTable } from "@/lib/admin/table";
import { cn } from "@/lib/utils";
import type { CardShape, Column } from "@/components/admin/table/columns";

/**
 * Every list in the studio, drawn from one column definition: a table where
 * there is room for columns, the same page of records as cards where there
 * is not, and the pagination under both.
 *
 * Only the current page is rendered — a hundred thousand records cost the
 * same to draw as ten.
 */
export function DataTable<T>({
  table,
  columns,
  card,
  noun,
  empty,
  selectable = false,
  actions,
  rowHref,
}: {
  table: AdminTable<T>;
  columns: Column<T>[];
  card: CardShape<T>;
  /** Plural, for "Showing 1 to 10 of 42 orders". */
  noun: string;
  empty: string;
  selectable?: boolean;
  actions?: (row: T) => ReactNode;
  /** Marks the row as a link target for assistive tech and hover. */
  rowHref?: (row: T) => string;
}) {
  const byKey = new Map(columns.map((column) => [column.key, column]));

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {selectable ? (
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={table.allShownSelected}
                    indeterminate={table.someShownSelected}
                    onCheckedChange={table.toggleAllShown}
                    aria-label={`Select every one of the ${noun} on this page`}
                  />
                </TableHead>
              ) : null}

              {columns.map((column, i) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "px-2 text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase",
                    i === 0 && !selectable && "pl-4",
                    column.align === "right" && "text-right",
                    column.hideBelow === "lg" && "hidden lg:table-cell",
                    column.hideBelow === "xl" && "hidden xl:table-cell"
                  )}
                >
                  {column.header}
                </TableHead>
              ))}

              {actions ? (
                <TableHead className="px-2 pr-4 text-right text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase">
                  Actions
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>

          <TableBody>
            {table.rows.map((row) => {
              const picked = selectable && table.isSelected(row);
              return (
                <TableRow
                  key={table.idOf(row)}
                  data-state={picked ? "selected" : undefined}
                >
                  {selectable ? (
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={picked}
                        onCheckedChange={() => table.toggle(row)}
                        aria-label={`Select this row`}
                      />
                    </TableCell>
                  ) : null}

                  {columns.map((column, i) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "px-2 py-2.5 text-[13px]",
                        i === 0 && !selectable && "pl-4",
                        column.align === "right" && "text-right",
                        column.hideBelow === "lg" && "hidden lg:table-cell",
                        column.hideBelow === "xl" && "hidden xl:table-cell",
                        column.className
                      )}
                    >
                      {column.cell(row)}
                    </TableCell>
                  ))}

                  {actions ? (
                    <TableCell className="px-2 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        {actions(row)}
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AdminCardList>
        {table.rows.map((row) => (
          <AdminCard
            key={table.idOf(row)}
            selected={selectable && table.isSelected(row)}
            select={
              selectable ? (
                <Checkbox
                  checked={table.isSelected(row)}
                  onCheckedChange={() => table.toggle(row)}
                  aria-label="Select this row"
                />
              ) : undefined
            }
            lead={card.lead?.(row)}
            title={card.title(row)}
            subtitle={card.subtitle?.(row)}
            badges={card.badges?.(row)}
            fields={card.fields
              .map((key) => byKey.get(key))
              .filter((column): column is Column<T> => Boolean(column))
              .map((column) => ({
                label: column.header,
                value: column.cell(row),
                wide: card.wide?.includes(column.key),
              }))}
            actions={actions?.(row)}
            href={rowHref?.(row)}
          />
        ))}
      </AdminCardList>

      {table.rows.length === 0 ? (
        <p className="px-4 py-14 text-center text-[13.5px] text-foreground/55">{empty}</p>
      ) : null}

      <AdminPagination
        page={table.page}
        perPage={table.perPage}
        total={table.total}
        noun={noun}
        onPage={table.setPage}
        onPerPage={table.setPerPage}
      />
    </>
  );
}
