"use client";

import { Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth-store";

/**
 * The one place signing out happens, so the confirmation reads the same
 * whether it was asked for from the header menu or the account sidebar.
 * Controlled by the caller — a menu item cannot be a dialog trigger, since
 * the menu has already closed by the time the dialog needs to open.
 */
export function SignOutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const signOut = useAuthStore((s) => s.signOut);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    signOut();
    onOpenChange(false);
    toast("You are signed out.", {
      description: "Your bag is still here whenever you come back.",
    });
    // Everything under /account needs someone signed in; anywhere else is
    // just as readable signed out, so stay where the reader was.
    if (pathname.startsWith("/account")) router.push("/");
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        // Nothing here is undoable in a hurry — open on Cancel, not on the
        // button that signs you out.
        initialFocus={cancelRef}
        className="text-center"
      >
        <span
          aria-hidden="true"
          className="mx-auto flex size-13 items-center justify-center rounded-full bg-accent/12 text-accent-2"
        >
          <Lock className="size-5.5" strokeWidth={1.5} />
        </span>

        <AlertDialogTitle className="mt-5">
          Are you sure you want to sign out?
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-2">
          You&rsquo;ll need to sign in again to access your account.
        </AlertDialogDescription>

        <Button
          type="button"
          onClick={handleSignOut}
          className="mt-7 h-11 w-full text-[13.5px] tracking-[0.05em]"
        >
          Sign out
        </Button>

        <AlertDialogClose
          ref={cancelRef}
          className="mx-auto mt-3.5 rounded-[3px] px-3 py-1.5 text-[13.5px] text-foreground/62 outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Cancel
        </AlertDialogClose>
      </AlertDialogContent>
    </AlertDialog>
  );
}
