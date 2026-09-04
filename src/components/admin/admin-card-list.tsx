import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The narrow-screen half of every studio table. A table with eight columns
 * either scrolls sideways — hiding the row's own actions off the right edge —
 * or sheds so many columns that what is left says nothing. Below `md` the
 * same rows are dealt as cards instead, and every field keeps its label.
 *
 * Both views are rendered from the same page of records, so sorting,
 * filtering and pagination behave identically; only the shape changes.
 */
export function AdminCardList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul className={cn("divide-y divide-border md:hidden", className)}>{children}</ul>
  );
}

export function AdminCard({
  lead,
  title,
  subtitle,
  badges,
  fields,
  select,
  actions,
  selected = false,
  href,
}: {
  /** Avatar, swatch or icon at the top-left. */
  lead?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Pills that belong beside the name — role, status, group. */
  badges?: ReactNode;
  /** Everything the table would have given its own column. `wide` takes
   *  both columns — for prose, which reads badly in a half-width well. */
  fields?: { label: string; value: ReactNode; wide?: boolean }[];
  select?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
  /** Makes the whole card open the record, as clicking a row would. */
  href?: string;
}) {
  return (
    <li className={cn("px-4 py-3.5 transition-colors", selected && "bg-muted/60")}>
      <div className="flex items-start gap-3">
        {select ? <div className="pt-1">{select}</div> : null}
        {lead}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium">
            {href ? (
              <Link href={href} className="hover:text-accent-2">
                {title}
              </Link>
            ) : (
              title
            )}
          </p>
          {subtitle ? (
            <p className="truncate text-[12.5px] text-foreground/55">{subtitle}</p>
          ) : null}
          {badges ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">{badges}</div>
          ) : null}
        </div>

        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
      </div>

      {fields?.length ? (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border pt-3">
          {fields.map(({ label, value, wide }) => (
            <div key={label} className={cn("min-w-0", wide && "col-span-2")}>
              <dt className="text-[10.5px] tracking-[0.08em] text-foreground/45 uppercase">
                {label}
              </dt>
              <dd
                className={cn(
                  "mt-0.5 text-[13px] text-foreground/78",
                  wide ? "leading-[20px]" : "truncate"
                )}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </li>
  );
}
