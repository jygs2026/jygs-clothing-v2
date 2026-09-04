import { daysBefore, pick, seeded } from "@/lib/admin/format";
import { ALL_PRODUCTS, priceToNumber } from "@/lib/data";
import { SIZES, type Product, type Size } from "@/lib/types";

/**
 * The catalogue as the studio manages it, built on top of the very products
 * the shop sells rather than a parallel list of its own. A name changed in
 * `data.ts` changes here too, which is the point: there is one catalogue.
 *
 * What the shop does not need to know — SKU, cost, stock by size, where a
 * piece is in its life — is added here, derived from the product so it stays
 * consistent without a second table to keep in step.
 */

export type ProductStatus = "Active" | "Draft" | "Archived";

export type StockRow = { size: Size; onHand: number; committed: number };

export type CatalogueItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  /** What the shop charges, in rupees. */
  price: number;
  /** What it costs the studio to make one. */
  cost: number;
  status: ProductStatus;
  stock: StockRow[];
  /** Sizes the shop is not currently cutting. */
  out: Size[];
  colours: number;
  cloth: string;
  image?: string;
  updated: string;
};

/**
 * Which shelf a piece belongs on, read off its name. The shop groups by
 * collection; the studio needs to group by what the thing actually is, and
 * the name is the only place that lives.
 */
const CATEGORY_RULES: [RegExp, string][] = [
  [/coat|jacket|parka|bomber|moto|quilted/i, "Outerwear"],
  [/overshirt|shirt|blouse|chambray|poplin/i, "Shirts"],
  [/hoodie|sweatshirt|sweater|cardigan|knit|crew\b/i, "Knitwear"],
  [/tee|t-shirt|print|blanks/i, "T-shirts"],
  [/trouser|pant|chino|cargo|jean/i, "Trousers"],
  [/dress|gown|slip|midi|tiered/i, "Dresses"],
  [/scarf|belt|cap|sock/i, "Accessories"],
];

export function categoryOf(name: string) {
  for (const [pattern, category] of CATEGORY_RULES) {
    if (pattern.test(name)) return category;
  }
  return "Other";
}

export const CATEGORIES = [
  "Outerwear",
  "Shirts",
  "Knitwear",
  "T-shirts",
  "Trousers",
  "Dresses",
  "Accessories",
  "Other",
];

/** JYGS-KNI-014 — shelf, then the position it was cut in. */
function skuFor(product: Product, index: number) {
  const shelf = categoryOf(product.name).slice(0, 3).toUpperCase();
  return `JYGS-${shelf}-${String(index + 1).padStart(3, "0")}`;
}

/** What is on the shelf, size by size. Deterministic — see `seeded`. */
function stockFor(product: Product, index: number): StockRow[] {
  const random = seeded(index * 31 + product.name.length);
  return SIZES.map((size) => {
    if (product.out.includes(size)) return { size, onHand: 0, committed: 0 };
    // The middle sizes carry the depth; the ends are cut thin on purpose.
    const depth = size === "M" || size === "L" ? 1 : 0.45;
    const onHand = Math.round(random() * 34 * depth);
    return { size, onHand, committed: Math.min(onHand, Math.round(random() * 4)) };
  });
}

export const CATALOGUE: CatalogueItem[] = ALL_PRODUCTS.map((product, index) => {
  const price = priceToNumber(product.price);
  const random = seeded(index * 7 + 3);
  return {
    id: product.id,
    sku: skuFor(product, index),
    name: product.name,
    category: categoryOf(product.name),
    price,
    // Between a third and a half of retail — what a short run in named cloth
    // actually costs before anyone is paid to sell it.
    cost: Math.round((price * (0.33 + random() * 0.17)) / 10) * 10,
    status:
      product.badge === "Made to order"
        ? "Active"
        : pick<ProductStatus>(
            ["Active", "Active", "Active", "Active", "Active", "Draft", "Archived"],
            index * 5
          ),
    stock: stockFor(product, index),
    out: product.out,
    colours: product.colors.length,
    cloth: product.cloth,
    image: product.image,
    updated: daysBefore(index % 47),
  };
});

export const CATALOGUE_BY_ID = new Map(CATALOGUE.map((item) => [item.id, item]));

/* ------------------------------------------------------------- derived */

export function onHand(item: CatalogueItem) {
  return item.stock.reduce((sum, row) => sum + row.onHand, 0);
}

export function committed(item: CatalogueItem) {
  return item.stock.reduce((sum, row) => sum + row.committed, 0);
}

/** What could still be sold today — what is on the shelf, less what is spoken for. */
export function available(item: CatalogueItem) {
  return onHand(item) - committed(item);
}

export function margin(item: CatalogueItem) {
  return item.price - item.cost;
}

export function marginPercent(item: CatalogueItem) {
  return item.price ? (margin(item) / item.price) * 100 : 0;
}

/** The line the studio reads before deciding what to cut next. */
export type StockLevel = "Out of stock" | "Low stock" | "In stock";

/** Below this, a piece is nearly gone and someone should be told. */
export const LOW_STOCK_AT = 12;

export function stockLevel(item: CatalogueItem): StockLevel {
  const left = available(item);
  if (left <= 0) return "Out of stock";
  if (left <= LOW_STOCK_AT) return "Low stock";
  return "In stock";
}

export const STOCK_LEVELS: StockLevel[] = ["In stock", "Low stock", "Out of stock"];
export const PRODUCT_STATUSES: ProductStatus[] = ["Active", "Draft", "Archived"];
