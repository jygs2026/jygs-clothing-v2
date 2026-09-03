"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/utils";

/**
 * The shelf position has to be put back before the browser paints, or the
 * shelf visibly jumps from the first card to where the reader left it.
 * `useLayoutEffect` does nothing during prerender, hence the swap.
 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

function readScroll(key: string) {
  try {
    return Number(sessionStorage.getItem(key)) || 0;
  } catch {
    // Private modes and blocked site data throw on access.
    return 0;
  }
}

function writeScroll(key: string, left: number) {
  try {
    sessionStorage.setItem(key, String(Math.round(left)));
  } catch {
    // Losing the position is not worth breaking the shelf over.
  }
}

/**
 * Horizontally-scrolling shelf: native touch/trackpad scrolling, mouse
 * drag-to-scroll on desktop, arrow controls that step exactly one card, and
 * scroll-snap so it always settles on one. Each child becomes a fixed-width
 * slide, so it takes any card component — products, custom tees, whatever
 * comes next. Arrows fade out at the ends: none on the left at the first
 * item, none on the right at the last.
 *
 * How far the reader has scrolled is remembered for the tab's session under
 * `storageKey`, so opening a piece and coming back lands on the same cards
 * rather than at the start of the shelf.
 */
export function Carousel({
  children,
  label,
  storageKey,
  itemClassName = "w-[220px] sm:w-[240px] lg:w-[258px]",
}: {
  children: ReactNode;
  label: string;
  /** Defaults to `label`; pass one explicitly when a shelf's contents vary. */
  storageKey?: string;
  itemClassName?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  // Last position seen while the shelf was live. Reading `scrollLeft` at
  // teardown instead would give 0 — the cards are gone by then, so the
  // browser has already clamped the track back to the start.
  const lastLeft = useRef(0);

  const slides = Children.toArray(children);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollKey = `jygs:shelf:${storageKey ?? label}`;

  useBeforePaint(() => {
    const el = trackRef.current;
    if (!el) return;
    const left = readScroll(scrollKey);
    lastLeft.current = left;
    if (left > 0) {
      // The track scrolls smoothly by CSS; an inline override keeps the
      // restore from animating across the shelf on arrival.
      el.style.scrollBehavior = "auto";
      el.scrollLeft = left;
      el.style.scrollBehavior = "";
    }
    updateEdges();
  }, [scrollKey, updateEdges]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;

    function onScroll() {
      updateEdges();
      lastLeft.current = el!.scrollLeft;
      // Scroll fires per frame; only the resting position is worth storing.
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => writeScroll(scrollKey, lastLeft.current), 120);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      clearTimeout(saveTimer);
      // Leaving mid-debounce (tapping a card straight after a scroll) still
      // has to record where the reader was.
      writeScroll(scrollKey, lastLeft.current);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateEdges);
    };
  }, [scrollKey, updateEdges, slides.length]);

  function step(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const cards = el.querySelectorAll<HTMLElement>("[data-carousel-card]");
    // One card plus the gap between them, measured rather than assumed.
    const amount =
      cards.length > 1
        ? cards[1].offsetLeft - cards[0].offsetLeft
        : (cards[0]?.getBoundingClientRect().width ?? el.clientWidth) * 0.9;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // touch/pen keep native scrolling
    const el = trackRef.current;
    if (!el) return;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    // No pointer capture yet: while the track holds the capture the browser
    // fires the following `click` at the track instead of at the card's
    // link, so capturing on every press would stop cards from opening.
    // It is taken below, only once a real drag is under way.
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4 && !drag.current.moved) {
      drag.current.moved = true;
      // Now it is a drag, not a click — keep following the cursor even if it
      // leaves the track.
      el.setPointerCapture(e.pointerId);
    }
    if (!drag.current.moved) return;
    // `behavior: auto` overrides the track's scroll-smooth so the cards
    // track the cursor instead of easing behind it.
    el.scrollTo({ left: drag.current.startScroll - dx, behavior: "auto" });
  }

  function endDrag(e: ReactPointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    drag.current.active = false;
  }

  function onClickCapture(e: React.MouseEvent) {
    // A drag that ended over a card must not also open it.
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        className="no-scrollbar flex cursor-grab snap-x snap-mandatory gap-x-7 overflow-x-auto scroll-smooth pb-2 select-none active:cursor-grabbing"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            data-carousel-card
            className={cn("shrink-0 snap-start", itemClassName)}
          >
            {slide}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Scroll to previous"
        aria-hidden={!canPrev}
        tabIndex={canPrev ? 0 : -1}
        className={cn(
          "absolute top-[38%] -left-3.5 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)] transition-opacity duration-200 sm:-left-4.5",
          canPrev ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ChevronLeft className="size-4" strokeWidth={1.4} />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Scroll to more"
        aria-hidden={!canNext}
        tabIndex={canNext ? 0 : -1}
        className={cn(
          "absolute top-[38%] -right-3.5 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)] transition-opacity duration-200 sm:-right-4.5",
          canNext ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <ChevronRight className="size-4" strokeWidth={1.4} />
      </button>
    </div>
  );
}
