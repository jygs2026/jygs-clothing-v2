const ITEMS = [
  "Volume 01 — Ash & Bone",
  "Cut in London, sewn in Porto",
  "400 pieces, then the pattern rests",
  "Waitlist closes 12 September",
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      aria-hidden={ariaHidden}
      className="flex flex-none gap-11 pr-11 text-[11.5px] tracking-[0.16em] text-nowrap text-foreground/58 uppercase font-feature-tnum"
    >
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-11">
          <span>{item}</span>
          <span className="text-accent-2">◦</span>
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="overflow-hidden border-b border-border py-2.5">
      <div
        className="flex w-max motion-safe:animate-[jygs-marquee_34s_linear_infinite]"
      >
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}
