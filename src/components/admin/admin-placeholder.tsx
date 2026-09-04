import { Hammer } from "lucide-react";

import { ADMIN_NAV } from "@/lib/admin/nav";

/**
 * What every studio section shows until it is built. The heading and
 * standfirst are the real ones from the moment the link exists, so the rail
 * never points at a page that cannot say what it is for.
 */
export function AdminPlaceholder({ href }: { href: string }) {
  const item = ADMIN_NAV.find((entry) => entry.href === href);
  if (!item) return null;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <header>
        <h1 className="font-admin text-[26px] leading-tight font-semibold tracking-[-0.015em] sm:text-[30px]">
          {item.label}
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[23px] text-foreground/62">
          {item.blurb}
        </p>
      </header>

      <div className="mt-7 flex flex-col items-center rounded-lg border border-dashed border-border bg-admin-surface px-6 py-16 text-center">
        <span
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-accent/12 text-accent-2"
        >
          <Hammer className="size-5" strokeWidth={1.5} />
        </span>
        <p className="mt-5 font-admin text-[15px] font-medium">
          This section is not built yet.
        </p>
        <p className="mt-1.5 max-w-[46ch] text-[13.5px] leading-[22px] text-foreground/58">
          The menu around it is finished, so this section can be filled in on
          its own without moving anything else.
        </p>
      </div>
    </div>
  );
}
