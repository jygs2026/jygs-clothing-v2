import { ALL_PRODUCTS } from "@/lib/data";
import type { Product } from "@/lib/types";

/**
 * Catalogue search, run in the browser over the whole product list. It is
 * deliberately small: the shop is forty pieces, so there is nothing to gain
 * from an index or a round trip. Every term has to match somewhere — typing
 * two words narrows rather than widens — and where it matched decides how
 * high the piece sits.
 */

type Indexed = {
  product: Product;
  name: string;
  /** Badge, cloth, note, colours and the slug, flattened for a loose match. */
  meta: string;
};

const INDEX: Indexed[] = ALL_PRODUCTS.map((product) => ({
  product,
  name: product.name.toLowerCase(),
  meta: [
    product.badge,
    product.cloth,
    product.note,
    product.id.replace(/-/g, " "),
    ...product.colors.map((color) => color.name),
  ]
    .join(" ")
    .toLowerCase(),
}));

/**
 * Where the panel sends people who are not searching for anything in
 * particular — the shelves and the two account pages worth a shortcut.
 */
export const QUICK_LINKS: { label: string; href: string }[] = [
  { label: "Premium collection", href: "/#collection" },
  { label: "Trending this month", href: "/#trending" },
  { label: "Customize yours", href: "/#customize" },
  { label: "Your orders", href: "/account/orders" },
  { label: "Wishlist", href: "/account/wishlist" },
];

function scoreTerm(entry: Indexed, term: string) {
  if (entry.name.startsWith(term)) return 10;
  if (entry.name.split(/\s+/).some((word) => word.startsWith(term))) return 8;
  if (entry.name.includes(term)) return 6;
  if (entry.product.colors.some((color) => color.name.toLowerCase().startsWith(term)))
    return 4;
  if (entry.product.badge.toLowerCase().includes(term)) return 3;
  if (entry.meta.includes(term)) return 2;
  return 0;
}

export function searchProducts(query: string, limit = 24): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const hits: { product: Product; score: number; name: string }[] = [];
  for (const entry of INDEX) {
    let total = 0;
    for (const term of terms) {
      const score = scoreTerm(entry, term);
      // One term with nowhere to land drops the piece entirely.
      if (score === 0) {
        total = 0;
        break;
      }
      total += score;
    }
    if (total > 0) hits.push({ product: entry.product, score: total, name: entry.name });
  }

  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return hits.slice(0, limit).map((hit) => hit.product);
}
