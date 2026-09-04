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
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em] sm:text-[30px]">
          {title}
        </h1>
        {blurb ? (
          <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[23px] text-foreground/62">
            {blurb}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex shrink-0 items-center gap-2.5">{children}</div> : null}
    </header>
  );
}
