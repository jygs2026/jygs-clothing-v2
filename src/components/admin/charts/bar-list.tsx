import Link from "next/link";

import { cn } from "@/lib/utils";

export type BarRow = {
  label: string;
  value: number;
  /** The second line — a count beside a sum, usually. */
  hint?: string;
  href?: string;
};

/**
 * A ranked breakdown. Bars rather than a pie: six categories in a circle
 * cannot be compared by eye, and the same six in a column can be read in
 * order without a legend. Laid out in normal flow, so it reflows to a phone
 * without any measuring.
 */
export function BarList({
  rows,
  format,
  limit,
  empty = "Nothing to show for this period.",
  className,
}: {
  rows: BarRow[];
  format: (value: number) => string;
  limit?: number;
  empty?: string;
  className?: string;
}) {
  const shown = limit ? rows.slice(0, limit) : rows;
  const top = Math.max(...shown.map((row) => row.value), 1);

  if (!shown.length) {
    return <p className="py-6 text-center text-[13px] text-foreground/50">{empty}</p>;
  }

  return (
    <ol className={cn("grid gap-3.5", className)}>
      {shown.map((row) => {
        const name = (
          <span className="truncate text-[13px]">{row.label}</span>
        );
        return (
          <li key={row.label}>
            <div className="flex items-baseline justify-between gap-3">
              {row.href ? (
                <Link href={row.href} className="min-w-0 hover:text-accent-2">
                  {name}
                </Link>
              ) : (
                <span className="min-w-0">{name}</span>
              )}
              <span className="shrink-0 text-[12.5px] font-medium font-feature-tnum">
                {format(row.value)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-4xl bg-muted">
              <div
                className="h-full rounded-4xl bg-accent"
                style={{ width: `${Math.max((row.value / top) * 100, 2)}%` }}
              />
            </div>
            {row.hint ? (
              <p className="mt-1 text-[11.5px] text-foreground/45">{row.hint}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
