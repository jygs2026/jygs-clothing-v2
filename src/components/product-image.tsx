"use client";

import Image from "next/image";
import { Shirt } from "lucide-react";
import { useState } from "react";

import { useSlowConnection } from "@/hooks/use-slow-connection";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  hint,
  className,
  priority,
}: {
  src?: string;
  alt: string;
  hint: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const slow = useSlowConnection();
  // Never eagerly preload above a slow/data-saver connection, even for
  // callers that ask for it (e.g. the first gallery shot) — let it queue
  // behind whatever the page actually needs first.
  const eager = priority && !slow;
  // Quality only varies for images that were already lazy on the server
  // render (their `slow` value is settled before the browser ever fetches
  // them). A `priority` image starts an eager fetch straight from the
  // server-rendered HTML, before this hook can know the connection is
  // slow — varying its quality here would just trigger a wasted second
  // fetch once React corrects it, so it stays at the default.
  const quality = !priority && slow ? 40 : 75;

  if (src && !failed) {
    return (
      <>
        <Image
          src={src}
          alt={alt}
          fill
          preload={eager}
          loading={eager ? "eager" : "lazy"}
          quality={quality}
          sizes="(min-width: 1240px) 620px, (min-width: 620px) 50vw, 100vw"
          className={cn(
            "plate object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
        {!loaded && (
          <div
            aria-hidden="true"
            className={cn("plate skeleton-shimmer absolute inset-0", className)}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={cn(
        "plate absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[repeating-linear-gradient(135deg,var(--card),var(--card)_10px,color-mix(in_srgb,var(--card)_60%,var(--background))_10px,color-mix(in_srgb,var(--card)_60%,var(--background))_20px)] px-6 text-center",
        className
      )}
    >
      <Shirt className="size-6 text-foreground/30" strokeWidth={1.2} />
      <span className="text-[11px] leading-snug tracking-[0.05em] text-foreground/45 uppercase">
        {hint}
      </span>
    </div>
  );
}
