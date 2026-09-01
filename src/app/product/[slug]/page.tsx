import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { Reveal } from "@/components/reveal";
import { ReviewsSection } from "@/components/reviews-section";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { ALL_PRODUCTS, DEFAULT_SPEC, REVIEWS, SPECS, getProduct } from "@/lib/data";

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — JYGS`,
    description: product.note,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const spec = SPECS[product.id] ?? DEFAULT_SPEC;
  const reviews = REVIEWS[product.id] ?? [];

  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2.5 py-5.5 text-[11.5px] tracking-[0.09em] text-foreground/50 uppercase"
      >
        <Link href="/#collection" className="underline underline-offset-3">
          Volume 01
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 items-start gap-9 pb-16 min-[860px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[860px]:gap-x-18">
        <ProductGallery productName={product.name} image={product.image} />
        <ProductPurchasePanel product={product} spec={spec} />
      </section>

      <hr className="border-border" />

      <Reveal>
        <section className="grid grid-cols-1 items-start gap-9 py-14 min-[860px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[860px]:gap-x-18">
          <div>
            <h2 className="mb-5.5 font-heading text-[26px] font-normal leading-[1.16] sm:text-[34px]">
              The cloth, in detail
            </h2>
            <Table>
              <TableBody>
                {[
                  { k: "Cloth", v: product.cloth },
                  { k: "Mill", v: spec.mill },
                  { k: "Weight", v: spec.weight },
                  { k: "Fit", v: spec.fit },
                  { k: "Finishing", v: spec.finishing },
                  { k: "Run", v: "400 pieces, then the pattern retires" },
                ].map((row) => (
                  <TableRow key={row.k}>
                    <TableCell className="w-[34%] text-[11.5px] tracking-[0.09em] text-foreground/55 uppercase">
                      {row.k}
                    </TableCell>
                    <TableCell className="text-[14.5px] leading-[25px] whitespace-normal">
                      {row.v}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <h3 className="mb-3.5 font-heading text-xl font-normal leading-tight">
              Care
            </h3>
            <p className="text-justify text-[14.5px] leading-[26px] text-foreground/74 [hyphens:auto]">
              {spec.care}
            </p>
            <h3 className="mt-7 mb-3.5 font-heading text-xl font-normal leading-tight">
              Where it was made
            </h3>
            <p className="text-justify text-[14.5px] leading-[26px] text-foreground/74 [hyphens:auto]">
              {spec.origin}
            </p>
          </div>
        </section>
      </Reveal>

      <hr className="border-border" />

      <ReviewsSection product={product} initialReviews={reviews} />
    </div>
  );
}
