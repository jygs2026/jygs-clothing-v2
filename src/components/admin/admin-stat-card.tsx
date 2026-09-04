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
  /*
   * Six tiles across a 1240px page leaves each about 185px wide, and
   * "₹3,36,29,700" set at 26px is wider than that — it ran out past the
   * card's edge. CSS cannot fit text to a box on its own, so the figure is
   * sized by how long it actually is. Doing it here rather than asking each
   * screen to pick `moneyShort` means a tile that grows a digit next year
   * cannot quietly start overflowing again.
   */
  const length = String(value).length;
  const valueSize =
    length > 11
      ? "text-[19px] sm:text-[21px]"
      : length > 8
        ? "text-[21px] sm:text-[23px]"
        : "text-[23px] sm:text-[26px]";

  return (
    <div className="admin-surface-raised admin-lift rounded-lg border border-border bg-admin-surface px-3.5 py-3 sm:px-4 sm:py-3.5">
      <p className="truncate text-[12.5px] text-foreground/60">{label}</p>
      <p
        className={cn(
          "mt-1.5 leading-none font-semibold tracking-[-0.02em] font-feature-tnum",
          valueSize,
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
            "mt-1.5 text-[11.5px] leading-[17px] font-medium font-feature-tnum sm:min-h-[34px]",
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
      <p className="mt-1.5 text-[11.5px] leading-[16px] text-foreground/48 sm:mt-2 sm:min-h-[34px] sm:leading-[17px]">
        {detail}
      </p>
    </div>
  );
}
