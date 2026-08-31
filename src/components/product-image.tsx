import Image from "next/image";
import { Shirt } from "lucide-react";

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
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(min-width: 1240px) 620px, (min-width: 620px) 50vw, 100vw"
        className={cn("plate object-cover", className)}
      />
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
