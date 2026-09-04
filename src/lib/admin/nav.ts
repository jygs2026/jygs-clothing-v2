import {
  Boxes,
  ChartColumn,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  Shirt,
  Store,
  Tags,
  Undo2,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** One line on what the section is for — the page's own standfirst. */
  blurb: string;
  /**
   * What the top bar's search box offers while this section is open. Only
   * sections that actually take a `q` set it; everywhere else the box keeps
   * reaching for the catalogue, which is what it is most often wanted for.
   */
  searchHint?: string;
  /**
   * Whether the entry starts a new block in the rail. Thirteen links in one
   * unbroken column read as a wall; the hairline before "Reports" and before
   * "Settings" splits the day's work from what is only looked at, and that
   * from what is configured once.
   */
  startsBlock?: boolean;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    blurb: "The run at a glance — what sold, what is moving and what needs a decision today.",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ClipboardList,
    startsBlock: true,
    blurb: "Every order from placed to delivered, with the ones waiting on the bench first.",
  },
  {
    href: "/admin/returns",
    label: "Returns",
    icon: Undo2,
    blurb: "Pieces coming back: the reason given, the condition found and what was refunded.",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Shirt,
    blurb: "The catalogue — cloth, colours, sizes and photography for every piece in the run.",
  },
  {
    href: "/admin/inventory",
    label: "Inventory",
    icon: Boxes,
    blurb: "Stock by size and colour: what is cut, what is committed and what is left.",
  },
  {
    href: "/admin/pricing",
    label: "Pricing",
    icon: Tags,
    blurb: "What each piece costs to make and what it sells for, across every market.",
  },
  {
    href: "/admin/promotions",
    label: "Promotions",
    icon: Megaphone,
    blurb: "Codes, launch offers and waitlist releases, with the dates they run.",
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: Users,
    searchHint: "Search customers by name, email or phone…",
    blurb: "Who buys, what they keep, and how to reach them when a run is ready.",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: ChartColumn,
    startsBlock: true,
    blurb: "Sales, returns and sell-through over time — the numbers behind the dashboard.",
  },
  {
    href: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
    blurb: "Takings, refunds and payouts, reconciled against what the orders say.",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    startsBlock: true,
    blurb: "How the shop behaves: shipping, taxes, and the studio's own details.",
  },
  {
    href: "/admin/users",
    label: "Users & Roles",
    icon: UserCog,
    searchHint: "Search users by name, email or role…",
    blurb: "Who may open this door, and how much of the studio each of them sees.",
  },
  {
    href: "/admin/logs",
    label: "System Logs",
    icon: ScrollText,
    blurb: "A plain record of what changed in the studio, by whom and when.",
  },
];

export type AdminTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  /**
   * Leaves the studio. Such a tab is never lit as the current section — it
   * is somewhere to go, not somewhere you are.
   */
  leavesAdmin?: boolean;
};

/** Pulls a tab's label and icon from the nav, so the two cannot drift apart. */
function tabFor(href: string): AdminTab {
  const item = ADMIN_NAV.find((entry) => entry.href === href);
  if (!item) throw new Error(`ADMIN_TABS names ${href}, which is not in ADMIN_NAV`);
  return { href: item.href, label: item.label, icon: item.icon };
}

/**
 * The phone's bottom bar. Five places, no overflow entry: thirteen links do
 * not fit across 360px, and the side menu already reaches every one of them,
 * so a sixth tab that only opens that menu would be a tab spent on nothing.
 *
 * The shop sits in the middle because it is the one tab that is not a
 * section of the studio — it is the way out to what customers see.
 */
export const ADMIN_TABS: AdminTab[] = [
  tabFor("/admin"),
  tabFor("/admin/products"),
  { href: "/", label: "Shop Mode", icon: Store, leavesAdmin: true },
  tabFor("/admin/promotions"),
  tabFor("/admin/reports"),
];

/**
 * Which entry the current URL belongs to. Longest match wins, so
 * `/admin/orders/JYGS-1042` still lights up "Orders" while `/admin` itself
 * only ever matches the dashboard.
 */
export function activeAdminHref(pathname: string) {
  let best = "";
  for (const { href } of ADMIN_NAV) {
    const matches =
      href === "/admin"
        ? pathname === "/admin"
        : pathname === href || pathname.startsWith(`${href}/`);
    if (matches && href.length > best.length) best = href;
  }
  return best;
}

/** The page title for a route, used by the topbar's breadcrumb. */
export function adminTitleFor(pathname: string) {
  const href = activeAdminHref(pathname);
  return ADMIN_NAV.find((item) => item.href === href)?.label ?? "Admin";
}

/**
 * Where the top bar's search sends you, and what it says it will look
 * through. It follows whichever section is open so the one box is never
 * offering the catalogue while you are looking at a list of people.
 */
export function adminSearchFor(pathname: string) {
  const href = activeAdminHref(pathname);
  const item = ADMIN_NAV.find((entry) => entry.href === href);
  return item?.searchHint
    ? { href: item.href, placeholder: item.searchHint }
    : {
        href: "/admin/products",
        placeholder: "Search products by name, SKU or category…",
      };
}
