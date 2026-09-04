import { cn } from "@/lib/utils";

/**
 * A role, worn as a colour. Roles are made by the studio, so the tone cannot
 * live in the seed data — the five that ship are pinned by name and anything
 * created later takes a stable tone from its code, which means a role keeps
 * the same colour on every screen and across reloads.
 */
const TONES = [
  "border-violet-600/25 bg-violet-500/12 text-violet-700 dark:text-violet-300",
  "border-sky-600/25 bg-sky-500/12 text-sky-700 dark:text-sky-300",
  "border-emerald-600/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
  "border-amber-600/30 bg-amber-500/14 text-amber-800 dark:text-amber-300",
  "border-rose-600/25 bg-rose-500/12 text-rose-700 dark:text-rose-300",
  "border-teal-600/25 bg-teal-500/12 text-teal-700 dark:text-teal-300",
] as const;

const PINNED: Record<string, number> = {
  SUPER_ADMIN: 0,
  ADMIN: 1,
  MANAGER: 2,
  STAFF: 3,
  VIEWER: 5,
};

export function roleToneFor(code: string) {
  const pinned = PINNED[code];
  if (pinned !== undefined) return TONES[pinned];
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return TONES[hash % TONES.length];
}

export function RolePill({
  code,
  name,
  className,
}: {
  code: string;
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] items-center rounded-4xl border px-2.5 text-[11.5px] font-medium whitespace-nowrap",
        roleToneFor(code),
        className
      )}
    >
      {name}
    </span>
  );
}

/** The neutral swatch used beside a role's name where the pill would be loud. */
export function RoleSwatch({ code }: { code: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("size-2.5 shrink-0 rounded-full border", roleToneFor(code))}
    />
  );
}
