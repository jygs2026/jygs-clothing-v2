"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { AccountNav } from "@/components/account-nav";
import { SignInPanel } from "@/components/sign-in-panel";
import { useMounted } from "@/hooks/use-mounted";
import { useAuthStore } from "@/lib/auth-store";

/**
 * The shell every account screen sits in. It also does the gating: signed
 * out, none of the pages below it are rendered at all — the sign-in panel
 * takes the whole column instead.
 */
export default function AccountLayout({ children }: LayoutProps<"/account">) {
  const account = useAuthStore((s) => s.account);
  const mounted = useMounted();

  // The account is restored from localStorage, so nothing truthful can be
  // rendered on the server — hold the space rather than flash a sign-in form
  // at someone who is already signed in.
  if (!mounted) {
    return <div className="mx-auto h-[60vh] max-w-[1160px] px-5 sm:px-6" aria-hidden="true" />;
  }

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-10 sm:px-6 sm:py-14">
      <Link
        href="/#collection"
        className="inline-flex items-center gap-1.5 text-xs tracking-[0.09em] text-foreground/55 uppercase transition-colors hover:text-accent-2"
      >
        <ChevronLeft className="size-3.5" strokeWidth={1.6} />
        Keep looking
      </Link>

      {account ? (
        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-10 lg:grid-cols-[212px_minmax(0,1fr)] lg:gap-16">
          <AccountNav account={account} />
          <div className="min-w-0">{children}</div>
        </div>
      ) : (
        <div className="mt-8">
          <SignInPanel />
        </div>
      )}
    </div>
  );
}
