"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * A short secret — a CVC — hidden as it is typed, the way a card form is
 * expected to behave, with a way to check it. Numeric on a phone keypad even
 * while masked, because `type="password"` would otherwise summon a keyboard
 * nobody wants for three digits.
 */
export function SecretInput({
  className,
  revealLabel = "Show the CVC",
  hideLabel = "Hide the CVC",
  ...props
}: ComponentProps<"input"> & { revealLabel?: string; hideLabel?: string }) {
  const [shown, setShown] = useState(false);
  const Icon = shown ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={shown ? "text" : "password"}
        inputMode="numeric"
        className={cn("pr-9", shown ? "" : "tracking-[0.35em]", className)}
      />
      <button
        type="button"
        onClick={() => setShown((current) => !current)}
        aria-label={shown ? hideLabel : revealLabel}
        aria-pressed={shown}
        // Not a tab stop: keyboard users move from the CVC to the button that
        // submits, not to a reveal they can do without.
        tabIndex={-1}
        className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-[3px] text-foreground/45 transition-colors hover:text-foreground"
      >
        <Icon className="size-3.5" strokeWidth={1.6} />
      </button>
    </div>
  );
}
