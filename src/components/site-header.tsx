"use client";

import { Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";

import { AccountMenu } from "@/components/account-menu";
import { Marquee } from "@/components/marquee";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { useOpenBag } from "@/hooks/use-open-bag";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { useSearchStore } from "@/lib/search-store";

export function SiteHeader() {
  const openBag = useOpenBag();
  const count = useCartStore((s) => s.count());
  const account = useAuthStore((s) => s.account);
  const openSearch = useSearchStore((s) => s.openSearch);
  const mounted = useMounted();

  const hasBag = mounted && count > 0;
  // Both are restored from localStorage, so neither can be trusted until
  // hydration — the server has no idea who is looking.
  const signedIn = mounted ? account : null;

  return (
    <div className="sticky top-0 z-30 bg-background">
      <nav className="mx-auto flex h-[var(--jygs-nav-h)] max-w-[1240px] items-center gap-4 border-b border-border px-5 sm:gap-7 sm:px-6">
        <Link
          href="/"
          className="mr-auto font-heading text-xl font-semibold tracking-[0.26em]"
        >
          JYGS
        </Link>
        <div className="hidden items-center gap-7 min-[860px]:flex">
          <Link
            href="/#collection"
            className="text-sm hover:text-accent-2 transition-colors"
          >
            Collection
          </Link>
          <Link
            href="/#trending"
            className="text-sm hover:text-accent-2 transition-colors"
          >
            Trending
          </Link>
          <Link
            href="/#customize"
            className="text-sm hover:text-accent-2 transition-colors"
          >
            Customize
          </Link>
          <Link
            href="/#atelier"
            className="text-sm hover:text-accent-2 transition-colors"
          >
            Atelier
          </Link>
          <Link
            href="/#contact"
            className="text-sm hover:text-accent-2 transition-colors"
          >
            Contact
          </Link>
        </div>
        <button
          type="button"
          onClick={() => openSearch()}
          aria-label="Search JYGS"
          className="flex h-8 w-[34px] items-center justify-center text-foreground transition-colors hover:text-accent-2"
        >
          <Search className="size-[19px]" strokeWidth={1.4} />
        </button>
        {signedIn ? (
          <AccountMenu account={signedIn} />
        ) : (
          <Link
            href="/account"
            aria-label="Sign in"
            className="flex h-8 w-[34px] items-center justify-center text-foreground transition-colors hover:text-accent-2"
          >
            <User className="size-[19px]" strokeWidth={1.4} />
          </Link>
        )}
        <button
          type="button"
          onClick={openBag}
          aria-label="Open bag"
          className="relative flex h-8 w-[34px] items-center justify-center text-foreground"
        >
          <ShoppingBag className="size-[19px]" strokeWidth={1.4} />
          {hasBag ? (
            <span className="absolute -top-px -right-px flex h-4 min-w-4 items-center justify-center rounded-full border border-accent bg-background px-1 text-[10px] leading-none text-accent-2 font-feature-tnum">
              {count}
            </span>
          ) : null}
        </button>
        <div className="hidden min-[860px]:block">
          <ThemeToggle />
        </div>
        <MobileNav />
        <Button
          render={<Link href="/#waitlist" />}
          nativeButton={false}
          variant="outline"
          className="hidden text-[13px] tracking-[0.06em] border-accent text-accent hover:bg-accent/10 hover:text-accent min-[620px]:inline-flex"
        >
          Join the waitlist
        </Button>
      </nav>
      <Marquee />
    </div>
  );
}
