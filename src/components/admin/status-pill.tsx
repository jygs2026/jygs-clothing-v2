import { cn } from "@/lib/utils";

/**
 * The studio's whole vocabulary of coloured labels, in one place. Every
 * module names a tone rather than picking hues, so "paid" is the same green
 * on payments as "delivered" is on orders, and adding a module cannot
 * introduce a seventh shade of amber.
 */
export type Tone =
  | "neutral"
  | "good"
  | "warn"
  | "bad"
  | "info"
  | "brand"
  | "violet";

export const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-border bg-muted text-foreground/62",
  good: "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  warn: "border-amber-600/30 bg-amber-500/14 text-amber-800 dark:text-amber-300",
  bad: "border-rose-600/25 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  info: "border-sky-600/25 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  brand: "border-accent/45 bg-accent/15 text-accent-2",
  violet: "border-violet-600/25 bg-violet-500/12 text-violet-700 dark:text-violet-300",
};

export const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-foreground/55",
  good: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  bad: "text-rose-700 dark:text-rose-400",
  info: "text-sky-700 dark:text-sky-400",
  brand: "text-accent-2",
  violet: "text-violet-700 dark:text-violet-400",
};

export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit items-center rounded-4xl border px-2.5 text-[11.5px] font-medium whitespace-nowrap",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** A word with a dot beside it — the quick read down a status column. */
export function StatusMark({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", TONE_TEXT[tone])}>
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}
