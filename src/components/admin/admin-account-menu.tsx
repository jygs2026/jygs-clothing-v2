"use client";

import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Laptop,
  LogOut,
  Moon,
  Store,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";

import { SignOutDialog } from "@/components/sign-out-dialog";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuLinkItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { useMounted } from "@/hooks/use-mounted";
import { initialsOf, useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

/**
 * Who is at the desk. It appears twice — as the card at the foot of the rail
 * and as the avatar in the top bar — so the two triggers differ but the menu
 * behind them is written once.
 *
 * The studio is currently shown by an env flag rather than by anyone's
 * account, so this reports what it actually knows: the signed-in customer if
 * there is one, and otherwise that nobody is signed in. Never a stand-in name.
 */
export function AdminAccountMenu({
  variant,
  collapsed = false,
  onNavigate,
}: {
  variant: "rail" | "bar";
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const account = useAuthStore((s) => s.account);
  const mounted = useMounted();

  // Both the account and the theme are restored on the client, so before
  // hydration this can only honestly show the studio.
  const signedIn = mounted ? account : null;
  const initials = signedIn ? initialsOf(signedIn) : "JY";
  const name = signedIn ? signedIn.name : "Studio";
  const detail = signedIn ? signedIn.email : "Not signed in";

  const menu = (
    <MenuContent
      side={variant === "rail" ? "top" : "bottom"}
      align={variant === "rail" ? "start" : "end"}
      className="min-w-[15rem] font-admin"
    >
      {variant === "bar" ? (
        <>
          <div className="px-3.5 pt-1.5 pb-3">
            <p className="truncate font-heading text-[15px] leading-tight">{name}</p>
            <p className="truncate text-[11.5px] text-foreground/55">{detail}</p>
          </div>
          <MenuSeparator className="my-0" />
        </>
      ) : null}

      <MenuLinkItem
        render={<Link href="/" />}
        onClick={onNavigate}
        className={variant === "bar" ? "mt-1.5" : undefined}
      >
        <Store strokeWidth={1.5} />
        Back to the shop
      </MenuLinkItem>

      <MenuSeparator />

      <MenuGroup>
        <MenuGroupLabel>Theme</MenuGroupLabel>
        {THEMES.map(({ value, label, icon: Icon }) => (
          <MenuItem key={value} closeOnClick={false} onClick={() => setTheme(value)}>
            <Icon strokeWidth={1.5} />
            {label}
            {mounted && theme === value ? (
              <Check className="ml-auto !text-accent-2" strokeWidth={1.8} />
            ) : null}
          </MenuItem>
        ))}
      </MenuGroup>

      {signedIn ? (
        <>
          <MenuSeparator />
          <MenuItem onClick={() => setConfirmOpen(true)}>
            <LogOut strokeWidth={1.5} />
            Sign out
          </MenuItem>
        </>
      ) : null}
    </MenuContent>
  );

  return (
    <>
      <Menu>
        {variant === "rail" ? (
          <MenuTrigger
            aria-label={`Studio account — ${name}`}
            title={collapsed ? name : undefined}
            className={cn(
              "flex w-full items-center rounded-md p-2 text-left outline-none transition-colors hover:bg-admin-rail-hover focus-visible:ring-3 focus-visible:ring-admin-rail-accent/50 data-popup-open:bg-admin-rail-hover",
              collapsed ? "justify-center" : "gap-3"
            )}
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-admin-rail-accent/60 text-[11px] tracking-[0.04em] text-admin-rail-accent font-feature-tnum"
            >
              {initials}
            </span>
            {collapsed ? null : (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] leading-tight text-admin-rail-foreground">
                    {name}
                  </span>
                  <span className="block truncate text-[11.5px] leading-tight text-admin-rail-muted">
                    {detail}
                  </span>
                </span>
                <ChevronsUpDown
                  className="size-4 shrink-0 text-admin-rail-muted"
                  strokeWidth={1.5}
                />
              </>
            )}
          </MenuTrigger>
        ) : (
          <MenuTrigger
            aria-label={`Studio account — ${name}`}
            className="flex items-center gap-1 rounded-full pr-1 outline-none transition-opacity hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:opacity-80"
          >
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-accent text-[11px] tracking-[0.04em] text-accent-2 font-feature-tnum"
            >
              {initials}
            </span>
            <ChevronDown className="size-4 text-foreground/45" strokeWidth={1.6} />
          </MenuTrigger>
        )}

        {menu}
      </Menu>

      <SignOutDialog open={confirmOpen} onOpenChange={setConfirmOpen} />
    </>
  );
}
