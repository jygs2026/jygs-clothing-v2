import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path
        d="M13.5 9.2h1.6V6.8h-1.8c-1.6 0-2.7 1.1-2.7 2.8v1.3H9v2.4h1.6V18h2.4v-4.7h1.9l.4-2.4h-2.3v-1c0-.5.3-.7.7-.7z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.6} {...props}>
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3z" />
      <path d="M8.4 9.3c.3 2.7 2.6 5 5.3 5.3" />
    </svg>
  );
}

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com/jygs", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com/jygs", icon: FacebookIcon },
  { label: "X (Twitter)", href: "https://x.com/jygs", icon: XIcon },
  { label: "WhatsApp", href: "https://wa.me/911234567890", icon: WhatsAppIcon },
];
