import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { TONE_TEXT, type Tone } from "@/components/admin/status-pill";
import { cn } from "@/lib/utils";

/**
 * The narrow-screen half of every studio table. A table with eight columns
 * either scrolls sideways — hiding the row's own actions off the right edge —
 * or sheds so many columns that what is left says nothing. Below `md` the
 * same rows are dealt as cards instead, and every field keeps its label.
 *
 * Both views are rendered from the same page of records, so sorting,
 * filtering and pagination behave identically; only the shape changes.
 *
 * The cards sit in a recessed well rather than running flush into one
 * another. Eight hairline-separated rows in a column read as one long
 * undifferentiated list on a phone — where each card ends stops being
 * legible somewhere around the third one. Giving every record its own edge
 * costs a few pixels of density and buys back the thing a list is for.
 */
export function AdminCardList({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-2 bg-admin-canvas p-2 md:hidden",
        className
      )}
    >
      {children}
    </ul>
  );
}

export function AdminCard({
  lead,
  title,
  subtitle,
  badges,
  fields,
  metric,
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
  /** Everything the table would have given its own column. `wide` sets the
   *  value under its label instead of beside it — for prose, which reads
   *  badly squeezed into the right-hand half of a row. */
  fields?: { label: string; value: ReactNode; wide?: boolean }[];
  /**
   * The one figure the card is really about — a product's price, what is
   * left on a shelf, what a customer has spent. Set large in the header
   * instead of being buried as the third of five equal-weight fields, which
   * is the difference between a card you read and a card you scan past.
   */
  metric?: { label?: string; value: ReactNode; tone?: Tone };
  select?: ReactNode;
  actions?: ReactNode;
  selected?: boolean;
  /** Makes the whole card open the record, as clicking a row would. */
  href?: string;
}) {
  return (
    <li
      className={cn(
        "admin-press admin-surface-raised relative rounded-lg border border-border bg-admin-surface px-3.5 py-3",
        // A picked card is tinted rather than outlined: at this width an
        // extra ring competes with the card's own edge.
        selected && "border-accent/45 bg-accent/8"
      )}
    >
      {/*
       * The whole card opens the record, the way clicking a table row does.
       * It is an overlay rather than a wrapper so the checkbox and the row's
       * own action buttons stay independently tappable above it — a link
       * around the lot would swallow every one of them.
       *
       * Nothing below may be `relative` unless it also carries `z-10`: a
       * positioned sibling later in the DOM paints over this link and eats
       * the tap, which leaves a card that looks tappable and is not.
       */}
      {href ? (
        <Link
          href={href}
          className="absolute inset-0 z-0 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="sr-only">Open</span>
        </Link>
      ) : null}

      <div className="flex items-start gap-3">
        {select ? (
          <div className="relative z-10 pt-0.5">{select}</div>
        ) : null}
        {lead ? <div className="relative z-10 shrink-0">{lead}</div> : null}

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] leading-5 font-medium">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[12.5px] leading-[17px] text-foreground/55">
              {subtitle}
            </p>
          ) : null}
          {badges ? (
            <div className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5">
              {badges}
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {metric ? (
            <p className="text-right">
              <span
                className={cn(
                  "block text-[16px] leading-5 font-semibold tracking-[-0.01em] font-feature-tnum",
                  metric.tone ? TONE_TEXT[metric.tone] : "text-foreground"
                )}
              >
                {metric.value}
              </span>
              {metric.label ? (
                <span className="mt-0.5 block text-[11px] tracking-[0.06em] text-foreground/45 uppercase">
                  {metric.label}
                </span>
              ) : null}
            </p>
          ) : null}

          {actions ? (
            <div className="relative z-10 -mr-1 flex items-center gap-1.5">{actions}</div>
          ) : !metric && href ? (
            // Nothing to do to the record but open it — so say so, rather
            // than leaving the card's one gesture undiscoverable.
            <ChevronRight
              aria-hidden="true"
              className="mt-0.5 size-4 text-foreground/30"
              strokeWidth={1.8}
            />
          ) : null}
        </div>
      </div>

      {fields?.length ? (
        <dl className="mt-3 border-t border-border/70 pt-0.5">
          {fields.map(({ label, value, wide }) =>
            wide ? (
              <div
                key={label}
                className="border-b border-border/45 py-2.5 last:border-b-0 last:pb-0.5"
              >
                <dt className="text-[11px] leading-4 tracking-[0.08em] text-foreground/45 uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-[13px] leading-[19px] text-foreground/78">
                  {value}
                </dd>
              </div>
            ) : (
              /*
               * Label left, value right, one field per line, each on its own
               * hairline. The two-column grid this replaced put four fields
               * in a block with nothing between them, so a label sat as close
               * to its neighbour's value as to its own.
               */
              <div
                key={label}
                className="flex min-h-[36px] items-center justify-between gap-4 border-b border-border/45 py-2 last:border-b-0 last:pb-0.5"
              >
                <dt className="shrink-0 text-[11px] leading-4 tracking-[0.06em] text-foreground/45 uppercase">
                  {label}
                </dt>
                <dd className="min-w-0 truncate text-right text-[13px] leading-[18px] text-foreground/85">
                  {value}
                </dd>
              </div>
            )
          )}
        </dl>
      ) : null}
    </li>
  );
}
