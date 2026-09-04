import { cn } from "@/lib/utils";

/**
 * The shape of a number's recent history, at the size of a line of text. No
 * axis and no labels — it says "rising", "falling" or "flat" and nothing
 * else, which is all there is room for beside a tile's figure.
 */
export function Sparkline({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  if (values.length < 2) return null;

  const top = Math.max(...values, 1);
  const step = 100 / (values.length - 1);
  const path = values
    .map((value, i) => `${i ? "L" : "M"}${(i * step).toFixed(2)} ${(22 - (value / top) * 20).toFixed(2)}`)
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 24"
      // Stretched to whatever width it is given; the stroke is told not to
      // stretch with it, so a wide tile does not get a fatter line.
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("h-6 w-full text-accent", className)}
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
