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
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
        <p className="mr-1 text-[13px] text-foreground/70 font-feature-tnum">
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

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-4 py-3">
      <div className="relative min-w-[190px] flex-1 sm:max-w-[260px]">
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
          className="h-8 w-full rounded-md border border-border bg-transparent pr-2.5 pl-8 text-[13px] outline-none transition-colors placeholder:text-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

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
              className={cn("h-8", value !== "all" && "border-accent/60 text-accent-2")}
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
      {table.activeFilters > 0 || table.query ? (
        <Button variant="ghost" size="sm" onClick={table.clearFilters}>
          <X strokeWidth={1.8} />
          Clear
        </Button>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        {children}
        {table.sorts.length > 1 ? (
          <Select
            value={table.sort}
            onValueChange={(value) => table.setSort(value as string)}
            items={table.sorts}
          >
            <SelectTrigger aria-label="Sort" className="h-8">
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
  );
}
