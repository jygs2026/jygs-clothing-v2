import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The ram. Drawn as dark ink and gold on a transparent ground — there is no
 * white in the file, so what reads as the animal's face is whatever is behind
 * it. That makes the mark a light-ground mark: on anything dark it collapses
 * into a silhouette, which is what `plate` is for.
 *
 * It is an SVG, which `next/image` serves untouched (the optimiser skips any
 * `.svg` src on its own), so one file covers every size on the site.
 *
 * Decorative by default: every place it appears, the JYGS wordmark or an
 * `aria-label` on the surrounding link already carries the name, and a second
 * announcement of it would only be noise.
 */
export function LogoMark({
  size = 32,
  priority = false,
  plate = false,
  className,
}: {
  size?: number;
  priority?: boolean;
  /** Sets the mark on a pale disc, for the dark studio rail. */
  plate?: boolean;
  className?: string;
}) {
  return (
    <Image
      src="/images/jygs_logo.svg"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn(
        "shrink-0",
        plate && "rounded-full bg-[#ece8e2] p-[3px]",
        className
      )}
    />
  );
}
