"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminAccountMenu } from "@/components/admin/admin-account-menu";
import { activeAdminHref, ADMIN_NAV } from "@/lib/admin/nav";
import { useAdminShellStore } from "@/lib/admin/shell-store";
import { cn } from "@/lib/utils";

/**
 * The contents of the studio rail — the same column whether it is standing
 * beside the page on a wide screen or sliding over it on a narrow one, which
 * is why it takes `collapsed` as a prop instead of reading the store: the
 * drawer is never collapsed, however the desktop rail is set.
 */
export function AdminSidebar({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const closeDrawer = useAdminShellStore((s) => s.setDrawerOpen);
  const active = activeAdminHref(pathname);

  return (
    <div className="flex h-full flex-col bg-admin-rail text-admin-rail-foreground">
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-admin-rail-border",
          collapsed ? "justify-center px-2" : "gap-2 px-5"
        )}
      >
        <Link
          href="/admin"
          onClick={onNavigate}
          aria-label="JYGS admin — dashboard"
          className="flex min-w-0 items-baseline gap-2 rounded-[3px] outline-none focus-visible:ring-3 focus-visible:ring-admin-rail-accent/50"
        >
          <span className="font-heading text-[21px] leading-none font-semibold tracking-[0.24em]">
            {collapsed ? "J" : "JYGS"}
          </span>
          {collapsed ? null : (
            <span className="text-[10.5px] tracking-[0.22em] text-admin-rail-accent uppercase">
              Admin
            </span>
          )}
        </Link>

        {/* Only the drawer gets a close control; the rail has the topbar's. */}
        {onNavigate ? (
          <button
            type="button"
            onClick={() => closeDrawer(false)}
            aria-label="Close menu"
            className="-mr-1.5 ml-auto flex size-8 items-center justify-center rounded-md text-admin-rail-muted transition-colors hover:bg-admin-rail-hover hover:text-admin-rail-foreground"
          >
            <X className="size-[18px]" strokeWidth={1.6} />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="Studio"
        className="no-scrollbar min-h-0 flex-1 overflow-y-auto py-3"
      >
        <ul className={cn("flex flex-col gap-0.5", collapsed ? "px-2" : "px-3")}>
          {ADMIN_NAV.map(({ href, label, icon: Icon, startsBlock }) => {
            const current = active === href;
            return (
              <li
                key={href}
                className={cn(
                  startsBlock &&
                    "mt-2 border-t border-admin-rail-border pt-2.5"
                )}
              >
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={current ? "page" : undefined}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "group relative flex items-center rounded-md text-[13.5px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-admin-rail-accent/50",
                    collapsed
                      ? "h-10 justify-center"
                      : "h-10 gap-3 px-3",
                    current
                      ? "bg-admin-rail-active text-admin-rail-accent"
                      : "text-admin-rail-muted hover:bg-admin-rail-hover hover:text-admin-rail-foreground"
                  )}
                >
                  {current ? (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-admin-rail-accent"
                    />
                  ) : null}
                  <Icon className="size-[18px] shrink-0" strokeWidth={1.5} />
                  <span className={cn(collapsed && "sr-only")}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-admin-rail-border",
          collapsed ? "p-2" : "p-3"
        )}
      >
        <AdminAccountMenu variant="rail" collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
