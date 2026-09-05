import Link from "next/link";

import { LogoMark } from "@/components/logo-mark";
import { SocialLinks } from "@/components/social-icons";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Volume 01", href: "/#collection" },
      { label: "Outerwear", href: "/#collection" },
      { label: "Knitwear", href: "/#collection" },
      { label: "Essentials", href: "/#collection" },
    ],
  },
  {
    title: "Atelier",
    links: [
      { label: "Customize yours", href: "/#customize" },
      { label: "Made to order", href: "/#atelier" },
      { label: "Mill notes", href: "/#atelier" },
      { label: "Repairs", href: "/#atelier" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Size & fit", href: "/#waitlist" },
      { label: "Shipping", href: "/#waitlist" },
      { label: "Returns", href: "/#waitlist" },
      { label: "Contact", href: "/#contact" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-8 px-5 py-14 text-[13.5px] leading-[26px] sm:px-6 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(130px,1fr))] md:gap-14">
        <div className="col-span-2 md:col-span-1">
          <span className="flex items-center gap-2.5 font-heading text-xl font-semibold tracking-[0.26em]">
            <LogoMark size={36} />
            JYGS
          </span>
          <p className="mt-3 max-w-[30ch] text-foreground/62">
            Short-run clothing. Two volumes a year, mended for as long as you
            own them.
          </p>
          <SocialLinks className="mt-5" />
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-1.5">
            <span className="mb-1.5 text-[11px] tracking-[0.11em] text-foreground/50 uppercase">
              {col.title}
            </span>
            {col.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-accent-2 hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-[1240px] px-5 py-5 text-xs tracking-[0.04em] text-foreground/52 sm:px-6">
          © {year} JYGS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
