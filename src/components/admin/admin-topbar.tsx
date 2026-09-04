"use client";

import { Bell, Menu as MenuIcon, PanelLeft, Search } from "lucide-react";
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
  const searchRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-admin-surface px-4 sm:gap-4 sm:px-6">
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        aria-label="Open studio menu"
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground lg:hidden"
      >
        <MenuIcon className="size-5" strokeWidth={1.6} />
      </button>
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Widen the menu" : "Narrow the menu"}
        aria-pressed={collapsed}
        title={collapsed ? "Widen the menu" : "Narrow the menu"}
        className="hidden size-9 shrink-0 items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-muted hover:text-foreground lg:flex"
      >
        <PanelLeft className="size-5" strokeWidth={1.6} />
      </button>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const q = query.trim();
          router.push(q ? `${search.href}?q=${encodeURIComponent(q)}` : search.href);
        }}
        className="relative mx-auto w-full max-w-[560px]"
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
          className="h-9 w-full rounded-md border border-border bg-admin-canvas pr-14 pl-9 text-[13.5px] outline-none transition-colors placeholder:text-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded-[3px] border border-border px-1.5 py-0.5 text-[10.5px] text-foreground/45 sm:block"
        >
          ⌘K
        </kbd>
      </form>

      <Menu>
        <MenuTrigger
          aria-label="Notifications"
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-foreground/70 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
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
    </header>
  );
}
