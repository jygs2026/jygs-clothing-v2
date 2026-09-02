export type Size = "XS" | "S" | "M" | "L" | "XL";

export const SIZES: Size[] = ["XS", "S", "M", "L", "XL"];

export type ProductBadge =
  | "Volume 01"
  | "Restocked"
  | "Made to order"
  | "Few left"
  | "Customizable";

export type ProductColor = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  badge: ProductBadge;
  cloth: string;
  note: string;
  colors: ProductColor[];
  out: Size[];
  /** Temporary remote photo — falls back to the illustrated placeholder when unset or unreachable. */
  image?: string;
};

export type ProductSpec = {
  mill: string;
  weight: string;
  fit: string;
  finishing: string;
  fitNote: string;
  delivery: string;
  care: string;
  origin: string;
};

export type Review = {
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  name: string;
  size: string;
  fit: "Runs small" | "True to size" | "Runs large";
  date: string;
  body: string;
};

export type FitRow = {
  size: Size;
  chest: string;
  waist: string;
  length: string;
};

/** The three kinds of piece the studio will personalise. */
export type CustomFamily = "Couples" | "Friends" | "Quotes";

export type CustomTee = {
  /** A real product — it can go in the bag and through checkout as-is. */
  product: Product;
  family: CustomFamily;
  /** What can be changed on this piece when someone asks. */
  pitch: string;
  lead: string;
  alt: string;
};

export type HeroSlide = {
  id: string;
  /** Wide editorial photograph, full-bleed behind the headline. */
  image: string;
  alt: string;
};

export type TrendingEntry = {
  id: string;
  meta: string;
};

export type BagLine = {
  key: string;
  productId: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unit: number;
};

export type CheckoutStep = "bag" | "details" | "payment" | "done";

export type Order = {
  no: string;
  email: string;
  shipTo: string;
  paid: string;
  count: number;
};
