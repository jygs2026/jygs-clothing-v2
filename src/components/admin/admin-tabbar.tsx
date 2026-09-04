"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_TABS, activeAdminHref } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";

/**
 * The bar along the bottom of the studio on a phone.
 *
 * The side menu still reaches all thirteen sections from the top bar; this
 * is the shortlist that is worth a permanent thumb-reach place, plus the way
 * out to the shop itself. There is deliberately no overflow tab: a sixth
 * cell whose only job is to open the menu that the hamburger already opens
 * would be a fifth of the bar spent on nothing.
 *
 * Phones only. From `md` the drawer's own trigger is unremarkable, and by
 * `lg` the rail is standing beside the page anyway.
 */
export function AdminTabbar() {
  const pathname = usePathname();
  const active = activeAdminHref(pathname);

  return (
    /*
     * The home-indicator inset is padding on the bar itself, not the shared
     * `admin-safe-b` spacer: that spacer is a block child, and inside this
     * row of tabs it would become a flex item adding width instead of the
     * height it was meant to add.
     */
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-admin-surface pb-[env(safe-area-inset-bottom,0px)] md:hidden"
      style={{ boxShadow: "0 -1px 3px color-mix(in srgb, #201f1d 6%, transparent)" }}
    >
      <div className="flex h-(--admin-tabbar-h)">
        {ADMIN_TABS.map(({ href, label, icon: Icon, leavesAdmin }) => {
          const current = !leavesAdmin && active === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5 pt-2 pb-1.5 text-[11px] leading-none outline-none transition-colors duration-(--admin-fast) ease-admin focus-visible:bg-muted active:bg-muted",
                current ? "text-accent-2" : "text-foreground/55 hover:text-foreground"
              )}
            >
              {/*
               * Always drawn and scaled away when inactive, so the mark
               * travels along the bar as you move rather than blinking out
               * and in somewhere else.
               */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-4 top-0 h-[2px] origin-center rounded-b-full bg-accent transition-transform duration-(--admin-medium) ease-admin-out",
                  current ? "scale-x-100" : "scale-x-0"
                )}
              />
              <Icon
                className={cn(
                  "size-[21px] shrink-0 transition-transform duration-(--admin-medium) ease-admin",
                  current && "scale-105"
                )}
                strokeWidth={current ? 1.9 : 1.6}
              />
              {/* "Promotions" is the longest of the five and still fits one
                  line in a fifth of 360px at this size. */}
              <span className="w-full truncate text-center">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
