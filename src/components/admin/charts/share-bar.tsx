import { cn } from "@/lib/utils";

/**
 * Tints of the studio's own gold rather than a fresh hue per slice: five
 * unrelated colours would say these categories are unrelated, when what is
 * being shown is five parts of one whole.
 */
const SHARE_TINT = [
  "bg-accent",
  "bg-accent/70",
  "bg-accent/45",
  "bg-foreground/30",
  "bg-foreground/18",
  "bg-foreground/10",
];

export type Share = { label: string; value: number };

/**
 * One whole, split. The bar carries the proportions and the legend under it
 * carries the figures, because a share nobody can put a number to is decor.
 */
export function ShareBar({
  shares,
  format,
  empty = "Nothing to split for this period.",
  className,
}: {
  shares: Share[];
  format: (value: number) => string;
  empty?: string;
  className?: string;
}) {
  const total = shares.reduce((sum, share) => sum + share.value, 0);

  if (!total) {
    return <p className="py-6 text-center text-[13px] text-foreground/50">{empty}</p>;
  }

  return (
    <div className={className}>
      <div className="flex h-2.5 overflow-hidden rounded-4xl bg-muted">
        {shares.map((share, i) => (
          <span
            key={share.label}
            className={cn("h-full", SHARE_TINT[i % SHARE_TINT.length])}
            style={{ width: `${(share.value / total) * 100}%` }}
          />
        ))}
      </div>

      <dl className="mt-4 grid gap-2.5">
        {shares.map((share, i) => (
          <div key={share.label} className="flex items-baseline gap-2.5">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 translate-y-px rounded-full",
                SHARE_TINT[i % SHARE_TINT.length]
              )}
            />
            <dt className="min-w-0 flex-1 truncate text-[13px]">{share.label}</dt>
            <dd className="shrink-0 text-[12.5px] text-foreground/55 font-feature-tnum">
              {Math.round((share.value / total) * 100)}%
            </dd>
            <dd className="w-20 shrink-0 text-right text-[12.5px] font-medium font-feature-tnum">
              {format(share.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
