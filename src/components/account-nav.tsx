"use client";

import { Heart, LogOut, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AccountAvatar } from "@/components/account-avatar";
import { SignOutDialog } from "@/components/sign-out-dialog";
import type { Account } from "@/lib/auth-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "My Account", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
] as const;

/**
 * The account's own navigation: a column beside the page on a wide screen,
 * a scrollable strip of tabs above it on a narrow one.
 */
export function AccountNav({ account }: { account: Account }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pathname = usePathname();
  const saved = useWishlistStore((s) => s.ids.length);

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28">
      <div className="mb-6 hidden items-center gap-3.5 lg:flex">
        <AccountAvatar account={account} className="size-11 text-[13px]" />
        <div className="min-w-0">
          <p className="truncate font-heading text-[17px] leading-tight">
            {account.name}
          </p>
          <p className="truncate text-[12.5px] text-foreground/60">{account.email}</p>
        </div>
      </div>

      <ul className="no-scrollbar -mx-5 flex overflow-x-auto border-b border-border px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:border-b-0 lg:border-l lg:px-0">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "-mb-px flex items-center gap-2.5 border-b-2 px-4 py-3 text-[13.5px] whitespace-nowrap transition-colors first:pl-0 lg:mb-0 lg:-ml-px lg:border-b-0 lg:border-l-2 lg:px-4 lg:py-2.5 lg:first:pl-4",
                  active
                    ? "border-accent text-accent-2"
                    : "border-transparent text-foreground/62 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                {label}
                {href === "/account/wishlist" && saved > 0 ? (
                  <span className="text-[11px] text-foreground/45 font-feature-tnum">
                    {saved}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="mt-6 hidden items-center gap-2.5 px-4 text-[13.5px] text-foreground/62 transition-colors hover:text-accent-2 lg:flex"
      >
        <LogOut className="size-4" strokeWidth={1.5} />
        Sign out
      </button>

      <SignOutDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
    </nav>
  );
}
