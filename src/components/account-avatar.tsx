"use client";

import { initialsOf, type Account } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

/**
 * The customer's picture, or their initials if there is none. Drawn as a
 * background image rather than with next/image: an uploaded photo arrives as
 * a data URL, which the image optimiser cannot take.
 */
export function AccountAvatar({
  account,
  className,
}: {
  account: Account;
  className?: string;
}) {
  if (account.avatar) {
    return (
      <span
        role="img"
        aria-label={`${account.name} — profile picture`}
        className={cn(
          "block shrink-0 rounded-full border border-accent bg-card bg-cover bg-center",
          className
        )}
        style={{ backgroundImage: `url("${account.avatar}")` }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-accent text-accent-2 font-feature-tnum",
        className
      )}
    >
      {initialsOf(account)}
    </span>
  );
}
