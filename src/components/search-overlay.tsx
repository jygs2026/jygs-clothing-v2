"use client";

import { Dialog } from "@base-ui/react/dialog";
import { ArrowRight, Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { ProductImage } from "@/components/product-image";
import { QUICK_LINKS, searchProducts } from "@/lib/search";
import { useSearchStore } from "@/lib/search-store";
import { cn } from "@/lib/utils";

/** How many pieces the panel itself offers before handing over to the page. */
const SUGGESTIONS = 6;

/**
 * The site's search, opened from the header magnifier. It drops out of the
 * header on a wide screen and takes the whole screen on a narrow one, and it
 * answers as you type: matching pieces while there is a query, a short list
 * of places to go while there is not. Enter opens the full results page.
 */
export function SearchOverlay() {
  const open = useSearchStore((s) => s.open);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const closeSearch = useSearchStore((s) => s.closeSearch);
  const openSearch = useSearchStore((s) => s.openSearch);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(-1);

  // The field stays responsive while the list catches up.
  const deferred = useDeferredValue(query);
  const trimmed = deferred.trim();
  const matches = trimmed ? searchProducts(trimmed, 60) : [];
  const shown = matches.slice(0, SUGGESTIONS);
  const searching = query.trim().length > 0;

  // "/" opens search from anywhere, the way it does on a shop that expects
  // people to arrive knowing what they want.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      event.preventDefault();
      openSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  function go(href: string) {
    closeSearch();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const rows = searching ? shown.length : QUICK_LINKS.length;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!rows) return;
      const step = event.key === "ArrowDown" ? 1 : -1;
      // -1 is "nothing picked": the list wraps back through it, so arrowing
      // past the end returns to the field rather than trapping the reader.
      setActive((current) => {
        const next = current + step;
        if (next < -1) return rows - 1;
        if (next >= rows) return -1;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (active > -1) {
        go(searching ? `/product/${shown[active].id}` : QUICK_LINKS[active].href);
        return;
      }
      if (searching) go(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? openSearch() : closeSearch())}>
      <Dialog.Portal>
        {/* The header stays crisp above the scrim — only the page below it
            dims. Fixed black rather than a themed tint, which would brighten
            the page in dark mode instead of pushing it back. */}
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/25 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-[2px] sm:top-[var(--jygs-nav-h)]" />

        <Dialog.Popup
          initialFocus={inputRef}
          className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background outline-none transition-[opacity,transform] duration-200 ease-out data-ending-style:-translate-y-2 data-ending-style:opacity-0 data-starting-style:-translate-y-2 data-starting-style:opacity-0 sm:inset-x-0 sm:top-[var(--jygs-nav-h)] sm:bottom-auto sm:max-h-[min(78vh,720px)] sm:border-b sm:border-border sm:shadow-[0_28px_56px_-40px] sm:shadow-foreground/40"
        >
          <Dialog.Title className="sr-only">Search JYGS</Dialog.Title>

          {/* The panel spans the page, but its content keeps a reading width and
              stays aligned with the wordmark above it. */}
          <div className="mx-auto w-full max-w-[1240px] px-5 pt-5 pb-10 sm:px-6 sm:pt-9 sm:pb-11">
            <div className="max-w-[760px]">
              <div className="flex justify-end sm:hidden">
                <Dialog.Close
                  aria-label="Close search"
                  className="-mr-2 flex size-10 items-center justify-center rounded-full text-foreground/60 transition-colors hover:text-foreground"
                >
                  <X className="size-5.5" strokeWidth={1.4} />
                </Dialog.Close>
              </div>

              <div className="mt-4 flex items-center gap-3.5 sm:mt-0 sm:gap-4">
                <Search
                  aria-hidden="true"
                  className="size-6 shrink-0 text-foreground/40 sm:size-7"
                  strokeWidth={1.4}
                />
                <input
                  ref={inputRef}
                  type="text"
                  role="combobox"
                  aria-expanded={true}
                  aria-controls="search-panel-list"
                  aria-activedescendant={active > -1 ? `search-row-${active}` : undefined}
                  aria-label="Search JYGS"
                  autoComplete="off"
                  spellCheck={false}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(-1);
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Search JYGS"
                  className="w-full min-w-0 bg-transparent font-heading text-[28px] leading-[1.2] outline-none placeholder:text-foreground/35 sm:text-[36px]"
                />
                {searching ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setActive(-1);
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear the search"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full text-foreground/45 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4.5" strokeWidth={1.5} />
                  </button>
                ) : null}
              </div>

              <div className="mt-7 sm:mt-8">
                {searching ? (
                  <Suggestions
                    query={query.trim()}
                    results={shown}
                    total={matches.length}
                    active={active}
                    onHover={setActive}
                    onPick={go}
                  />
                ) : (
                  <QuickLinks active={active} onHover={setActive} onPick={go} />
                )}
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function QuickLinks({
  active,
  onHover,
  onPick,
}: {
  active: number;
  onHover: (index: number) => void;
  onPick: (href: string) => void;
}) {
  return (
    <>
      <p className="text-[11px] tracking-[0.12em] text-foreground/45 uppercase">
        Quick links
      </p>
      <ul id="search-panel-list" className="mt-3.5">
        {QUICK_LINKS.map((link, index) => (
          <li key={link.href}>
            <Link
              id={`search-row-${index}`}
              href={link.href}
              onClick={(event) => {
                event.preventDefault();
                onPick(link.href);
              }}
              onMouseEnter={() => onHover(index)}
              className={cn(
                "group flex items-center gap-3.5 py-2.5 text-[16px] transition-colors sm:text-[17px]",
                active === index ? "text-accent-2" : "text-foreground/85"
              )}
            >
              <ArrowRight
                aria-hidden="true"
                className="size-4 shrink-0 text-foreground/40 transition-transform group-hover:translate-x-0.5"
                strokeWidth={1.5}
              />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function Suggestions({
  query,
  results,
  total,
  active,
  onHover,
  onPick,
}: {
  query: string;
  results: ReturnType<typeof searchProducts>;
  total: number;
  active: number;
  onHover: (index: number) => void;
  onPick: (href: string) => void;
}) {
  if (!results.length) {
    return (
      <div>
        <p className="text-[15px] text-foreground/80">
          Nothing matches &ldquo;{query}&rdquo;.
        </p>
        <p className="mt-2 max-w-[52ch] text-[14px] leading-[24px] text-foreground/60">
          Volume 01 is a short run, so a piece may simply not be cut this
          season. Try the cloth — wool, linen, loopback — or a colour such as
          ash, bone or chalk.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-[11px] tracking-[0.12em] text-foreground/45 uppercase font-feature-tnum">
        {total} {total === 1 ? "piece" : "pieces"}
      </p>
      <ul id="search-panel-list" className="mt-3">
        {results.map((product, index) => (
          <li key={product.id}>
            <Link
              id={`search-row-${index}`}
              href={`/product/${product.id}`}
              onClick={(event) => {
                event.preventDefault();
                onPick(`/product/${product.id}`);
              }}
              onMouseEnter={() => onHover(index)}
              className={cn(
                "flex items-center gap-4 rounded-[3px] px-2 py-2.5 -mx-2 transition-colors",
                active === index ? "bg-accent/8" : ""
              )}
            >
              <span className="relative aspect-3/4 w-11 shrink-0 overflow-hidden">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  hint={product.name}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate font-heading text-[17px] leading-tight transition-colors",
                    active === index ? "text-accent-2" : ""
                  )}
                >
                  {product.name}
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-foreground/55">
                  {product.cloth}
                </span>
              </span>
              <span className="shrink-0 text-[13px] text-foreground/70 font-feature-tnum">
                {product.price}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onPick(`/search?q=${encodeURIComponent(query)}`)}
        className="mt-4 inline-flex items-center gap-2 text-[13px] tracking-[0.06em] text-accent-2 uppercase transition-colors hover:text-accent"
      >
        See all {total} {total === 1 ? "result" : "results"}
        <ArrowRight className="size-3.5" strokeWidth={1.6} />
      </button>
    </>
  );
}
