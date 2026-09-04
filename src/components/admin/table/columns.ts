import type { ReactNode } from "react";

import type { Tone } from "@/components/admin/status-pill";

/**
 * One column, described once and rendered three ways: as a table cell on a
 * wide screen, as a labelled field on a card below `md`, and as a CSV value
 * when the page is exported. Keeping the three together is what stops an
 * export quietly falling behind the table it came from.
 */
export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Hide the column below this width; it still appears on the card. */
  hideBelow?: "lg" | "xl";
  align?: "left" | "right";
  /** Plain text for the export. Columns without one are left out of it. */
  csv?: (row: T) => string | number;
  /** Widths that would otherwise be decided by the longest cell. */
  className?: string;
};

/**
 * How a record reads once the columns have been folded away. `fields` names
 * the columns to show under the heading; everything else is drawn from the
 * record directly, because a card's title is rarely one column's cell.
 */
export type CardShape<T> = {
  lead?: (row: T) => ReactNode;
  title: (row: T) => ReactNode;
  subtitle?: (row: T) => ReactNode;
  badges?: (row: T) => ReactNode;
  /** The figure the card leads on. Keep it out of `fields` — showing it
   *  twice is what made every card look the same as every other. */
  metric?: (row: T) => { label?: string; value: ReactNode; tone?: Tone };
  /** Column keys, in card order. */
  fields: string[];
  /** Column keys that should take the card's full width — prose, mostly. */
  wide?: string[];
};

/** Builds the CSV for whatever the table currently matches. */
export function toCsv<T>(columns: Column<T>[], rows: T[]) {
  const used = columns.filter((column) => column.csv);
  const cells = [
    used.map((column) => column.header),
    ...rows.map((row) => used.map((column) => String(column.csv!(row)))),
  ];
  return cells
    .map((line) => line.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

/** Hands the browser a file without asking a server for it. */
export function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
