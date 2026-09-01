import { Atelier } from "@/components/atelier";
import { ContactSection } from "@/components/contact-section";
import { Hero } from "@/components/hero";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { WaitlistSection } from "@/components/waitlist-section";
import { PREMIUM_COLLECTION, TRENDING_COLLECTION } from "@/lib/data";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1240px] px-5 sm:px-6">
      <Hero />

      <hr className="border-border" />

      <Reveal className="py-14 pb-6">
        <section id="collection" className="scroll-mt-[120px]">
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
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 pb-18 sm:grid-cols-3 lg:grid-cols-4">
          {PREMIUM_COLLECTION.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Reveal>

      <hr className="border-border" />

      <Reveal className="pt-18 pb-7.5">
        <section id="trending" className="scroll-mt-[120px]">
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
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 pb-20 sm:grid-cols-3 lg:grid-cols-4">
          {TRENDING_COLLECTION.map(({ product, meta }, i) => (
            <ProductCard
              key={product.id}
              product={product}
              rank={String(i + 1).padStart(2, "0")}
              meta={meta}
            />
          ))}
        </div>
      </Reveal>

      <hr className="border-border" />

      <Reveal>
        <Atelier />
      </Reveal>

      <hr className="border-border" />

      <Reveal>
        <WaitlistSection />
      </Reveal>

      <hr className="border-border" />

      <Reveal>
        <ContactSection />
      </Reveal>
    </div>
  );
}
