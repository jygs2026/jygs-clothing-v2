"use client";

import { useEffect, type CSSProperties } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
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

  // Menus and sheets are portalled to <body>, outside this subtree, so the
  // font variable has to be declared on the document itself or every popup
  // in the studio comes out set in the shop's serif. Removed on the way out,
  // which is when the shop's own pages take the document back.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(fontClassName);
    return () => root.classList.remove(fontClassName);
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
        className="fixed inset-y-0 left-0 z-30 hidden w-(--admin-rail-w) transition-[width] duration-200 ease-out lg:block motion-reduce:transition-none"
      >
        <AdminSidebar collapsed={collapsed} />
      </aside>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[268px] gap-0 border-admin-rail-border bg-admin-rail p-0 sm:max-w-[268px] lg:hidden"
        >
          <SheetTitle className="sr-only">Studio menu</SheetTitle>
          <SheetDescription className="sr-only">
            Every section of the JYGS studio admin.
          </SheetDescription>
          <AdminSidebar onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out lg:pl-(--admin-rail-w) motion-reduce:transition-none">
        <AdminTopbar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
