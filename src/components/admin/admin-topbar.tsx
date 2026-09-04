"use client";

import { ArrowLeft, Bell, Menu as MenuIcon, PanelLeft, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AdminAccountMenu } from "@/components/admin/admin-account-menu";
import {
  Menu,
  MenuContent,
  MenuTrigger,
} from "@/components/ui/menu";
import { adminSearchFor } from "@/lib/admin/nav";
import { useAdminShellStore } from "@/lib/admin/shell-store";
import { cn } from "@/lib/utils";

const ICON_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-md text-foreground/70 outline-none transition-[background-color,color,transform] duration-(--admin-fast) ease-admin hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95";

/**
 * The bar across the top of the studio. It carries the one control that
 * changes the shape of the window — the rail toggle, which widens the rail on
 * a narrow screen and narrows it on a wide one — and the search that reaches
 * the catalogue from wherever you happen to be.
 */
export function AdminTopbar() {
  const router = useRouter();
  const pathname = usePathname();
  const search = adminSearchFor(pathname);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const collapsed = useAdminShellStore((s) => s.collapsed);
  const toggleCollapsed = useAdminShellStore((s) => s.toggleCollapsed);
  const setDrawerOpen = useAdminShellStore((s) => s.setDrawerOpen);

  // ⌘K / Ctrl-K puts the caret in the search box from anywhere in the studio.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The bar is flat against the page until the page moves under it, and then
  // it lifts. A permanent shadow on an unscrolled page is just a heavier
  // border; the point is to say the content is passing beneath.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Opening the phone's search should put the caret in it — otherwise the
  // control costs two taps to do what one tap suggested it would.
  useEffect(() => {
    if (searchOpen) mobileSearchRef.current?.focus();
  }, [searchOpen]);

  function submit(value: string) {
    const q = value.trim();
    router.push(q ? `${search.href}?q=${encodeURIComponent(q)}` : search.href);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-admin-surface px-3 transition-shadow duration-(--admin-medium) ease-admin sm:gap-4 sm:px-6",
        scrolled && "shadow-[0_1px_3px_color-mix(in_srgb,#201f1d_8%,transparent)]"
      )}
    >
      {/*
       * On a phone the search takes the whole bar rather than a sliver of it.
       * Five controls and a text field do not fit across 360px, and the one
       * that gets squeezed is always the one being typed into.
       */}
      {searchOpen ? (
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submit(query);
            setSearchOpen(false);
          }}
          className="flex w-full items-center gap-2 sm:hidden"
        >
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="Close the search"
            className={ICON_BUTTON}
          >
            <ArrowLeft className="size-5" strokeWidth={1.7} />
          </button>
          <input
            ref={mobileSearchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => {
              if (!query) setSearchOpen(false);
            }}
            aria-label={search.placeholder}
            placeholder={search.placeholder}
            className="h-10 w-full min-w-0 rounded-md border border-border bg-admin-canvas px-3 text-[16px] outline-none transition-[border-color,box-shadow] duration-(--admin-fast) ease-admin placeholder:text-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
          />
        </form>
      ) : null}

      <div className={cn("flex w-full items-center gap-2 sm:gap-4", searchOpen && "max-sm:hidden")}>
        {/*
         * The side menu, wherever the rail is not standing beside the page.
         * On a phone it sits alongside the bottom bar's More, which opens the
         * same drawer — two doors to one room, both of them expected: the
         * hamburger is where a hand goes looking for a menu, and More is
         * where a thumb already is.
         */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open studio menu"
          className={cn(ICON_BUTTON, "lg:hidden")}
        >
          <MenuIcon className="size-5" strokeWidth={1.6} />
        </button>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Widen the menu" : "Narrow the menu"}
          aria-pressed={collapsed}
          title={collapsed ? "Widen the menu" : "Narrow the menu"}
          className={cn(ICON_BUTTON, "hidden lg:flex")}
        >
          <PanelLeft className="size-5" strokeWidth={1.6} />
        </button>

        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            submit(query);
          }}
          className="relative mx-auto hidden w-full max-w-[560px] sm:block"
        >
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-foreground/40"
            strokeWidth={1.6}
          />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label={search.placeholder}
            placeholder={search.placeholder}
            className="h-9 w-full rounded-md border border-border bg-admin-canvas pr-14 pl-9 text-[13.5px] outline-none transition-[border-color,box-shadow] duration-(--admin-fast) ease-admin placeholder:text-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-[3px] border border-border px-1.5 py-0.5 text-[10.5px] text-foreground/45 sm:block"
          >
            ⌘K
          </kbd>
        </form>

        {/* Holds the phone's controls against the right edge, where the wide
            layout has the search doing it. */}
        <div className="ml-auto flex items-center gap-1 sm:ml-0 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={search.placeholder}
            className={cn(ICON_BUTTON, "sm:hidden")}
          >
            <Search className="size-5" strokeWidth={1.7} />
          </button>

          <Menu>
            <MenuTrigger
              aria-label="Notifications"
              className={cn(ICON_BUTTON, "data-popup-open:bg-muted")}
            >
              <Bell className="size-[19px]" strokeWidth={1.6} />
            </MenuTrigger>
            <MenuContent className="min-w-[16rem] p-1 font-admin">
              {/* Nothing feeds this yet, and an invented count would be a lie. */}
              <p className="px-3 py-4 text-center text-[13px] text-foreground/55">
                Nothing needs you right now.
              </p>
            </MenuContent>
          </Menu>

          <AdminAccountMenu variant="bar" />
        </div>
      </div>
    </header>
  );
}
