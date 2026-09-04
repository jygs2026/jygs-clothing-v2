import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The card every list and every form section sits in. */
export function AdminPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    // `overflow-hidden` so the card list's recessed well is cut by the
    // panel's radius instead of squaring off its corners where the list is
    // the last thing in the panel.
    <div
      className={cn(
        "admin-surface-raised overflow-hidden rounded-lg border border-border bg-admin-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminPanelHeader({
  title,
  detail,
  children,
}: {
  title: string;
  detail?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="min-w-0">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {detail ? (
          <p className="mt-0.5 text-[12.5px] text-foreground/55">{detail}</p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
    </header>
  );
}
