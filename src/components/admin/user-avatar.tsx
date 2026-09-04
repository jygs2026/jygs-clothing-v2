import { initialsFor } from "@/lib/admin/format";
import { cn } from "@/lib/utils";

/** A person's initials in a ring — the studio has no staff photographs. */
export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[11.5px] font-medium tracking-[0.03em] text-foreground/75",
        className
      )}
    >
      {initialsFor(name)}
    </span>
  );
}
