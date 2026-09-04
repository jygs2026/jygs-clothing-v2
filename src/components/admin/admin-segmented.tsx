"use client";

import { cn } from "@/lib/utils";

/**
 * A small set of mutually exclusive choices, shown all at once. Used where a
 * dropdown would hide the alternatives behind a click — which period, which
 * measure — and where there are few enough options to fit on a phone.
 */
export function AdminSegmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** What the whole group chooses, for assistive tech. */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 rounded-md border border-border bg-admin-surface p-0.5",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-[5px] px-2.5 py-2 text-[12.5px] whitespace-nowrap transition-[background-color,color,transform] duration-(--admin-fast) ease-admin active:scale-95 sm:px-2.5 sm:py-1.5",
            value === option.value
              ? "bg-accent/15 font-medium text-accent-2"
              : "text-foreground/58 hover:bg-muted/60 hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
