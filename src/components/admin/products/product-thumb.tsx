import type { CatalogueItem } from "@/lib/admin/catalogue";
import { cn } from "@/lib/utils";

/**
 * A piece, small. Drawn as a background image rather than with `next/image`:
 * a forty-pixel square in a table row does not need the optimiser, and a
 * product without photography yet should fall back to its initials instead of
 * a broken frame.
 */
export function ProductThumb({
  item,
  className,
}: {
  item: CatalogueItem;
  className?: string;
}) {
  if (item.image) {
    return (
      <span
        role="img"
        aria-label={item.name}
        className={cn(
          "block size-9 shrink-0 rounded-md border border-border bg-muted bg-cover bg-center",
          className
        )}
        style={{ backgroundImage: `url("${item.image}")` }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[10.5px] font-medium text-foreground/55",
        className
      )}
    >
      {item.name.slice(0, 2).toUpperCase()}
    </span>
  );
}
