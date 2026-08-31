import type {
  FitRow,
  Product,
  ProductSpec,
  Review,
  TrendingEntry,
} from "@/lib/types";

export const PRODUCTS: Product[] = [
  {
    id: "overshirt",
    name: "The Ash Overshirt",
    price: "£245",
    badge: "Volume 01",
    cloth: "Japanese cotton twill, 9.5oz — unlined, boxy.",
    note: "Cut straight through the body with a dropped shoulder, so it layers over knitwear without pulling. Twill from Okayama, washed once before making so it stays the size you bought.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Ash", hex: "#9a9691" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: ["XS"],
  },
  {
    id: "hoodie",
    name: "Loopback Hoodie",
    price: "£180",
    badge: "Restocked",
    cloth: "Porto loopback, 480gsm — dense, dry hand.",
    note: "Heavier than it looks and cut a size closer than the market. It will keep its shape through a hundred washes; the hood will not go soft on you in the first month.",
    colors: [
      { name: "Chalk", hex: "#f0ece4" },
      { name: "Sable", hex: "#4a3c2f" },
    ],
    out: [],
  },
  {
    id: "overcoat",
    name: "Sable Wool Overcoat",
    price: "£620",
    badge: "Made to order",
    cloth: "Italian wool melton, 720gsm — half-canvassed.",
    note: "Six weeks from your measurements, single-breasted, with a sleeve you can actually reach in. Melton woven in Biella; the canvas is stitched, not glued, so the chest breaks in to your posture.",
    colors: [
      { name: "Sable", hex: "#4a3c2f" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
  },
  {
    id: "slip",
    name: "Bias-Cut Slip Dress",
    price: "£210",
    badge: "Few left",
    cloth: "Sandwashed silk, 19mm — cut on the true bias.",
    note: "The bias does the fitting, so it reads close without gripping. Finished with a French seam throughout and a strap you can shorten yourself by two centimetres.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Clay", hex: "#b08a6e" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: ["XL"],
  },
  {
    id: "crew",
    name: "Ribbed Merino Crew",
    price: "£165",
    badge: "Volume 01",
    cloth: "Extra-fine merino, 12gg — full-needle rib.",
    note: "Knitted in one piece on a twelve-gauge frame, so the rib runs unbroken over the shoulder. Close through the body without gripping, and it holds its neck after a winter of pulling it on.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Ash", hex: "#9a9691" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: ["XS"],
  },
];

export const SHOTS: { key: string; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "back", label: "Reverse" },
  { key: "shot-3", label: "Detail" },
  { key: "shot-4", label: "On figure" },
  { key: "shot-5", label: "Cloth" },
];

export const SPECS: Record<string, ProductSpec> = {
  overshirt: {
    mill: "Kuroki, Okayama — weaving since 1950",
    weight: "9.5oz / 322gsm",
    fit: "Boxy, dropped shoulder, straight hem",
    finishing: "Flat-felled seams, corozo buttons",
    fitNote:
      "Model is 183cm and wears M. Sits one size loose by design — take your usual size.",
    delivery: "In stock — ships in two working days.",
    care: "Machine wash cold on a short cycle and line dry. The twill was washed once before making, so it will not shrink further; it softens for about six months and then holds.",
    origin:
      "Cloth woven in Okayama, cut and sewn in our Porto workshop in a run of four hundred. The pattern retires when the run sells through.",
  },
  hoodie: {
    mill: "Somelos, Porto — at it since 1954",
    weight: "480gsm loopback",
    fit: "Close through the body, ribbed cuff",
    finishing: "Twin-needle seams, unbrushed loopback",
    fitNote:
      "Model is 178cm and wears M. Cut a size closer than the market — size up for room.",
    delivery: "Restocked — ships in two working days.",
    care: "Wash cold inside out, dry flat. Do not tumble: the loopback keeps its density and the hood keeps its structure if you let it dry in its own time.",
    origin:
      "Knitted, dyed and sewn within twenty kilometres in northern Portugal, on a mill floor we visit twice a year.",
  },
  overcoat: {
    mill: "Vitale Barberis, Biella",
    weight: "720gsm wool melton",
    fit: "Single-breasted, half-canvassed",
    finishing: "Stitched canvas, horn buttons, Bemberg lining",
    fitNote:
      "Cut to your measurements — no size chart. A fitting takes ten minutes by post.",
    delivery: "Made to order — six weeks from your measurements.",
    care: "Brush after wearing, air rather than dry-clean, and press with a cloth. Clean once a season at most; melton dislikes solvent more than it dislikes rain.",
    origin:
      "Melton woven in Biella, made up by two coatmakers in Porto. The chest canvas is stitched, not glued, so it breaks in to your posture.",
  },
  slip: {
    mill: "Sandwashed silk, 19mm",
    weight: "19mm / 84gsm",
    fit: "True bias, adjustable strap",
    finishing: "French seams throughout, rolled hem",
    fitNote:
      "Model is 175cm and wears S. The bias does the fitting — size down if between.",
    delivery: "Few left — ships in two working days.",
    care: "Hand wash cool with a little soap, roll in a towel, hang damp. Iron on the reverse at silk setting; the sandwash returns as it dries.",
    origin:
      "Silk sandwashed in Como and cut on the true bias in Porto, which takes twice the cloth and half again the time.",
  },
  crew: {
    mill: "Todd & Duncan, Kinross",
    weight: "12gg extra-fine merino",
    fit: "Close body, full-needle rib, set-in sleeve",
    finishing: "Linked shoulders, hand-finished neck",
    fitNote:
      "Model is 180cm and wears M. True to size — the rib gives where it needs to.",
    delivery: "In stock — ships in two working days.",
    care: "Hand wash cool or use a wool cycle, then dry flat. Never hang it wet: merino holds water heavily and the shoulder will drop if you let it.",
    origin:
      "Yarn spun in Kinross, knitted and linked in Porto on a twelve-gauge frame in a run of four hundred.",
  },
};

export const REVIEWS: Record<string, Review[]> = {
  overshirt: [
    {
      rating: 5,
      title: "Softened without slumping",
      name: "Anouk R.",
      size: "M",
      fit: "True to size",
      date: "July 2026",
      body: "Six months of near-daily wear and it has gone from board-stiff to something that falls properly, without the shoulder collapsing the way cheap twill does. The dropped shoulder is the whole point — it goes over a heavy crew and still buttons.",
    },
    {
      rating: 4,
      title: "Sleeves run long",
      name: "Tomás L.",
      size: "L",
      fit: "Runs large",
      date: "June 2026",
      body: "No complaints about the cloth, but I had two centimetres taken off each cuff. If you are under six foot expect a small alteration. The corozo buttons are the real tell that someone was paying attention.",
    },
    {
      rating: 5,
      title: "The only shirt I packed",
      name: "Devi S.",
      size: "S",
      fit: "True to size",
      date: "May 2026",
      body: "Wore it four days running on a trip and it never looked slept in. Rinsed it in a hotel sink and it dried by morning.",
    },
  ],
  hoodie: [
    {
      rating: 5,
      title: "Heavier than the photographs suggest",
      name: "Marcus O.",
      size: "M",
      fit: "Runs small",
      date: "August 2026",
      body: "It arrived and I genuinely weighed it. Four hundred and eighty grams reads as outerwear in autumn. Cut close, so I would size up if you want it slouchy — I did not, and it is right.",
    },
    {
      rating: 4,
      title: "Hood holds its shape",
      name: "Priya N.",
      size: "L",
      fit: "True to size",
      date: "June 2026",
      body: "Twelve washes in and the hood still stands up. That is the thing that usually goes first. Half a star off because the dry loopback catches on rings.",
    },
  ],
  overcoat: [
    {
      rating: 5,
      title: "Worth the six weeks",
      name: "Elena V.",
      size: "Made to measure",
      fit: "True to size",
      date: "July 2026",
      body: "I sent measurements by post with the tape they included and it came back fitting through the shoulder in a way no shop coat has. The stitched canvas has already started to take my posture.",
    },
    {
      rating: 5,
      title: "A sleeve you can reach in",
      name: "Callum B.",
      size: "Made to measure",
      fit: "True to size",
      date: "April 2026",
      body: "Sounds trivial until you own a coat you cannot drive in. Melton sheds a shower and airs out overnight. Have not dry-cleaned it once.",
    },
  ],
  slip: [
    {
      rating: 5,
      title: "The bias does the work",
      name: "Yara M.",
      size: "S",
      fit: "True to size",
      date: "August 2026",
      body: "Close without gripping anywhere, which is the whole difference between a bias cut and a straight one. French seams inside, so nothing scratches.",
    },
    {
      rating: 4,
      title: "Size down if between",
      name: "Noor H.",
      size: "M",
      fit: "Runs large",
      date: "June 2026",
      body: "Beautiful sandwash and it returns after washing exactly as promised. I should have taken the S — the M sits a little away from the body at the hip.",
    },
  ],
  crew: [
    {
      rating: 5,
      title: "Rib runs unbroken",
      name: "Sofia K.",
      size: "M",
      fit: "True to size",
      date: "August 2026",
      body: "You can see the twelve-gauge in how the rib carries over the shoulder without a seam interrupting it. Neck has not gone slack after a winter of pulling it on.",
    },
    {
      rating: 4,
      title: "Fine merino, so treat it as such",
      name: "James P.",
      size: "L",
      fit: "True to size",
      date: "May 2026",
      body: "Warmer than the weight implies and no itch at all. Dry it flat — I hung one wet early on and learned the lesson quickly.",
    },
  ],
};

export const FIT_TABLE: FitRow[] = [
  { size: "XS", chest: "96", waist: "80", length: "66" },
  { size: "S", chest: "102", waist: "86", length: "68" },
  { size: "M", chest: "108", waist: "92", length: "70" },
  { size: "L", chest: "114", waist: "98", length: "72" },
  { size: "XL", chest: "120", waist: "104", length: "74" },
];

export const TRENDING: TrendingEntry[] = [
  { id: "overshirt", meta: "Look 01 · £245" },
  { id: "overcoat", meta: "Look 02 · £620" },
  { id: "hoodie", meta: "Look 03 · £180" },
  { id: "slip", meta: "Look 04 · £210" },
  { id: "crew", meta: "Look 05 · £165" },
];

export const TRENDING_META = [
  "312 sold · 48 left",
  "184 sold · cut to order",
  "260 sold · restocked once",
  "96 sold · 14 left",
  "148 sold · 60 left",
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function priceToNumber(price: string): number {
  return Number(price.replace(/[^0-9]/g, ""));
}

export function formatMoney(n: number): string {
  return "£" + n.toLocaleString("en-GB");
}

/**
 * Only four real lifestyle photographs came with the design (a single
 * editorial shoot). They stand in for hero / lookbook imagery; individual
 * product galleries use the placeholder treatment instead of mismatched
 * photography.
 */
export const LOOKBOOK_IMAGES = [
  "/images/lookbook-hero.webp",
  "/images/lookbook-01.webp",
  "/images/lookbook-02.webp",
  "/images/lookbook-03.webp",
];
