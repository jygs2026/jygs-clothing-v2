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
}: {
  label: string;
  value: number | string;
  detail: string;
  tone?: "default" | "positive" | "warning" | "muted";
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
      {/* Two lines' worth of room whether or not the line wraps, so a row of
          cards keeps one baseline. */}
      <p className="mt-2 min-h-[34px] text-[11.5px] leading-[17px] text-foreground/48">
        {detail}
      </p>
    </div>
  );
}
