"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PER_PAGE = [10, 25, 50];

/** The page numbers to draw: always the ends, always a window round the middle. */
function pagesFor(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const window = new Set([1, total, page, page - 1, page + 1]);
  const shown = [...window].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  shown.forEach((n, i) => {
    if (i > 0 && n - shown[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

const STEP =
  "flex size-9 items-center justify-center rounded-md border border-border text-foreground/65 transition-[background-color,color,transform] duration-(--admin-fast) ease-admin hover:bg-muted hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-35 sm:size-8";

export function AdminPagination({
  page,
  perPage,
  total,
  noun,
  onPage,
  onPerPage,
}: {
  page: number;
  perPage: number;
  total: number;
  /** What is being counted, plural — "users", "roles". */
  noun: string;
  onPage: (page: number) => void;
  onPerPage: (perPage: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const first = total === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(page * perPage, total);

  return (
    <div className="admin-safe-b flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      {/* On a phone the count and the page-size control share the lower
          line; from `sm` up the count goes left and the control rejoins the
          arrows on the right. */}
      <div className="order-2 flex items-center justify-between gap-3 sm:order-none sm:contents">
        <p className="text-[12.5px] text-foreground/58">
          {total === 0
            ? `No ${noun}`
            : `Showing ${first} to ${last} of ${total} ${noun}`}
        </p>

        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPage(Number(value))}
          items={PER_PAGE.map((n) => ({ value: String(n), label: `${n} / page` }))}
        >
          <SelectTrigger aria-label="Rows per page" className="h-8 sm:hidden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="order-1 flex items-center justify-between gap-2 sm:order-none sm:justify-end">
        {/*
         * A phone gets two arrows and its place in the run. A five-page
         * numbered strip at 390px either wraps onto a second line or shrinks
         * every target below the thumb — and nobody jumps to page 6 of 9 on a
         * phone anyway; they page through it.
         */}
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={STEP}
        >
          <ChevronLeft className="size-4" strokeWidth={1.7} />
        </button>

        <p
          aria-live="polite"
          className="text-[13px] text-foreground/70 font-feature-tnum sm:hidden"
        >
          Page {page} of {pages}
        </p>

        <nav
          aria-label="Pages"
          className="hidden items-center gap-1 sm:flex"
        >
          {pagesFor(page, pages).map((entry, i) =>
            entry === "gap" ? (
              <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-foreground/40">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => onPage(entry)}
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  "flex size-8 items-center justify-center rounded-md border text-[13px] transition-[background-color,color,border-color,transform] duration-(--admin-fast) ease-admin font-feature-tnum active:scale-95",
                  entry === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                {entry}
              </button>
            )
          )}
        </nav>

        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className={STEP}
        >
          <ChevronRight className="size-4" strokeWidth={1.7} />
        </button>

        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPage(Number(value))}
          items={PER_PAGE.map((n) => ({ value: String(n), label: `${n} / page` }))}
        >
          <SelectTrigger aria-label="Rows per page" className="hidden h-8 sm:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
