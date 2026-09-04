"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type SectionTab = { href: string; label: string; count?: number };

/**
 * Two halves of one module, side by side.
 *
 * By default each tab is a link to its own page, so it can be linked to,
 * opened in a new tab and reloaded where it stands. Pass `active` and
 * `onSelect` for the cases where both halves are genuinely one screen — two
 * readings of the same money, say — and a page load between them would be
 * pure ceremony.
 */
export function AdminSectionTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: SectionTab[];
  /** Controlled mode: the href of the tab currently showing. */
  active?: string;
  onSelect?: (href: string) => void;
}) {
  const pathname = usePathname();

  // The deepest matching tab wins, so /admin/users/roles/new keeps "Roles"
  // lit rather than falling back to "Users".
  const fromPath = tabs
    .filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    /*
     * Scrolls sideways below `sm`. Four tabs at 360px either shrink their
     * labels to nothing or wrap onto a second row that shifts the whole page
     * down — and a tab strip that changes height as you move along it is
     * worse than one you have to nudge.
     */
    <div className="admin-scroll-x admin-scroll-fade flex items-center gap-1 border-b border-border">
      {tabs.map(({ href, label, count }) => {
        const current = (active ?? fromPath) === href;
        const className = cn(
          "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-3 text-[13.5px] transition-[color,border-color] duration-(--admin-medium) ease-admin sm:py-2.5",
          current
            ? "border-accent text-foreground"
            : "border-transparent text-foreground/58 hover:border-border hover:text-foreground"
        );
        const inner = (
          <>
            {label}
            {count === undefined ? null : (
              <span
                className={cn(
                  "rounded-4xl px-1.5 py-px text-[11px] transition-colors duration-(--admin-medium) ease-admin font-feature-tnum",
                  current ? "bg-accent/15 text-accent-2" : "bg-muted text-foreground/50"
                )}
              >
                {count.toLocaleString("en-IN")}
              </span>
            )}
          </>
        );

        return onSelect ? (
          <button
            key={href}
            type="button"
            onClick={() => onSelect(href)}
            aria-current={current ? "page" : undefined}
            className={className}
          >
            {inner}
          </button>
        ) : (
          <Link
            key={href}
            href={href}
            aria-current={current ? "page" : undefined}
            className={className}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
