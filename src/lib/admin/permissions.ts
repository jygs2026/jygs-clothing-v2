/**
 * What a role is allowed to do, module by module. The modules mirror the
 * studio's own rail, so a role's permissions read in the same order as the
 * menu the person will actually be looking at.
 *
 * Keys are `module.action` and are the only thing stored on a role — labels
 * can be rewritten without invalidating anyone's permissions.
 */

export type PermissionModule = {
  key: string;
  label: string;
  actions: { key: string; label: string }[];
};

function moduleOf(
  key: string,
  label: string,
  actions: [string, string][]
): PermissionModule {
  return {
    key,
    label,
    actions: actions.map(([action, actionLabel]) => ({
      key: `${key}.${action}`,
      label: actionLabel,
    })),
  };
}

export const PERMISSION_MODULES: PermissionModule[] = [
  moduleOf("dashboard", "Dashboard", [["view", "View dashboard"]]),
  moduleOf("orders", "Orders", [
    ["view", "View orders"],
    ["edit", "Edit orders"],
    ["export", "Export orders"],
    ["cancel", "Cancel orders"],
  ]),
  moduleOf("returns", "Returns", [
    ["view", "View returns"],
    ["approve", "Approve returns"],
    ["refund", "Issue refunds"],
  ]),
  moduleOf("products", "Products", [
    ["view", "View products"],
    ["add", "Add products"],
    ["edit", "Edit products"],
    ["delete", "Delete products"],
  ]),
  moduleOf("inventory", "Inventory", [
    ["view", "View stock"],
    ["adjust", "Adjust stock"],
  ]),
  moduleOf("pricing", "Pricing", [
    ["view", "View pricing"],
    ["edit", "Change prices"],
  ]),
  moduleOf("promotions", "Promotions", [
    ["view", "View promotions"],
    ["manage", "Create and end promotions"],
  ]),
  moduleOf("customers", "Customers", [
    ["view", "View customers"],
    ["edit", "Edit customer details"],
    ["export", "Export customers"],
  ]),
  moduleOf("reports", "Reports", [
    ["view", "View reports"],
    ["export", "Export reports"],
  ]),
  moduleOf("payments", "Payments", [
    ["view", "View payments"],
    ["refund", "Issue refunds"],
    ["payout", "Release payouts"],
  ]),
  moduleOf("settings", "Settings", [
    ["view", "View settings"],
    ["edit", "Change settings"],
  ]),
  moduleOf("users", "Users & Roles", [
    ["view", "View users and roles"],
    ["manage", "Add and edit users"],
    ["roles", "Create and edit roles"],
  ]),
  moduleOf("logs", "System Logs", [["view", "Read the log"]]),
];

/** Every key there is — what "Super Admin" holds, and what "Select all" sets. */
export const ALL_PERMISSIONS: string[] = PERMISSION_MODULES.flatMap((m) =>
  m.actions.map((a) => a.key)
);

/** Every "view" key: the floor a read-only role sits on. */
export const VIEW_PERMISSIONS: string[] = ALL_PERMISSIONS.filter((key) =>
  key.endsWith(".view")
);

/** Shorthand for the seed data: "orders" means every action on orders. */
export function permissionsFor(...parts: string[]): string[] {
  const wanted = new Set<string>();
  for (const part of parts) {
    if (part.includes(".")) {
      wanted.add(part);
      continue;
    }
    const found = PERMISSION_MODULES.find((m) => m.key === part);
    for (const action of found?.actions ?? []) wanted.add(action.key);
  }
  // Keep catalogue order, so two roles with the same grants list identically.
  return ALL_PERMISSIONS.filter((key) => wanted.has(key));
}

export function moduleLabelFor(key: string) {
  return PERMISSION_MODULES.find((m) => m.key === key)?.label ?? key;
}
