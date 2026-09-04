import type { CustomerGroup } from "@/lib/admin/customers";
import { cn } from "@/lib/utils";

/**
 * Which kind of customer this is. The four read as a ladder rather than four
 * unrelated labels, so the tones climb with them instead of picking a
 * different hue for each.
 */
const TONES: Record<CustomerGroup, string> = {
  New: "border-border bg-muted text-foreground/60",
  Returning: "border-sky-600/25 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  Loyal: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  VIP: "border-accent/45 bg-accent/15 text-accent-2",
};

export function GroupPill({
  group,
  className,
}: {
  group: CustomerGroup;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-4xl border px-2.5 text-[11.5px] font-medium whitespace-nowrap",
        TONES[group],
        className
      )}
    >
      {group}
    </span>
  );
}
