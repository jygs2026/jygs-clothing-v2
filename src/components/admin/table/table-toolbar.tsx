"use client";

import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminTable } from "@/lib/admin/table";
import { cn } from "@/lib/utils";

/**
 * The strip above every list: what to look for, what to leave out, and what
 * order to read it in. When rows are picked it hands the whole strip over to
 * the bulk actions instead — the reader has stopped narrowing and started
 * doing, and the two sets of controls have no business competing.
 *
 * Below `sm` the search takes its own full-width line and the filters run
 * along a second one that scrolls sideways. Wrapping them all into one block
 * put a 190px search box beside a half-width select and left the third
 * filter alone on a line of its own — the arrangement changed every time a
 * module added a filter.
 */
export function TableToolbar<T>({
  table,
  placeholder,
  bulk,
  children,
}: {
  table: AdminTable<T>;
  placeholder: string;
  /** Shown instead of the filters while rows are selected. */
  bulk?: (rows: T[]) => ReactNode;
  /** Extra controls on the right, before the sort. */
  children?: ReactNode;
}) {
  if (bulk && table.selected.length > 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-accent/6 px-4 py-2.5">
        <p className="mr-1 text-[13px] font-medium text-foreground/75 font-feature-tnum">
          {table.selected.length} selected
        </p>
        {bulk(table.selectedRows)}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={table.clearSelection}
        >
          Clear
        </Button>
      </div>
    );
  }

  const narrowed = table.activeFilters > 0 || Boolean(table.query);

  return (
    <div className="flex flex-col gap-2.5 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:w-auto sm:min-w-[190px] sm:flex-1 sm:max-w-[260px]">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-foreground/40"
          strokeWidth={1.6}
        />
        <input
          type="search"
          value={table.query}
          onChange={(event) => table.setQuery(event.target.value)}
          aria-label={placeholder}
          placeholder={placeholder}
          // 16px on the phone: iOS zooms the whole page in on focus for
          // anything smaller, and never zooms back out.
          className="h-9 w-full rounded-md border border-border bg-transparent pr-8 pl-8 text-[16px] outline-none transition-[border-color,box-shadow] duration-(--admin-fast) ease-admin placeholder:text-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:h-8 sm:text-[13px] [&::-webkit-search-cancel-button]:hidden"
        />
        {table.query ? (
          <button
            type="button"
            onClick={() => table.setQuery("")}
            aria-label="Clear the search"
            className="absolute top-1/2 right-1.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-foreground/40 transition-colors duration-(--admin-fast) hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        ) : null}
      </div>

      {/*
       * The filter row. It scrolls rather than wraps, so a module with four
       * filters looks like a module with two — one line, in the same place,
       * whatever it happens to carry. The negative margins let the row bleed
       * into the panel's padding so the last chip is cut by the panel edge,
       * which is what says "keep going".
       */}
      <div className="admin-scroll-x admin-scroll-fade -mx-4 flex items-center gap-2 px-4 max-sm:pb-0.5 sm:mx-0 sm:contents sm:px-0">
        {table.filters.map((filter) => {
          const value = table.filterValue(filter.key);
          const items = [{ value: "all", label: filter.label }, ...filter.options];
          return (
            <Select
              key={filter.key}
              value={value}
              onValueChange={(next) => table.setFilter(filter.key, next as string)}
              items={items}
            >
              <SelectTrigger
                aria-label={filter.label}
                className={cn(
                  "h-9 shrink-0 transition-[border-color,color] duration-(--admin-fast) ease-admin sm:h-8",
                  value !== "all" && "border-accent/60 bg-accent/8 text-accent-2"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}

        {/* Only offered once something is actually narrowed, so it is never a
            button that does nothing. */}
        {narrowed ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 sm:h-7"
            onClick={table.clearFilters}
          >
            <X strokeWidth={1.8} />
            Clear
          </Button>
        ) : null}

        {/* Rides the same scrolling line on a phone; `sm:contents` above
            promotes this group to a flex item of the toolbar proper, where
            the auto margin pushes it to the right edge. */}
        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          {children}
          {table.sorts.length > 1 ? (
            <Select
              value={table.sort}
              onValueChange={(value) => table.setSort(value as string)}
              items={table.sorts}
            >
              <SelectTrigger aria-label="Sort" className="h-9 sm:h-8">
                <span className="hidden text-foreground/50 sm:inline">Sort:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {table.sorts.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>
    </div>
  );
}
