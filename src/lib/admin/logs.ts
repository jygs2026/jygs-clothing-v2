import type { Tone } from "@/components/admin/status-pill";
import { AS_OF, pick, seeded } from "@/lib/admin/format";
import { SEED_USERS } from "@/lib/admin/directory";
import { ALL_ORDERS } from "@/lib/admin/orders";
import { CATALOGUE } from "@/lib/admin/catalogue";

/**
 * A plain record of what changed in the studio, by whom and when. Entries are
 * built from things that actually exist — the staff who could have done them
 * and the orders and pieces they were done to — so a line in the log can be
 * followed back to the record it describes.
 */

export type LogLevel = "Info" | "Notice" | "Warning" | "Error";

export type LogEntry = {
  id: string;
  at: string;
  actor: string;
  actorHandle: string;
  action: string;
  /** What was acted on — an order number, a SKU, an email. */
  subject: string;
  area: string;
  level: LogLevel;
  ip: string;
};

export const LOG_LEVELS: LogLevel[] = ["Info", "Notice", "Warning", "Error"];

export const LOG_TONE: Record<LogLevel, Tone> = {
  Info: "neutral",
  Notice: "info",
  Warning: "warn",
  Error: "bad",
};

type Shape = [action: string, area: string, level: LogLevel];

const SHAPES: Shape[] = [
  ["Signed in", "Auth", "Info"],
  ["Signed out", "Auth", "Info"],
  ["Failed sign-in", "Auth", "Warning"],
  ["Marked order delivered", "Orders", "Info"],
  ["Cancelled order", "Orders", "Notice"],
  ["Issued refund", "Payments", "Notice"],
  ["Adjusted stock", "Inventory", "Info"],
  ["Changed price", "Pricing", "Notice"],
  ["Published product", "Products", "Info"],
  ["Archived product", "Products", "Notice"],
  ["Created promotion", "Promotions", "Info"],
  ["Ended promotion", "Promotions", "Info"],
  ["Edited role permissions", "Users & Roles", "Warning"],
  ["Invited a user", "Users & Roles", "Info"],
  ["Exported customers", "Customers", "Notice"],
  ["Payout gateway timed out", "Payments", "Error"],
  ["Changed shipping settings", "Settings", "Notice"],
  ["Bulk stock import failed", "Inventory", "Error"],
];

const AREAS = [...new Set(SHAPES.map(([, area]) => area))];
export const LOG_AREAS = AREAS;

/** Six hundred lines, newest first — enough that paging and filtering matter. */
export const ALL_LOGS: LogEntry[] = Array.from({ length: 600 }, (_, i) => {
  const random = seeded(i * 41 + 7);
  const [action, area, level] = pick(SHAPES, i * 13 + Math.floor(random() * 5));
  const user = SEED_USERS[(i * 7) % SEED_USERS.length];

  const subject =
    area === "Orders" || area === "Payments"
      ? ALL_ORDERS[(i * 11) % ALL_ORDERS.length].no
      : area === "Products" || area === "Inventory" || area === "Pricing"
        ? CATALOGUE[(i * 5) % CATALOGUE.length].sku
        : area === "Customers"
          ? `${(i % 40) + 12} records`
          : SEED_USERS[(i * 3) % SEED_USERS.length].email;

  // Roughly one entry every ninety minutes, walking back from now.
  const at = new Date(AS_OF.getTime() - i * 5_400_000 - Math.floor(random() * 2_400_000));

  return {
    id: `lg-${String(600 - i).padStart(4, "0")}`,
    at: at.toISOString(),
    actor: user.name,
    actorHandle: user.handle,
    action,
    subject,
    area,
    level,
    ip: `10.${20 + (i % 8)}.${i % 256}.${(i * 7) % 256}`,
  };
});
