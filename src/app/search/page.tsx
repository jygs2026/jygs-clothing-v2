"use client";

import { ChevronLeft, Search as SearchIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { QUICK_LINKS, searchProducts } from "@/lib/search";
import { cn } from "@/lib/utils";

/**
 * Everything that matches, as a page — where the header panel hands over once
 * there are more pieces than a dropdown should hold. The query lives in the
 * URL, so a search can be sent to someone or come back from history intact.
 */
export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto h-[60vh] max-w-[1240px] px-5 sm:px-6" aria-hidden="true" />}
    >
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  // Seeded from the URL, then owned by the field — typing should not push a
  // history entry per keystroke.
  const [query, setQuery] = useState(() => params.get("q") ?? "");

  const deferred = useDeferredValue(query);
  const trimmed = deferred.trim();
  const results = trimmed ? searchProducts(trimmed, 60) : [];
  const searching = query.trim().length > 0;

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-10 sm:px-6 sm:py-14">
      <Link
        href="/#collection"
        className="inline-flex items-center gap-1.5 text-xs tracking-[0.09em] text-foreground/55 uppercase transition-colors hover:text-accent-2"
      >
        <ChevronLeft className="size-3.5" strokeWidth={1.6} />
        Keep looking
      </Link>

      <h1 className="mt-8 font-heading text-[32px] leading-[1.1] font-normal sm:text-[38px]">
        Search
      </h1>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          // Only now does the address bar catch up, so the search is shareable.
          router.replace(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
        }}
        className="relative mt-6 max-w-[560px]"
      >
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-foreground/45"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={query}
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pieces, cloth or colour"
          aria-label="Search the collection"
          autoComplete="off"
          className="h-12 w-full rounded-[3px] border border-border bg-background pr-12 pl-11 text-[15px] transition-colors outline-none placeholder:text-foreground/45 focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-ring/25"
        />
        {searching ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              router.replace("/search");
            }}
            aria-label="Clear the search"
            className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        ) : null}
      </form>

      {searching ? (
        <section aria-live="polite" className="mt-9">
          <p
            className={cn(
              "text-[13px] tracking-[0.06em] uppercase font-feature-tnum",
              results.length ? "text-foreground/55" : "text-accent-2"
            )}
          >
            {results.length
              ? `${results.length} ${results.length === 1 ? "piece" : "pieces"} for “${query.trim()}”`
              : `Nothing matches “${query.trim()}”`}
          </p>

          {results.length ? (
            <ul className="mt-7 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((product) => (
                <li key={product.id} className="flex">
                  <ProductCard product={product} from="collection" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 max-w-[52ch] text-[14.5px] leading-[26px] text-foreground/68">
              Volume 01 is a short run, so a piece may simply not be cut this
              season. Try the cloth instead — wool, linen, loopback — or a
              colour such as ash, bone or chalk.
            </p>
          )}
        </section>
      ) : (
        <section className="mt-9">
          <p className="text-[11px] tracking-[0.12em] text-foreground/45 uppercase">
            Quick links
          </p>
          <ul className="mt-3.5 max-w-[420px]">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block border-b border-border/70 py-3 text-[16px] text-foreground/85 transition-colors hover:text-accent-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            render={<Link href="/#collection" />}
            nativeButton={false}
            variant="outline"
            className="mt-7 h-10 px-6 text-[13px] tracking-[0.05em]"
          >
            Browse everything
          </Button>
        </section>
      )}
    </div>
  );
}
