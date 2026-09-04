/**
 * How the studio writes numbers, money and time. Every admin screen reads
 * from here so a date on the dashboard, in a customer's history and in the
 * system log are the same date written the same way.
 */

/**
 * The mock's "today". Relative times have to be measured against a fixed
 * point rather than the real clock: a statically rendered page would
 * otherwise disagree with the browser that hydrates it, and every reload
 * would quietly reshuffle anything sorted by recency.
 *
 * One constant for the whole admin — swapping it for `new Date()` is the
 * single edit that makes all of this live.
 */
export const AS_OF = new Date("2026-09-04T09:00:00Z");

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/* ------------------------------------------------------------------ time */

function plural(n: number, unit: string) {
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}

/** "3 hours ago", against the mock's fixed today. */
export function timeAgo(iso: string) {
  if (!iso) return "Never";
  const minutes = Math.round((AS_OF.getTime() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return plural(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return plural(hours, "hour");
  const days = Math.round(hours / 24);
  if (days < 31) return plural(days, "day");
  const months = Math.round(days / 30);
  if (months < 12) return plural(months, "month");
  return plural(Math.round(months / 12), "year");
}

/** "26 May 2026" — the studio writes dates the long way. */
export function formatDate(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "26 May" — for axes and dense lists, where the year is understood. */
export function formatDayMonth(iso: string) {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/** "26 May 2026, 14:32" — for a log, where the minute matters. */
export function formatMoment(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/** Whole days between an ISO date and the mock's today. */
export function daysSince(iso: string) {
  return Math.round(
    (AS_OF.getTime() - new Date(`${iso.slice(0, 10)}T00:00:00Z`).getTime()) / 86_400_000
  );
}

/** An ISO date `days` before the mock's today. */
export function daysBefore(days: number) {
  return new Date(AS_OF.getTime() - days * 86_400_000).toISOString().slice(0, 10);
}

/* ----------------------------------------------------------------- money */

/** "₹24,500" — Indian grouping, no paise. The studio does not price in paise. */
export function money(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/**
 * "₹49.5L" — for a tile that has to hold a seven-figure number in the same
 * space as a two-figure one. Indian scale, because the reader is.
 */
export function moneyShort(n: number) {
  const abs = Math.abs(n);
  if (abs >= 10_000_000) return `₹${trim(n / 10_000_000)}Cr`;
  if (abs >= 100_000) return `₹${trim(n / 100_000)}L`;
  if (abs >= 1_000) return `₹${trim(n / 1_000)}k`;
  return money(n);
}

function trim(n: number) {
  // One decimal, but never a trailing ".0" — "₹5L" reads better than "₹5.0L".
  return n.toFixed(1).replace(/\.0$/, "");
}

/** "1,248" — plain counts, grouped the same way as money. */
export function count(n: number) {
  return n.toLocaleString("en-IN");
}

/** "38%" of a whole, or an em dash when there is no whole to be part of. */
export function percent(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

/** "+12.4%" / "−3.1%" — a change against a previous period. */
export function delta(now: number, before: number) {
  if (!before) return null;
  const change = ((now - before) / before) * 100;
  const sign = change >= 0 ? "+" : "−";
  return { change, label: `${sign}${Math.abs(change).toFixed(1)}%`, up: change >= 0 };
}

/**
 * A small deterministic pseudo-random source. Mock data has to be identical
 * on the server and in the browser — `Math.random()` would produce a
 * different table on each and fail hydration — so anything "random" here is
 * a pure function of a seed.
 */
export function seeded(seed: number) {
  let state = (seed * 2654435761) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Picks from a list by seed, without consuming a generator. */
export function pick<T>(list: readonly T[], seed: number): T {
  return list[Math.abs(seed) % list.length];
}
