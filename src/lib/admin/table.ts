"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * The machinery behind every list in the studio: search, filters, sort,
 * pagination and selection over one array of records.
 *
 * It exists because the alternative is writing the same two hundred lines
 * into each module and having them drift — one screen that resets to page 1
 * when a filter changes and one that strands the reader on page 9, one that
 * keeps a selection across pages and one that loses it.
 *
 * Everything is computed in one memoised pass and only the visible page is
 * ever handed back, so the cost of a keystroke is one filter plus one sort
 * over the array — fine into the tens of thousands of rows. Past that the
 * shape is already right for the change: give `rows` from the server, and
 * feed `query`, `filters`, `sort` and `page` to it instead of filtering here.
 */

export type FilterDef<T> = {
  key: string;
  /** Doubles as the "nothing chosen" option — "All statuses". */
  label: string;
  options: { value: string; label: string }[];
  match: (row: T, value: string) => boolean;
};

export type SortDef<T> = {
  value: string;
  label: string;
  compare: (a: T, b: T) => number;
};

export type AdminTable<T> = {
  /** The page currently on screen. */
  rows: T[];
  /** Everything that survived search and filters, in sort order. */
  matched: T[];
  total: number;

  query: string;
  setQuery: (query: string) => void;

  filters: FilterDef<T>[];
  filterValue: (key: string) => string;
  setFilter: (key: string, value: string) => void;
  activeFilters: number;
  clearFilters: () => void;

  sorts: SortDef<T>[];
  sort: string;
  setSort: (value: string) => void;

  page: number;
  setPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;

  selected: string[];
  isSelected: (row: T) => boolean;
  toggle: (row: T) => void;
  toggleAllShown: () => void;
  clearSelection: () => void;
  allShownSelected: boolean;
  someShownSelected: boolean;
  /** The records behind the current selection, in table order. */
  selectedRows: T[];

  idOf: (row: T) => string;
};

export function useAdminTable<T>({
  rows,
  id,
  search,
  filters = [],
  sorts,
  initialSort,
  initialQuery = "",
  initialPerPage = 10,
}: {
  rows: T[];
  id: (row: T) => string;
  /** True when the row should survive the search box. Omit for no search. */
  search?: (row: T, needle: string) => boolean;
  filters?: FilterDef<T>[];
  sorts: SortDef<T>[];
  initialSort?: string;
  /** Seed from `?q=`, so the top bar's search can land on the page. */
  initialQuery?: string;
  initialPerPage?: number;
}): AdminTable<T> {
  const [query, setQueryRaw] = useState(initialQuery);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  const [sort, setSort] = useState(initialSort ?? sorts[0]?.value ?? "");
  const [perPage, setPerPageRaw] = useState(initialPerPage);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  const matched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const active = filters.filter((filter) => (chosen[filter.key] ?? "all") !== "all");

    const found = rows.filter((row) => {
      for (const filter of active) {
        if (!filter.match(row, chosen[filter.key])) return false;
      }
      return !needle || !search || search(row, needle);
    });

    const compare = sorts.find((entry) => entry.value === sort)?.compare;
    // Sorting a copy: `rows` belongs to the store, and sorting in place would
    // mutate what every other reader of that store is looking at.
    return compare ? [...found].sort(compare) : found;
  }, [rows, query, chosen, filters, sorts, sort, search]);

  const pages = Math.max(1, Math.ceil(matched.length / perPage));
  // A filter that shortens the list must not strand the reader on page 9.
  const current = Math.min(page, pages);
  const shown = useMemo(
    () => matched.slice((current - 1) * perPage, current * perPage),
    [matched, current, perPage]
  );

  const shownIds = useMemo(() => shown.map(id), [shown, id]);
  const selectedHere = shownIds.filter((rowId) => selected.includes(rowId));
  const allShownSelected = shownIds.length > 0 && selectedHere.length === shownIds.length;

  // Narrowing the list must not leave a hidden selection behind that a bulk
  // action would then quietly apply to.
  const resetPage = useCallback(() => {
    setPage(1);
    setSelected([]);
  }, []);

  const setQuery = useCallback(
    (next: string) => {
      setQueryRaw(next);
      resetPage();
    },
    [resetPage]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      setChosen((prev) => ({ ...prev, [key]: value }));
      resetPage();
    },
    [resetPage]
  );

  const clearFilters = useCallback(() => {
    setChosen({});
    setQueryRaw("");
    resetPage();
  }, [resetPage]);

  const setPerPage = useCallback((next: number) => {
    setPerPageRaw(next);
    setPage(1);
  }, []);

  const toggle = useCallback(
    (row: T) => {
      const rowId = id(row);
      setSelected((prev) =>
        prev.includes(rowId) ? prev.filter((entry) => entry !== rowId) : [...prev, rowId]
      );
    },
    [id]
  );

  const toggleAllShown = useCallback(() => {
    setSelected((prev) =>
      allShownSelected
        ? prev.filter((rowId) => !shownIds.includes(rowId))
        : [...new Set([...prev, ...shownIds])]
    );
  }, [allShownSelected, shownIds]);

  const selectedRows = useMemo(
    () => matched.filter((row) => selected.includes(id(row))),
    [matched, selected, id]
  );

  return {
    rows: shown,
    matched,
    total: matched.length,

    query,
    setQuery,

    filters,
    filterValue: (key) => chosen[key] ?? "all",
    setFilter,
    activeFilters: filters.filter((f) => (chosen[f.key] ?? "all") !== "all").length,
    clearFilters,

    sorts,
    sort,
    setSort,

    page: current,
    setPage,
    perPage,
    setPerPage,

    selected,
    isSelected: (row) => selected.includes(id(row)),
    toggle,
    toggleAllShown,
    clearSelection: () => setSelected([]),
    allShownSelected,
    someShownSelected: selectedHere.length > 0 && !allShownSelected,
    selectedRows,

    idOf: id,
  };
}

/** Case-insensitive "does any of these fields contain it" — the usual search. */
export function searchAcross<T>(...fields: ((row: T) => string | number | undefined)[]) {
  return (row: T, needle: string) =>
    fields.some((field) => String(field(row) ?? "").toLowerCase().includes(needle));
}

/** Sorts that read the same everywhere: newest, oldest, A–Z, most of something. */
export function byDate<T>(get: (row: T) => string) {
  return {
    newest: (a: T, b: T) => get(b).localeCompare(get(a)),
    oldest: (a: T, b: T) => get(a).localeCompare(get(b)),
  };
}

export function byText<T>(get: (row: T) => string) {
  return (a: T, b: T) => get(a).localeCompare(get(b));
}

export function byNumber<T>(get: (row: T) => number) {
  return {
    high: (a: T, b: T) => get(b) - get(a),
    low: (a: T, b: T) => get(a) - get(b),
  };
}
