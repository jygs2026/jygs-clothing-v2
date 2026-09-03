"use client";

import { Heart, LogOut, Package, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AccountAvatar } from "@/components/account-avatar";
import { SignOutDialog } from "@/components/sign-out-dialog";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import type { Account } from "@/lib/auth-store";
import { ADMIN_ENABLED } from "@/lib/site-config";
import { useWishlistStore } from "@/lib/wishlist-store";

/**
 * The header avatar, once someone is signed in. Everything the account can do
 * hangs off it; signed out, the header shows a plain link to sign in instead.
 */
export function AccountMenu({ account }: { account: Account }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const saved = useWishlistStore((s) => s.ids.length);

  return (
    <>
      <Menu>
        <MenuTrigger
          aria-label={`Account — ${account.name}`}
          className="flex h-8 w-[34px] items-center justify-center rounded-[3px] outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:opacity-80"
        >
          <AccountAvatar
            account={account}
            className="size-[26px] text-[10px] tracking-[0.04em]"
          />
        </MenuTrigger>

        <MenuContent>
          <div className="flex items-center gap-3 px-3.5 pt-1.5 pb-3">
            <AccountAvatar account={account} className="size-9 text-[11px]" />
            <div className="min-w-0">
              <p className="truncate font-heading text-[15px] leading-tight">
                {account.name}
              </p>
              <p className="truncate text-[11.5px] text-foreground/55">
                {account.email}
              </p>
            </div>
          </div>

          <MenuSeparator className="my-0" />

          <MenuLinkItem render={<Link href="/account" />} className="mt-1.5">
            <User strokeWidth={1.5} />
            My Account
          </MenuLinkItem>
          <MenuLinkItem render={<Link href="/account/orders" />}>
            <Package strokeWidth={1.5} />
            Orders
          </MenuLinkItem>
          <MenuLinkItem render={<Link href="/account/wishlist" />}>
            <Heart strokeWidth={1.5} />
            Wishlist
            {saved > 0 ? (
              <span className="ml-auto text-[11px] text-foreground/45 font-feature-tnum">
                {saved}
              </span>
            ) : null}
          </MenuLinkItem>

          {/* Only where this deployment is configured as the studio's own. */}
          {ADMIN_ENABLED ? (
            <MenuLinkItem render={<Link href="/admin" />}>
              <ShieldCheck strokeWidth={1.5} />
              Studio admin
            </MenuLinkItem>
          ) : null}

          <MenuSeparator />

          <MenuItem onClick={() => setConfirmOpen(true)}>
            <LogOut strokeWidth={1.5} />
            Sign out
          </MenuItem>
        </MenuContent>
      </Menu>

      <SignOutDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
    </>
  );
}
