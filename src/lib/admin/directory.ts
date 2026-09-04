import { AS_OF } from "@/lib/admin/format";
import {
  ALL_PERMISSIONS,
  VIEW_PERMISSIONS,
  permissionsFor,
} from "@/lib/admin/permissions";

/**
 * Stand-in staff records for the Users & Roles module. Nothing here is
 * fetched — the shapes are what a real users table would hold, so the screens
 * survive being pointed at a database later.
 */

export type UserStatus = "Active" | "Inactive" | "Invited";

export type AdminUser = {
  id: string;
  name: string;
  /** The studio's internal handle, shown under the name. */
  handle: string;
  email: string;
  roleCode: string;
  status: UserStatus;
  /** ISO timestamp. Rendered relative to AS_OF. */
  lastActive: string;
  /** ISO date. */
  createdAt: string;
};

export type AdminRole = {
  code: string;
  name: string;
  description: string;
  permissions: string[];
  active: boolean;
  /** Built in, so it cannot be deleted and its grants cannot be edited away. */
  system?: boolean;
};

export const SEED_ROLES: AdminRole[] = [
  {
    code: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Full access to every module and setting, including this one.",
    permissions: ALL_PERMISSIONS,
    active: true,
    system: true,
  },
  {
    code: "ADMIN",
    name: "Admin",
    description: "Runs the shop day to day. Everything except roles and payouts.",
    permissions: permissionsFor(
      "dashboard",
      "orders",
      "returns",
      "products",
      "inventory",
      "pricing",
      "promotions",
      "customers",
      "reports",
      "payments.view",
      "payments.refund",
      "settings",
      "users.view",
      "logs"
    ),
    active: true,
    system: true,
  },
  {
    code: "MANAGER",
    name: "Manager",
    description: "The run itself — orders, stock and the pieces in it.",
    permissions: permissionsFor(
      "dashboard",
      "orders",
      "returns.view",
      "returns.approve",
      "products.view",
      "products.edit",
      "inventory",
      "pricing.view",
      "customers.view",
      "reports.view"
    ),
    active: true,
  },
  {
    code: "STAFF",
    name: "Staff",
    description: "Packs and ships. Sees orders and stock, changes neither price nor piece.",
    permissions: permissionsFor(
      "dashboard.view",
      "orders.view",
      "orders.edit",
      "returns.view",
      "products.view",
      "inventory.view",
      "inventory.adjust",
      "customers.view"
    ),
    active: true,
  },
  {
    code: "VIEWER",
    name: "Viewer",
    description: "Read-only. For the accountant and anyone else who only looks.",
    permissions: VIEW_PERMISSIONS,
    active: true,
  },
];

/** Hours before AS_OF, as an ISO string — keeps the seed readable. */
function hoursAgo(hours: number) {
  return new Date(AS_OF.getTime() - hours * 3_600_000).toISOString();
}

type Seed = [name: string, handle: string, role: string, status: UserStatus, activeHrs: number, created: string];

const SEED: Seed[] = [
  ["Arjun Menon", "arjun.m", "SUPER_ADMIN", "Active", 2, "2026-05-26"],
  ["Vikram Singh", "vikram.s", "ADMIN", "Active", 26, "2026-05-25"],
  ["Karthik Raman", "karthik.r", "MANAGER", "Active", 3, "2026-05-24"],
  ["Rahul Sharma", "rahul.s", "STAFF", "Active", 5, "2026-05-24"],
  ["Siddharth Jain", "siddharth.j", "STAFF", "Inactive", 72, "2026-05-20"],
  ["Meera Iyer", "meera.i", "ADMIN", "Active", 1, "2026-05-18"],
  ["Ananya Rao", "ananya.r", "MANAGER", "Active", 8, "2026-05-14"],
  ["Nikhil Verma", "nikhil.v", "STAFF", "Active", 11, "2026-05-11"],
  ["Divya Pillai", "divya.p", "VIEWER", "Active", 30, "2026-05-09"],
  ["Rohan Desai", "rohan.d", "STAFF", "Active", 4, "2026-05-02"],
  ["Sneha Kulkarni", "sneha.k", "MANAGER", "Active", 22, "2026-04-28"],
  ["Aditya Nair", "aditya.n", "STAFF", "Inactive", 340, "2026-04-21"],
  ["Priya Balan", "priya.b", "ADMIN", "Active", 6, "2026-04-16"],
  ["Kavya Suresh", "kavya.s", "STAFF", "Active", 13, "2026-04-09"],
  ["Ishaan Gupta", "ishaan.g", "MANAGER", "Active", 48, "2026-04-03"],
  ["Tara Krishnan", "tara.k", "STAFF", "Active", 2, "2026-03-27"],
  ["Manav Joshi", "manav.j", "VIEWER", "Active", 96, "2026-03-19"],
  ["Lakshmi Venkat", "lakshmi.v", "STAFF", "Active", 19, "2026-03-12"],
  ["Farhan Qureshi", "farhan.q", "ADMIN", "Active", 9, "2026-03-04"],
  ["Neha Bhatt", "neha.b", "STAFF", "Invited", 0, "2026-08-28"],
  ["Sanjay Pillai", "sanjay.p", "MANAGER", "Active", 34, "2026-02-24"],
  ["Riya Chandran", "riya.c", "STAFF", "Active", 7, "2026-02-17"],
  ["Aman Kapoor", "aman.k", "STAFF", "Inactive", 620, "2026-02-06"],
  ["Zoya Sheikh", "zoya.s", "VIEWER", "Active", 51, "2026-01-29"],
  ["Dev Anand", "dev.a", "STAFF", "Active", 15, "2026-01-21"],
  ["Harini Mohan", "harini.m", "ADMIN", "Active", 3, "2026-01-12"],
  ["Yusuf Rahman", "yusuf.r", "STAFF", "Invited", 0, "2026-08-30"],
  ["Pooja Menon", "pooja.m", "VIEWER", "Inactive", 900, "2025-12-18"],
];

export const SEED_USERS: AdminUser[] = SEED.map(
  ([name, handle, roleCode, status, activeHrs, createdAt], i) => ({
    id: `u-${String(i + 1).padStart(3, "0")}`,
    name,
    handle,
    email: `${handle.split(".")[0]}@jygs.in`,
    roleCode,
    status,
    // Someone invited has not signed in yet, so there is no last-active to show.
    lastActive: status === "Invited" ? "" : hoursAgo(activeHrs),
    createdAt,
  })
);
