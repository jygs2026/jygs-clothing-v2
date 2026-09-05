"use client";

import { useEffect, useState } from "react";

import { LogoMark } from "@/components/logo-mark";

/*
 * The sequence, in milliseconds. `HOLD` is how long the mark stands before
 * the veil starts lifting; `LIFT` is the lift itself, and has to agree with
 * the transition in `globals.css` — it is the timer here that takes the veil
 * out of the DOM, so if it were the shorter of the two the curtain would
 * vanish mid-travel.
 */
const HOLD = 1250;
const LIFT = 780;

/** The same beat with the travel taken out, for reduced motion. */
const REDUCED_HOLD = 400;
const REDUCED_LIFT = 200;

/**
 * The shop's opening screen: the ram, the wordmark, and a hairline that draws
 * across while the page settles behind it.
 *
 * It plays on every full page load — a reload included. Moving between pages
 * does not bring it back, because that is a client-side navigation and this
 * component is never unmounted by one; it only remounts when the document
 * does.
 *
 * The animation itself is all CSS (see `.jygs-intro` in `globals.css`) so it
 * is already running on the first paint, before React has hydrated. All this
 * decides is when the veil leaves.
 */
export function IntroVeil() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hold = reduced ? REDUCED_HOLD : HOLD;
    const lift = reduced ? REDUCED_LIFT : LIFT;

    // Nothing behind the curtain should scroll away while it is up.
    const release = () => {
      document.body.style.overflow = "";
    };
    document.body.style.overflow = "hidden";

    const toLeave = setTimeout(() => setLeaving(true), hold);
    const toEnd = setTimeout(() => {
      setGone(true);
      release();
    }, hold + lift);

    return () => {
      clearTimeout(toLeave);
      clearTimeout(toEnd);
      release();
    };
  }, []);

  if (gone) return null;

  return (
    // Decorative throughout: the page underneath is already in the document
    // and already announced, so there is nothing here to read out.
    <div
      className="jygs-intro"
      data-leaving={leaving ? "" : undefined}
      aria-hidden="true"
    >
      <div className="jygs-intro-content">
        <LogoMark size={128} priority className="jygs-intro-mark" />
        <span className="jygs-intro-word">JYGS</span>
        {/*
          * What the four letters stand for. The veil is the one screen with
          * the room to say it — in the header it would be a second wordmark
          * competing with the first, and on a product page nobody is reading
          * it. Here it arrives after the wordmark, as its explanation.
          */}
        <span className="jygs-intro-full">
          Journey of Young Generation Style
        </span>
        <span className="jygs-intro-rule">
          <span />
        </span>
      </div>
    </div>
  );
}
