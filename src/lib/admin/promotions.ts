import type { Tone } from "@/components/admin/status-pill";
import { AS_OF, daysBefore } from "@/lib/admin/format";

/**
 * Codes, launch offers and waitlist releases. Unlike orders and returns
 * these are not derived from anything — a promotion is a decision somebody
 * made, not a consequence of other records — so they are written out.
 */

export type PromotionKind = "Percent off" | "Amount off" | "Free shipping" | "Gift";

export type Promotion = {
  id: string;
  code: string;
  name: string;
  kind: PromotionKind;
  /** Percent, or rupees, depending on `kind`. */
  value: number;
  /** Rupees a basket must reach. 0 for none. */
  minimum: number;
  used: number;
  /** 0 means no ceiling. */
  limit: number;
  starts: string;
  ends: string;
  active: boolean;
};

export const PROMOTION_KINDS: PromotionKind[] = [
  "Percent off",
  "Amount off",
  "Free shipping",
  "Gift",
];

type Seed = [
  code: string,
  name: string,
  kind: PromotionKind,
  value: number,
  minimum: number,
  used: number,
  limit: number,
  from: number,
  to: number,
  active: boolean,
];

const SEED: Seed[] = [
  ["VOLUME01", "Volume 01 launch", "Percent off", 15, 20000, 412, 500, 24, -20, true],
  ["WAITLIST", "Waitlist early access", "Percent off", 10, 0, 188, 400, 60, -6, true],
  ["FIRSTCUT", "First order", "Amount off", 2000, 15000, 634, 0, 210, -120, true],
  ["SHIPFREE", "Free shipping over ₹10,000", "Free shipping", 0, 10000, 1290, 0, 300, -180, true],
  ["ATELIER", "Atelier appointment gift", "Gift", 0, 40000, 46, 100, 120, -30, true],
  ["RESTOCK24", "Loopback restock", "Percent off", 12, 0, 97, 150, 40, 4, false],
  ["WINTER25", "Winter closing", "Percent off", 25, 0, 803, 800, 260, 190, false],
  ["STUDIO5", "Studio visit", "Amount off", 5000, 30000, 21, 50, 14, -45, true],
  ["FRIENDS", "Friends of the studio", "Percent off", 20, 0, 158, 250, 150, -90, true],
  ["SUMMER26", "Summer weights", "Percent off", 10, 12000, 341, 600, 95, 30, false],
];

export const ALL_PROMOTIONS: Promotion[] = SEED.map(
  ([code, name, kind, value, minimum, used, limit, from, to, active], i) => ({
    id: `pr-${String(i + 1).padStart(3, "0")}`,
    code,
    name,
    kind,
    value,
    minimum,
    used,
    limit,
    starts: daysBefore(from),
    ends: daysBefore(to),
    active,
  })
);

export type PromotionState = "Running" | "Scheduled" | "Ended" | "Paused";

/**
 * What a promotion is actually doing today, worked out from its dates, its
 * ceiling and whether it is switched on. Stored state would go stale the
 * morning a promotion ends and nobody was watching.
 */
export function stateOf(promotion: Promotion): PromotionState {
  const today = AS_OF.toISOString().slice(0, 10);
  if (!promotion.active) return "Paused";
  if (promotion.starts > today) return "Scheduled";
  if (promotion.ends < today) return "Ended";
  if (promotion.limit && promotion.used >= promotion.limit) return "Ended";
  return "Running";
}

export const PROMOTION_STATES: PromotionState[] = [
  "Running",
  "Scheduled",
  "Paused",
  "Ended",
];

export const PROMOTION_TONE: Record<PromotionState, Tone> = {
  Running: "good",
  Scheduled: "info",
  Paused: "warn",
  Ended: "neutral",
};

/** "15% off" / "₹2,000 off" / "Free shipping" — the offer in one phrase. */
export function offerOf(promotion: Promotion) {
  switch (promotion.kind) {
    case "Percent off":
      return `${promotion.value}% off`;
    case "Amount off":
      return `₹${promotion.value.toLocaleString("en-IN")} off`;
    case "Free shipping":
      return "Free shipping";
    default:
      return "Gift with order";
  }
}
