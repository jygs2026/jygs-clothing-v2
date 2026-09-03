"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { SECTIONS, sectionFor } from "@/lib/data";

function Trail({
  section,
  name,
}: {
  section: { label: string; href: string };
  name: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2.5 py-5.5 text-[11.5px] tracking-[0.09em] text-foreground/50 uppercase"
    >
      <Link href={section.href} className="underline underline-offset-3 transition-colors hover:text-accent-2">
        {section.label}
      </Link>
      <span aria-hidden="true">/</span>
      <span className="text-foreground">{name}</span>
    </nav>
  );
}

/**
 * Names the shelf the reader opened this piece from, via `?from=`. Reading
 * the query needs the client, so this sits behind a Suspense boundary with
 * `Fallback` below — the rest of the page stays prerendered.
 */
export function ProductBreadcrumb({ name }: { name: string }) {
  const from = useSearchParams().get("from");
  return <Trail section={sectionFor(from)} name={name} />;
}

/** The prerendered crumb: the collection, before the query is known. */
export function ProductBreadcrumbFallback({ name }: { name: string }) {
  return <Trail section={SECTIONS.collection} name={name} />;
}
