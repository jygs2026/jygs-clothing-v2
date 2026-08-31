"use client";

import { Check } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SIZES } from "@/lib/types";
import type { Product, Review } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReviewsSection({
  product,
  initialReviews,
}: {
  product: Product;
  initialReviews: Review[];
}) {
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [sent, setSent] = useState(false);

  const reviews = useMemo(
    () => [...myReviews, ...initialReviews],
    [myReviews, initialReviews]
  );

  const avg = reviews.length
    ? (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  const fitCounts = reviews.reduce<Record<string, number>>((m, r) => {
    m[r.fit] = (m[r.fit] ?? 0) + 1;
    return m;
  }, {});
  const topFit = Object.keys(fitCounts).sort(
    (a, b) => fitCounts[b] - fitCounts[a]
  )[0];
  const fitVerdict = reviews.length
    ? `${Math.round(
        (fitCounts[topFit] / reviews.length) * 100
      )}% of reviewers say it is ${
        topFit === "True to size" ? "true to size" : topFit.toLowerCase()
      }.`
    : "";

  const madeToOrder = product.badge === "Made to order";
  const reviewSizes = madeToOrder
    ? ["Made to measure"]
    : SIZES.filter((s) => !product.out.includes(s));

  return (
    <section className="grid grid-cols-1 items-start gap-11 py-14 min-[860px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[860px]:gap-x-18">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-6">
          <h2 className="font-heading text-[26px] font-normal leading-[1.16] sm:text-[34px]">
            Worn and reported on
          </h2>
          <span className="flex items-baseline gap-3">
            <span className="font-heading text-3xl leading-none font-feature-tnum">
              {avg}
            </span>
            <span className="text-xs tracking-[0.09em] text-foreground/52 uppercase font-feature-tnum">
              {reviews.length === 1 ? "from 1 review" : `from ${reviews.length} reviews`}
            </span>
          </span>
        </div>

        <dl className="mt-6.5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3.5 gap-y-2 text-xs font-feature-tnum">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = reviews.filter((r) => r.rating === n).length;
            const pct = reviews.length ? Math.round((c / reviews.length) * 100) : 0;
            return (
              <div key={n} className="contents">
                <dt className="text-foreground/55">{n} star</dt>
                <dd className="m-0 h-[5px] overflow-hidden rounded-[3px] border border-border">
                  <span
                    className="block h-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </dd>
                <dd className="m-0 text-foreground/45">{c}</dd>
              </div>
            );
          })}
        </dl>

        {fitVerdict ? (
          <p className="mt-4.5 text-[13px] leading-[23px] text-foreground/60">
            {fitVerdict}
          </p>
        ) : null}

        <div className="mt-7 border-t border-border" />

        <ol className="m-0 list-none p-0">
          {reviews.map((r, i) => (
            <li key={i} className="border-b border-border py-6.5">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-label={`${r.rating} out of 5`}
                    className="text-[13px] tracking-[0.14em] text-accent-2"
                  >
                    {"★★★★★".slice(0, r.rating)}
                    {"☆☆☆☆☆".slice(0, 5 - r.rating)}
                  </span>
                  <span className="font-heading text-lg leading-tight">
                    {r.title}
                  </span>
                </span>
                <span className="text-[11px] tracking-[0.09em] text-foreground/45 uppercase font-feature-tnum">
                  {r.date}
                </span>
              </div>
              <p className="mt-3 text-justify text-[14.5px] leading-[26px] text-foreground/76 [hyphens:auto]">
                {r.body}
              </p>
              <p className="mt-3 text-[11.5px] tracking-[0.08em] text-foreground/48 uppercase">
                {r.name} · Size {r.size} · {r.fit}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-md border border-border p-6">
        <h3 className="font-heading text-xl font-normal leading-tight">
          Write a review
        </h3>
        <p className="mt-2.5 text-[13.5px] leading-6 text-foreground/66">
          Tell us how it wore in, not how it looked in the photograph. We
          publish the unflattering ones too.
        </p>

        {!sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const entry: Review = {
                rating,
                title: String(f.get("title") ?? ""),
                name: String(f.get("name") ?? ""),
                size: String(f.get("size") ?? reviewSizes[0]),
                fit: f.get("fit") as Review["fit"],
                body: String(f.get("body") ?? ""),
                date: "Just now",
              };
              setMyReviews((prev) => [entry, ...prev]);
              setSent(true);
            }}
            className="mt-5.5 grid gap-3.5"
          >
            <div>
              <span className="block text-[11px] tracking-[0.11em] text-foreground/55 uppercase">
                Your rating
              </span>
              <div role="radiogroup" aria-label="Your rating" className="mt-2.5 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={n === rating}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                    className={cn(
                      "flex size-[34px] items-center justify-center rounded-md border text-base",
                      n <= rating
                        ? "border-accent text-accent-2"
                        : "border-border text-foreground/30"
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="rv-name" className="mb-1.5 text-xs text-foreground/70">
                Name
              </Label>
              <Input id="rv-name" name="name" type="text" required placeholder="How it should appear" />
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <Label htmlFor="rv-size" className="mb-1.5 text-xs text-foreground/70">
                  Size worn
                </Label>
                <Select name="size" defaultValue={reviewSizes.includes("M") ? "M" : reviewSizes[0]}>
                  <SelectTrigger id="rv-size" className="w-full font-feature-tnum">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewSizes.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rv-fit" className="mb-1.5 text-xs text-foreground/70">
                  How it fits
                </Label>
                <Select name="fit" defaultValue="True to size">
                  <SelectTrigger id="rv-fit" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Runs small">Runs small</SelectItem>
                    <SelectItem value="True to size">True to size</SelectItem>
                    <SelectItem value="Runs large">Runs large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="rv-title" className="mb-1.5 text-xs text-foreground/70">
                Headline
              </Label>
              <Input id="rv-title" name="title" type="text" required placeholder="One line" />
            </div>
            <div>
              <Label htmlFor="rv-body" className="mb-1.5 text-xs text-foreground/70">
                Your review
              </Label>
              <Textarea
                id="rv-body"
                name="body"
                rows={5}
                required
                placeholder="What did the cloth do after a month?"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
            >
              Post review
            </Button>
            <p className="text-[11.5px] leading-5 text-foreground/48">
              Published as written, once we can match it to an order.
            </p>
          </form>
        ) : (
          <div className="mt-5.5 flex flex-col gap-3.5">
            <span className="flex items-center gap-2.5 text-[14.5px] leading-[26px] text-accent-2">
              <Check className="size-[17px]" strokeWidth={1.4} />
              Posted — thank you.
            </span>
            <p className="text-sm leading-[25px] text-foreground/70">
              It is at the top of the list now. We read every one before the
              next volume is cut.
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSent(false);
                setRating(5);
              }}
              className="self-start text-accent hover:bg-accent/10 hover:text-accent"
            >
              Write another
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
