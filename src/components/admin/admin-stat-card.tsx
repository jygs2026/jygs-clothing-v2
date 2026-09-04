import { cn } from "@/lib/utils";

/**
 * One number from the page below it. The line underneath says what the
 * number is *of* — a count with nothing to measure it against tells a
 * manager very little.
 */
export function AdminStatCard({
  label,
  value,
  detail,
  tone = "default",
  trend,
}: {
  label: string;
  value: number | string;
  detail: string;
  tone?: "default" | "positive" | "warning" | "muted";
  /** How the figure moved against the window before it, where there is one. */
  trend?: { label: string; up: boolean } | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-admin-surface px-4 py-3.5">
      <p className="truncate text-[12.5px] text-foreground/60">{label}</p>
      <p
        className={cn(
          "mt-1.5 text-[26px] leading-none font-semibold tracking-[-0.02em] font-feature-tnum",
          tone === "positive" && "text-emerald-700 dark:text-emerald-400",
          tone === "warning" && "text-amber-700 dark:text-amber-400",
          tone === "muted" && "text-foreground/55"
        )}
      >
        {value}
      </p>
      {/* Once a card in a row carries a comparison, every card in that row
          keeps the line's height whether or not it has one to show, so the
          figures below stay on one baseline. */}
      {trend === undefined ? null : (
        <p
          className={cn(
            "mt-1.5 min-h-[34px] text-[11.5px] leading-[17px] font-medium font-feature-tnum",
            !trend && "text-transparent",
            trend?.up === true && "text-emerald-700 dark:text-emerald-400",
            trend?.up === false && "text-rose-700 dark:text-rose-400"
          )}
        >
          {trend?.label ?? "—"}
          {trend ? (
            <span className="ml-1 font-normal text-foreground/45">on the period before</span>
          ) : null}
        </p>
      )}
      {/* Two lines' worth of room whether or not the line wraps, so a row of
          cards keeps one baseline. */}
      <p className="mt-2 min-h-[34px] text-[11.5px] leading-[17px] text-foreground/48">
        {detail}
      </p>
    </div>
  );
}
