import type { ReactNode } from "react";

/**
 * The top of every studio page: what it is, one line on what it is for, and
 * whatever the page's own controls are, kept on the same baseline.
 */
export function AdminPageHeader({
  title,
  blurb,
  children,
}: {
  title: string;
  blurb?: string;
  /** Buttons for the page as a whole — Export, Add, and so on. */
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="text-[23px] leading-tight font-semibold tracking-[-0.015em] sm:text-[30px]">
          {title}
        </h1>
        {blurb ? (
          <p className="mt-1.5 max-w-[62ch] text-[13.5px] leading-[21px] text-foreground/62 sm:text-[14px] sm:leading-[23px]">
            {blurb}
          </p>
        ) : null}
      </div>
      {/*
       * The page's own controls. On a phone they take the full width and
       * scroll if there are more than two — an Export beside an Add beside a
       * date range wraps into a ragged block otherwise, and which button
       * lands where depends on how long its label happens to be.
       */}
      {children ? (
        <div className="admin-scroll-x flex w-full shrink-0 items-center gap-2.5 max-sm:pb-0.5 sm:w-auto">
          {children}
        </div>
      ) : null}
    </header>
  );
}
