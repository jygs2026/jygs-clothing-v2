"use client";

import { usePathname } from "next/navigation";
import { useEffect, type CSSProperties } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTabbar } from "@/components/admin/admin-tabbar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useAdminCollapsed, useAdminShellStore } from "@/lib/admin/shell-store";
import { cn } from "@/lib/utils";

/**
 * The studio's window: a rail down the left, a bar across the top, and the
 * page between them. Below `lg` the rail has nowhere to stand, so the same
 * column arrives as a drawer over the page instead.
 */
export function AdminShell({
  children,
  fontClassName,
}: {
  children: React.ReactNode;
  /** The studio's own sans, supplied by the layout that loads it. */
  fontClassName: string;
}) {
  const collapsed = useAdminCollapsed();
  const drawerOpen = useAdminShellStore((s) => s.drawerOpen);
  const setDrawerOpen = useAdminShellStore((s) => s.setDrawerOpen);
  const pathname = usePathname();

  // Menus and sheets are portalled to <body>, outside this subtree, so the
  // font variable has to be declared on the document itself or every popup
  // in the studio comes out set in the shop's serif. Removed on the way out,
  // which is when the shop's own pages take the document back.
  useEffect(() => {
    const root = document.documentElement;
    // `admin-studio` is the hook the toaster needs: it is rendered by the
    // root layout, outside this subtree, so it cannot be reached by a
    // selector rooted here — but it can be reached from the document.
    root.classList.add(fontClassName, "admin-studio");
    return () => root.classList.remove(fontClassName, "admin-studio");
  }, [fontClassName]);

  return (
    <div
      data-admin=""
      // One number decides both the rail's width and the room left for the
      // page, so the two can never drift apart.
      style={{ "--admin-rail-w": collapsed ? "72px" : "260px" } as CSSProperties}
      className={cn("flex flex-1 bg-admin-canvas font-admin", fontClassName)}
    >
      <aside
        aria-label="Studio menu"
        className="fixed inset-y-0 left-0 z-30 hidden w-(--admin-rail-w) transition-[width] duration-(--admin-medium) ease-admin lg:block"
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        {/*
         * The shared sheet slides a token 2.5rem, which reads as a panel
         * blinking into place rather than a drawer arriving. A menu that
         * covers the page should be seen to come from the edge it belongs
         * to, so this one travels its own full width.
         */}
        <SheetContent
          side="left"
          showCloseButton={false}
          className="admin-safe-b w-[284px] gap-0 border-admin-rail-border bg-admin-rail p-0 shadow-2xl duration-(--admin-slow) ease-admin-out data-ending-style:translate-x-[-100%] data-starting-style:translate-x-[-100%] sm:max-w-[284px] lg:hidden"
        >
          <SheetTitle className="sr-only">Studio menu</SheetTitle>
          <SheetDescription className="sr-only">
            Every section of the JYGS studio admin.
          </SheetDescription>
          <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <AdminTabbar />

      <div className="flex min-w-0 flex-1 flex-col transition-[padding] duration-(--admin-medium) ease-admin lg:pl-(--admin-rail-w)">
        <AdminTopbar />
        {/*
         * Keyed on the path so React rebuilds the subtree — and so restarts
         * the entrance — on every navigation. It is six pixels and a fifth of
         * a second: enough that a page change registers as an arrival rather
         * than a repaint, not enough to make anyone wait for it.
         */}
        <main
          key={pathname}
          className="admin-enter min-w-0 flex-1 pb-[calc(var(--admin-tabbar-h)+env(safe-area-inset-bottom))] md:pb-0"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
