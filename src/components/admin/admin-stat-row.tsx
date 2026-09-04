import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The strip of figures at the top of a screen.
 *
 * On a wide screen it is a grid, because there is room for six tiles beside
 * each other. On a phone a two-column grid of six tiles is three rows and
 * about 740px — more than a whole screen of scrolling before the first
 * record appears, on every list in the studio. So below `sm` the same tiles
 * become one line that scrolls sideways: the first two are readable at a
 * glance, the rest are a flick away, and the table starts above the fold.
 */
export function AdminStatRow({
  children,
  cols = 6,
  className,
}: {
  children: ReactNode;
  /** How many fit on the widest screen. */
  cols?: 4 | 6;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Bleeds into the page's padding so the last tile is cut by the
        // screen edge rather than stopping short of it — which is what says
        // there is more to the right.
        "admin-scroll-x admin-scroll-fade -mx-4 mt-6 flex gap-3 px-4 pb-1",
        // Two and a bit tiles visible: enough to make the row's direction
        // obvious without a scrollbar to point at it.
        "[&>*]:w-[46%] [&>*]:shrink-0",
        "sm:mx-0 sm:grid sm:gap-3 sm:overflow-x-visible sm:px-0 sm:pb-0 sm:[&>*]:w-auto",
        cols === 6 ? "sm:grid-cols-3 xl:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
