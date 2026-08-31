const PILLARS = [
  {
    title: "Short runs, on purpose",
    body: "Four hundred pieces per volume. When a pattern sells through we retire it rather than re-cut it thinner. The waitlist exists so we make what is wanted and not a warehouse of what isn't.",
  },
  {
    title: "Cloth we can name",
    body: "Japanese cotton twill, Italian wool melton, loopback from a Porto mill that has been at it since 1954. Every piece lists its mill, its weight and how it will move in the third year.",
  },
  {
    title: "Made to order, mended free",
    body: "Tailoring and outerwear are cut to your measurements in six weeks. Bring anything of ours back for repair, for as long as you own it — we would rather mend than sell you a second one.",
  },
];

export function Atelier() {
  return (
    <section
      id="atelier"
      className="grid grid-cols-1 gap-8 py-16 sm:grid-cols-3 sm:gap-x-14"
    >
      {PILLARS.map((pillar) => (
        <div key={pillar.title}>
          <h3 className="mb-3.5 font-heading text-2xl font-normal leading-tight">
            {pillar.title}
          </h3>
          <p className="text-justify text-[15px] leading-7 text-foreground/76 [hyphens:auto]">
            {pillar.body}
          </p>
        </div>
      ))}
    </section>
  );
}
