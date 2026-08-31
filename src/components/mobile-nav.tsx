"use client";

import { Laptop, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Collection", href: "/#collection" },
  { label: "Trending", href: "/#trending" },
  { label: "Atelier", href: "/#atelier" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-8 w-[34px] items-center justify-center text-foreground min-[860px]:hidden"
      >
        <Menu className="size-5" strokeWidth={1.4} />
      </button>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-6 sm:max-w-[320px]">
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-xl font-semibold tracking-[0.26em]">
            JYGS
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation and theme
          </SheetDescription>
        </SheetHeader>

        <nav className="mt-8 flex flex-col gap-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-border py-3.5 font-heading text-xl transition-colors hover:text-accent-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/#waitlist"
          onClick={() => setOpen(false)}
          className="mt-6 inline-flex items-center justify-center rounded-md border border-accent px-4 py-2 text-[13px] tracking-[0.06em] text-accent transition-colors hover:bg-accent/10"
        >
          Join the waitlist
        </Link>

        <div className="mt-auto pt-8">
          <span className="mb-2.5 block text-[11px] tracking-[0.11em] text-foreground/55 uppercase">
            Colour theme
          </span>
          <div role="group" aria-label="Colour theme" className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
              const active = mounted && theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-md border py-3 text-xs transition-colors",
                    active
                      ? "border-accent bg-accent/10 text-accent-2"
                      : "border-border text-foreground/60"
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.4} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
