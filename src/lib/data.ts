import type {
  FitRow,
  Product,
  ProductSpec,
  Review,
  TrendingEntry,
} from "@/lib/types";

/**
 * Temporary stand-in photography, pulled from Unsplash by id. Swap `image`
 * on any Product for a real asset later — nothing else needs to change.
 */
function unsplash(photoId: string) {
  return `https://images.unsplash.com/photo-${photoId}?w=900&h=1150&fit=crop&q=80&auto=format`;
}

export const PRODUCTS: Product[] = [
  {
    id: "overshirt",
    name: "The Ash Overshirt",
    price: "₹24,500",
    badge: "Volume 01",
    cloth: "Japanese cotton twill, 9.5oz — unlined, boxy.",
    note: "Cut straight through the body with a dropped shoulder, so it layers over knitwear without pulling. Twill from Okayama, washed once before making so it stays the size you bought.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Ash", hex: "#9a9691" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: ["XS"],
    image: unsplash("1594938298603-c8148c4dae35"),
  },
  {
    id: "hoodie",
    name: "Loopback Hoodie",
    price: "₹18,000",
    badge: "Restocked",
    cloth: "Porto loopback, 480gsm — dense, dry hand.",
    note: "Heavier than it looks and cut a size closer than the market. It will keep its shape through a hundred washes; the hood will not go soft on you in the first month.",
    colors: [
      { name: "Chalk", hex: "#f0ece4" },
      { name: "Sable", hex: "#4a3c2f" },
    ],
    out: [],
    image: unsplash("1556821840-3a63f95609a7"),
  },
  {
    id: "overcoat",
    name: "Sable Wool Overcoat",
    price: "₹62,000",
    badge: "Made to order",
    cloth: "Italian wool melton, 720gsm — half-canvassed.",
    note: "Six weeks from your measurements, single-breasted, with a sleeve you can actually reach in. Melton woven in Biella; the canvas is stitched, not glued, so the chest breaks in to your posture.",
    colors: [
      { name: "Sable", hex: "#4a3c2f" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1539533018447-63fcce2678e3"),
  },
  {
    id: "slip",
    name: "Bias-Cut Slip Dress",
    price: "₹21,000",
    badge: "Few left",
    cloth: "Sandwashed silk, 19mm — cut on the true bias.",
    note: "The bias does the fitting, so it reads close without gripping. Finished with a French seam throughout and a strap you can shorten yourself by two centimetres.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Clay", hex: "#b08a6e" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: ["XL"],
    image: unsplash("1566174053879-31528523f8ae"),
  },
  {
    id: "crew",
    name: "Ribbed Merino Crew",
    price: "₹16,500",
    badge: "Volume 01",
    cloth: "Extra-fine merino, 12gg — full-needle rib.",
    note: "Knitted in one piece on a twelve-gauge frame, so the rib runs unbroken over the shoulder. Close through the body without gripping, and it holds its neck after a winter of pulling it on.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Ash", hex: "#9a9691" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: ["XS"],
    image: unsplash("1631541909061-71e349d1f203"),
  },
];

/**
 * Padding for the "Premium collection" carousel — placeholder pieces with
 * temporary stock photography, distinct from the curated five above. Give
 * one a `SPECS[id]` / `REVIEWS[id]` entry later and it behaves exactly like
 * the rest; until then the product page falls back to `DEFAULT_SPEC`.
 */
export const PREMIUM_EXTRA: Product[] = [
  {
    id: "crew-tee",
    name: "Everyday Crew Tee",
    price: "₹7,200",
    badge: "Volume 01",
    cloth: "Combed cotton jersey, 180gsm — pre-shrunk, garment-washed.",
    note: "The tee we reach for first — heavier than a basic, cut with a touch of drop at the shoulder so it layers clean under an overshirt.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1521572163474-6864f9cf17ab"),
  },
  {
    id: "linen-shirt",
    name: "Washed Linen Shirt",
    price: "₹15,800",
    badge: "Restocked",
    cloth: "European linen, 180gsm — stone-washed, open weave.",
    note: "Softens with every wash and never quite loses the crease, which is the point. Works buttoned to the throat or open over the crew tee.",
    colors: [
      { name: "Chalk", hex: "#f0ece4" },
      { name: "Olive", hex: "#5c5a42" },
    ],
    out: [],
    image: unsplash("1523381210434-271e8be1f52b"),
  },
  {
    id: "wool-trouser",
    name: "Relaxed Wool Trouser",
    price: "₹19,500",
    badge: "Volume 01",
    cloth: "Mid-weight wool flannel, 320gsm — pleated, tapered leg.",
    note: "A single pleat and a tapered leg keep it out of workwear territory. Half-lined through the seat and thigh so it sits properly in the colder months.",
    colors: [
      { name: "Charcoal", hex: "#35332f" },
      { name: "Ash", hex: "#9a9691" },
    ],
    out: ["XS"],
    image: unsplash("1441984904996-e0b6ba687e04"),
  },
  {
    id: "flannel-overshirt",
    name: "Brushed Flannel Overshirt",
    price: "₹17,900",
    badge: "Few left",
    cloth: "Brushed cotton flannel, 240gsm — double-faced, boxy cut.",
    note: "Brushed on both faces so it reads as soft as it looks. Big enough through the chest to sit over a sweater without pulling at the button line.",
    colors: [
      { name: "Rust", hex: "#a45a35" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1516762689617-e1cffcef479d"),
  },
  {
    id: "chino-pant",
    name: "Garment-Dyed Chino",
    price: "₹13,600",
    badge: "Restocked",
    cloth: "Brushed cotton twill, 300gsm — garment-dyed, straight leg.",
    note: "Dyed after cutting rather than in the yarn, so the colour sits slightly uneven — the good kind of uneven. Holds a crease without trying.",
    colors: [
      { name: "Clay", hex: "#b08a6e" },
      { name: "Sable", hex: "#4a3c2f" },
    ],
    out: [],
    image: unsplash("1490481651871-ab68de25d43d"),
  },
  {
    id: "boiled-cardigan",
    name: "Boiled Wool Cardigan",
    price: "₹24,500",
    badge: "Made to order",
    cloth: "Boiled merino wool, 420gsm — felted, shawl collar.",
    note: "The boiling felts the wool tight enough that it barely frays at a raw edge, so the collar and cuffs are left unfinished on purpose.",
    colors: [
      { name: "Forest", hex: "#2f4a3c" },
      { name: "Bone", hex: "#e6e0d5" },
    ],
    out: [],
    image: unsplash("1445205170230-053b83016050"),
  },
  {
    id: "utility-scarf",
    name: "Wool Utility Scarf",
    price: "₹6,800",
    badge: "Volume 01",
    cloth: "Lambswool, 450gsm — brushed, fringed edge.",
    note: "Heavy enough to sit flat rather than flap about, with a fringe that's knotted by hand rather than cut.",
    colors: [
      { name: "Camel", hex: "#b98d54" },
      { name: "Charcoal", hex: "#35332f" },
    ],
    out: [],
    image: unsplash("1490114538077-0a7f8cb49891"),
  },
  {
    id: "graphic-tee",
    name: "Graphic Cotton Tee",
    price: "₹8,400",
    badge: "Few left",
    cloth: "Slub cotton jersey, 200gsm — screen-printed, boxy.",
    note: "One motif, printed thick enough that it cracks slightly with age rather than peeling. Cut a size boxier than the everyday crew.",
    colors: [
      { name: "Ink", hex: "#23211f" },
      { name: "Ash", hex: "#9a9691" },
    ],
    out: [],
    image: unsplash("1503341504253-dff4815485f1"),
  },
  {
    id: "moto-jacket",
    name: "Lambskin Moto Jacket",
    price: "₹58,000",
    badge: "Made to order",
    cloth: "Lambskin leather, 1.1mm — asymmetric zip, quilted lining.",
    note: "Cut to your measurements from a single hide per jacket, so the grain runs the same way across both sleeves — most makers don't bother.",
    colors: [{ name: "Ink", hex: "#23211f" }],
    out: [],
    image: unsplash("1551028719-00167b16eac5"),
  },
  {
    id: "bomber-jacket",
    name: "Nylon Bomber Jacket",
    price: "₹22,000",
    badge: "Restocked",
    cloth: "Matte nylon shell, ripstop — down-alternative fill.",
    note: "Light enough to fold into its own pocket, warm enough to skip the coat until it's properly cold. Ribbed cuffs keep the draught out.",
    colors: [
      { name: "Rust", hex: "#a45a35" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1591047139829-d91aecb6caea"),
  },
  {
    id: "fleece-sweatshirt",
    name: "Fleece-Back Sweatshirt",
    price: "₹14,200",
    badge: "Volume 01",
    cloth: "Loopback fleece, 400gsm — raglan sleeve, raw hem.",
    note: "Fleece-backed rather than brushed, so it stays warm even after the loop gives out. The hem is cut raw and left to curl on its own.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Sable", hex: "#4a3c2f" },
    ],
    out: [],
    image: unsplash("1620799140408-edc6dcb6d633"),
  },
  {
    id: "pocket-tee",
    name: "Heavyweight Pocket Tee",
    price: "₹7,900",
    badge: "Restocked",
    cloth: "Ringspun cotton, 220gsm — chest pocket, side-seamed.",
    note: "Side-seamed like a proper shirt rather than tubular knit, so it doesn't twist in the wash. The pocket is functional, not decorative.",
    colors: [
      { name: "Chalk", hex: "#f0ece4" },
      { name: "Ash", hex: "#9a9691" },
    ],
    out: [],
    image: unsplash("1552374196-c4e7ffc6e126"),
  },
  {
    id: "poplin-shirt",
    name: "Cotton Poplin Shirt",
    price: "₹12,500",
    badge: "Few left",
    cloth: "Egyptian cotton poplin, 120gsm — mother-of-pearl buttons.",
    note: "Fine enough to fold flat into a bag, crisp enough to wear without pressing if you hang it straight from the wash.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Denim", hex: "#3f5468" },
    ],
    out: [],
    image: unsplash("1542060748-10c28b62716f"),
  },
  {
    id: "denim-jacket",
    name: "Rigid Denim Jacket",
    price: "₹19,900",
    badge: "Volume 01",
    cloth: "14oz rigid selvedge denim — unwashed, chain-stitched hem.",
    note: "Sold unwashed on purpose — it'll crease and fade to your own creases rather than someone else's, the way a good pair of raw jeans does.",
    colors: [{ name: "Denim", hex: "#3f5468" }],
    out: ["XL"],
    image: unsplash("1516257984-b1b4d707412e"),
  },
  {
    id: "silk-trouser",
    name: "Wide-Leg Silk Trouser",
    price: "₹21,000",
    badge: "Made to order",
    cloth: "Washed silk twill, 16mm — elastic back waist, wide leg.",
    note: "Cut wide enough through the leg to move properly, in a silk washed heavy enough that it drapes instead of clinging.",
    colors: [
      { name: "Clay", hex: "#b08a6e" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1509631179647-0177331693ae"),
  },
];

/**
 * Padding for the "Trending collections" carousel — a distinct 15 so the
 * two homepage carousels don't mirror each other one-for-one.
 */
export const TRENDING_EXTRA: Product[] = [
  {
    id: "tiered-dress",
    name: "Tiered Cotton Dress",
    price: "₹18,500",
    badge: "Volume 01",
    cloth: "Cotton voile, 100gsm — tiered skirt, adjustable straps.",
    note: "Three tiers of gathered voile so it moves rather than just hangs. Straps adjust enough to wear it two ways.",
    colors: [
      { name: "Chalk", hex: "#f0ece4" },
      { name: "Clay", hex: "#b08a6e" },
    ],
    out: [],
    image: unsplash("1515372039744-b8f02a3ae446"),
  },
  {
    id: "midi-dress",
    name: "Printed Midi Dress",
    price: "₹22,400",
    badge: "Few left",
    cloth: "Viscose crepe, 140gsm — bias-cut, hand-finished hem.",
    note: "The print is placed by hand on each panel so the pattern lines up at the side seam — most factories don't bother matching it.",
    colors: [
      { name: "Rust", hex: "#a45a35" },
      { name: "Bone", hex: "#e6e0d5" },
    ],
    out: [],
    image: unsplash("1500917293891-ef795e70e1f6"),
  },
  {
    id: "logo-tee",
    name: "Logo Cotton Tee",
    price: "₹6,900",
    badge: "Restocked",
    cloth: "Combed cotton jersey, 190gsm — puff-print logo.",
    note: "The logo is puff-printed rather than flat, so it holds its shape through the wash instead of cracking into the cloth.",
    colors: [
      { name: "Ink", hex: "#23211f" },
      { name: "Bone", hex: "#e6e0d5" },
    ],
    out: [],
    image: unsplash("1583743814966-8936f5b7be1a"),
  },
  {
    id: "relaxed-tee",
    name: "Relaxed Fit Tee",
    price: "₹7,400",
    badge: "Volume 01",
    cloth: "Slub cotton, 200gsm — dropped shoulder, side vents.",
    note: "Cut with a dropped shoulder and side vents so it sits away from the body without looking oversized on purpose.",
    colors: [
      { name: "Sable", hex: "#4a3c2f" },
      { name: "Ash", hex: "#9a9691" },
    ],
    out: [],
    image: unsplash("1490578474895-699cd4e2cf59"),
  },
  {
    id: "organic-tee",
    name: "Organic Cotton Tee",
    price: "₹8,100",
    badge: "Restocked",
    cloth: "Organic combed cotton, 210gsm — reinforced collar.",
    note: "The collar is double-stitched with a strip of jersey inside, so it keeps its shape after the cotton itself has softened.",
    colors: [
      { name: "Chalk", hex: "#f0ece4" },
      { name: "Charcoal", hex: "#35332f" },
    ],
    out: [],
    image: unsplash("1467043237213-65f2da53396f"),
  },
  {
    id: "colourblock-sweater",
    name: "Merino Colourblock Sweater",
    price: "₹23,800",
    badge: "Few left",
    cloth: "Extra-fine merino, 14gg — colourblocked, full-needle rib.",
    note: "Two colours knitted in on the same frame rather than seamed together after, so the join doesn't sit as a ridge under a coat.",
    colors: [
      { name: "Rust", hex: "#a45a35" },
      { name: "Ink", hex: "#23211f" },
      { name: "Bone", hex: "#e6e0d5" },
    ],
    out: [],
    image: unsplash("1489987707025-afc232f7ea0f"),
  },
  {
    id: "quilted-coat",
    name: "Quilted Field Coat",
    price: "₹34,500",
    badge: "Made to order",
    cloth: "Waxed cotton shell, quilted wool fill — corduroy collar.",
    note: "Waxed on the outside, quilted on the inside, with a corduroy collar that takes the wear a wool one wouldn't.",
    colors: [
      { name: "Olive", hex: "#5c5a42" },
      { name: "Sable", hex: "#4a3c2f" },
    ],
    out: [],
    image: unsplash("1544022613-e87ca75a784a"),
  },
  {
    id: "slip-gown",
    name: "Silk Slip Gown",
    price: "₹31,000",
    badge: "Made to order",
    cloth: "Silk satin, 22mm — full-length, cowl back.",
    note: "Cut on the true bias in a heavier silk than most slips use, so it skims rather than clings and holds its shape on the hanger.",
    colors: [
      { name: "Burgundy", hex: "#6b2737" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1595777457583-95e059d581b8"),
  },
  {
    id: "boyfriend-tee",
    name: "Boyfriend Fit Tee",
    price: "₹7,600",
    badge: "Volume 01",
    cloth: "Washed cotton jersey, 195gsm — dropped shoulder, longer body.",
    note: "A size up in the shoulder and two centimetres longer in the body, made to be worn loose rather than sized down.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Chalk", hex: "#f0ece4" },
    ],
    out: [],
    image: unsplash("1554568218-0f1715e72254"),
  },
  {
    id: "chambray-shirt",
    name: "Chambray Work Shirt",
    price: "₹13,900",
    badge: "Restocked",
    cloth: "Cotton chambray, 145gsm — twin chest pockets, box pleat.",
    note: "A proper box pleat at the back and two chest pockets built for actual use, in a chambray that fades the way denim does.",
    colors: [
      { name: "Denim", hex: "#3f5468" },
      { name: "Chalk", hex: "#f0ece4" },
    ],
    out: [],
    image: unsplash("1596755094514-f87e34085b2c"),
  },
  {
    id: "utility-jacket",
    name: "Cotton Utility Jacket",
    price: "₹26,500",
    badge: "Volume 01",
    cloth: "Cotton canvas, 320gsm — four patch pockets, corozo buttons.",
    note: "Four pockets, all of them deep enough to actually use, in a canvas heavy enough to wear as the outer layer through autumn.",
    colors: [
      { name: "Olive", hex: "#5c5a42" },
      { name: "Camel", hex: "#b98d54" },
    ],
    out: [],
    image: unsplash("1548883354-94bcfe321cbb"),
  },
  {
    id: "charmeuse-blouse",
    name: "Silk Charmeuse Blouse",
    price: "₹19,200",
    badge: "Few left",
    cloth: "Silk charmeuse, 19mm — French seams, tie neck.",
    note: "The tie neck can be knotted, looped or left open — French seams throughout so there's nothing to catch on the inside.",
    colors: [
      { name: "Bone", hex: "#e6e0d5" },
      { name: "Ink", hex: "#23211f" },
    ],
    out: [],
    image: unsplash("1608234807905-4466023792f5"),
  },
  {
    id: "cable-sweater",
    name: "Cable Knit Sweater",
    price: "₹21,500",
    badge: "Made to order",
    cloth: "Shetland wool, 7gg — hand-framed cable panel.",
    note: "The cable panel is hand-framed rather than machine-charted, so no two jumpers carry the cable at exactly the same tension.",
    colors: [
      { name: "Camel", hex: "#b98d54" },
      { name: "Forest", hex: "#2f4a3c" },
    ],
    out: [],
    image: unsplash("1556905055-8f358a7a47b2"),
  },
  {
    id: "cargo-pant",
    name: "Cotton Cargo Pant",
    price: "₹16,800",
    badge: "Restocked",
    cloth: "Cotton ripstop, 260gsm — articulated knee, tapered leg.",
    note: "The knee is articulated rather than flat-cut, so it doesn't bag out at the front after a week of wear.",
    colors: [
      { name: "Charcoal", hex: "#35332f" },
      { name: "Olive", hex: "#5c5a42" },
    ],
    out: [],
    image: unsplash("1552902865-b72c031ac5ea"),
  },
  {
    id: "tailored-coat",
    name: "Tailored Wool Coat",
    price: "₹48,000",
    badge: "Made to order",
    cloth: "Italian wool gabardine, 480gsm — single-breasted, wide lapel.",
    note: "A wider lapel and a longer body than the Sable overcoat, cut to your measurements from the same Biella mill.",
    colors: [
      { name: "Ink", hex: "#23211f" },
      { name: "Charcoal", hex: "#35332f" },
    ],
    out: [],
    image: unsplash("1554412933-514a83d2f3c8"),
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

/** Used for any product without a `SPECS` entry yet — keeps the detail page from crashing on placeholder items. */
export const DEFAULT_SPEC: ProductSpec = {
  mill: "Mill details to follow",
  weight: "Weight on request",
  fit: "Regular, true to size",
  finishing: "Details published once the run is finalised",
  fitNote:
    "True to size for most builds — write in if you're between sizes and we'll advise.",
  delivery: "Ships in three to five working days.",
  care: "Follow the care label; when in doubt, wash cold and line dry.",
  origin:
    "Part of the wider JYGS collection — full mill and origin notes are published as each piece is finalised.",
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
  { id: "overshirt", meta: "Look 01 · ₹24,500" },
  { id: "overcoat", meta: "Look 02 · ₹62,000" },
  { id: "hoodie", meta: "Look 03 · ₹18,000" },
  { id: "slip", meta: "Look 04 · ₹21,000" },
  { id: "crew", meta: "Look 05 · ₹16,500" },
];

export const TRENDING_META = [
  "312 sold · 48 left",
  "184 sold · cut to order",
  "260 sold · restocked once",
  "96 sold · 14 left",
  "148 sold · 60 left",
];

/** Every product the site knows about, real or placeholder — the single lookup source for routing and the bag. */
export const ALL_PRODUCTS: Product[] = [
  ...PRODUCTS,
  ...PREMIUM_EXTRA,
  ...TRENDING_EXTRA,
];

/** The "Premium collection" carousel: the curated five, padded to twenty. */
export const PREMIUM_COLLECTION: Product[] = [...PRODUCTS, ...PREMIUM_EXTRA];

/** The "Trending collections" carousel: product + its own sold/left line, twenty deep. */
export const TRENDING_COLLECTION: { product: Product; meta: string }[] = [
  { product: PRODUCTS[0], meta: TRENDING_META[0] }, // overshirt
  { product: PRODUCTS[2], meta: TRENDING_META[1] }, // overcoat
  { product: PRODUCTS[1], meta: TRENDING_META[2] }, // hoodie
  { product: PRODUCTS[3], meta: TRENDING_META[3] }, // slip
  { product: PRODUCTS[4], meta: TRENDING_META[4] }, // crew
  { product: TRENDING_EXTRA[0], meta: "271 sold · 22 left" },
  { product: TRENDING_EXTRA[1], meta: "203 sold · 9 left" },
  { product: TRENDING_EXTRA[2], meta: "418 sold · restocked twice" },
  { product: TRENDING_EXTRA[3], meta: "356 sold · 31 left" },
  { product: TRENDING_EXTRA[4], meta: "289 sold · 17 left" },
  { product: TRENDING_EXTRA[5], meta: "132 sold · 6 left" },
  { product: TRENDING_EXTRA[6], meta: "88 sold · cut to order" },
  { product: TRENDING_EXTRA[7], meta: "64 sold · cut to order" },
  { product: TRENDING_EXTRA[8], meta: "301 sold · 28 left" },
  { product: TRENDING_EXTRA[9], meta: "247 sold · restocked once" },
  { product: TRENDING_EXTRA[10], meta: "176 sold · 12 left" },
  { product: TRENDING_EXTRA[11], meta: "112 sold · 5 left" },
  { product: TRENDING_EXTRA[12], meta: "79 sold · cut to order" },
  { product: TRENDING_EXTRA[13], meta: "194 sold · 19 left" },
  { product: TRENDING_EXTRA[14], meta: "58 sold · cut to order" },
];

export function getProduct(id: string): Product | undefined {
  return ALL_PRODUCTS.find((p) => p.id === id);
}

export function priceToNumber(price: string): number {
  return Number(price.replace(/[^0-9]/g, ""));
}

export function formatMoney(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
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
