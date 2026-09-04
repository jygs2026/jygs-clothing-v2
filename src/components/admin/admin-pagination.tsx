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
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-3">
      <p className="text-[12.5px] text-foreground/58">
        {total === 0
          ? `No ${noun}`
          : `Showing ${first} to ${last} of ${total} ${noun}`}
      </p>

      {/* Both halves wrap: at 390px a five-page run plus the per-page
          select is a couple of pixels too wide to sit on one line. */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <nav aria-label="Pages" className="flex flex-wrap items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/65 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" strokeWidth={1.7} />
          </button>

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
                  "flex size-8 items-center justify-center rounded-md border text-[13px] transition-colors font-feature-tnum",
                  entry === page
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-foreground/70 hover:bg-muted"
                )}
              >
                {entry}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= pages}
            aria-label="Next page"
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/65 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" strokeWidth={1.7} />
          </button>
        </nav>

        <Select
          value={String(perPage)}
          onValueChange={(value) => onPerPage(Number(value))}
          items={PER_PAGE.map((n) => ({ value: String(n), label: `${n} / page` }))}
        >
          <SelectTrigger aria-label="Rows per page" className="h-8">
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
