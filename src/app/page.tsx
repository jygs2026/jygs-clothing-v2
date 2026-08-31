import { Atelier } from "@/components/atelier";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { WaitlistSection } from "@/components/waitlist-section";
import { PRODUCTS, TRENDING, TRENDING_META, getProduct } from "@/lib/data";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-6">
      <Hero />

      <hr className="border-border" />

      <Reveal className="py-14 pb-6">
        <section id="collection">
          <div className="flex flex-wrap items-baseline justify-between gap-6">
            <div>
              <span className="mb-3.5 block text-[13px] tracking-[0.08em] text-accent-2 uppercase font-feature-tnum">
                Volume 01 — five pieces
              </span>
              <h2 className="font-heading text-[30px] font-normal leading-[1.14] tracking-[-0.008em] sm:text-[42px]">
                Premium collection
              </h2>
            </div>
            <p className="max-w-[38ch] text-justify text-[14.5px] leading-[26px] text-foreground/72 [hyphens:auto]">
              Hover a piece to see the reverse. Open any of them for the
              cloth, the fit and the sizes still running.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-x-7 gap-y-11 pb-18">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      </Reveal>

      <hr className="border-border" />

      <Reveal className="pt-18 pb-7.5">
        <section id="trending">
          <div className="flex flex-wrap items-baseline justify-between gap-6">
            <div>
              <span className="mb-3.5 block text-[13px] tracking-[0.08em] text-accent-2 uppercase font-feature-tnum">
                Most wanted this month
              </span>
              <h2 className="max-w-[22ch] font-heading text-[30px] font-normal leading-[1.14] tracking-[-0.008em] sm:text-[42px]">
                Trending collections
              </h2>
            </div>
            <p className="max-w-[38ch] text-justify text-[14.5px] leading-[26px] text-foreground/72 [hyphens:auto]">
              Ranked by what left the shelf fastest since the volume opened.
              Open a row for the cloth and the fit, or add your size straight
              from here.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-x-7 gap-y-11 pb-20">
          {TRENDING.map((t, i) => {
            const product = getProduct(t.id);
            if (!product) return null;
            return (
              <ProductCard
                key={t.id}
                product={product}
                rank={"0" + (i + 1)}
                meta={TRENDING_META[i]}
              />
            );
          })}
        </section>
      </Reveal>

      <hr className="border-border" />

      <Reveal>
        <Atelier />
      </Reveal>

      <hr className="border-border" />

      <Reveal>
        <WaitlistSection />
      </Reveal>
    </div>
  );
}
