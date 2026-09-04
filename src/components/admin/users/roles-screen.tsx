"use client";

import { Copy, Lock, MoreVertical, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminCard, AdminCardList } from "@/components/admin/admin-card-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminSectionTabs } from "@/components/admin/admin-section-tabs";
import { roleToneFor } from "@/components/admin/role-pill";
import { buttonVariants } from "@/components/ui/button";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminRole } from "@/lib/admin/directory";
import { countByRole, useDirectoryStore } from "@/lib/admin/directory-store";
import { ALL_PERMISSIONS } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";

export function RolesScreen() {
  const router = useRouter();
  const users = useDirectoryStore((s) => s.users);
  const roles = useDirectoryStore((s) => s.roles);
  const saveRole = useDirectoryStore((s) => s.saveRole);
  const removeRole = useDirectoryStore((s) => s.removeRole);

  const counts = countByRole(users);

  function duplicate(code: string) {
    const source = roles.find((role) => role.code === code);
    if (!source) return;

    // Find a code nobody is using — "STAFF" becomes "STAFF_COPY", then
    // "STAFF_COPY_2", so duplicating twice does not overwrite the first copy.
    let candidate = `${source.code}_COPY`;
    let n = 2;
    while (roles.some((role) => role.code === candidate)) {
      candidate = `${source.code}_COPY_${n++}`;
    }

    saveRole({
      ...source,
      code: candidate,
      name: `${source.name} (copy)`,
      active: false,
      system: false,
    });
    toast(`${source.name} duplicated.`, {
      description: "The copy starts inactive — turn it on once it is right.",
    });
  }

  function destroy(code: string) {
    const role = roles.find((r) => r.code === code);
    if (!role) return;

    const held = counts.get(code) ?? 0;
    if (held > 0) {
      toast(`${role.name} is still in use.`, {
        description: `Move the ${held} ${held === 1 ? "person" : "people"} holding it to another role first.`,
      });
      return;
    }

    removeRole(code);
    toast(`${role.name} deleted.`, {
      action: { label: "Undo", onClick: () => saveRole(role) },
    });
  }

  /** The coloured shield that stands for a role. */
  function RoleMark({ role }: { role: AdminRole }) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md border",
          roleToneFor(role.code)
        )}
      >
        <ShieldCheck className="size-4" strokeWidth={1.6} />
      </span>
    );
  }

  function RoleIdentity({ role }: { role: AdminRole }) {
    return (
      <div className="flex items-center gap-3">
        <RoleMark role={role} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[13.5px] font-medium">
            {role.name}
            {role.system ? (
              <Lock className="size-3 text-foreground/35" strokeWidth={2} aria-label="Built in" />
            ) : null}
            {role.active ? null : (
              <span className="rounded-4xl bg-muted px-1.5 py-px text-[10.5px] font-normal text-foreground/55">
                Inactive
              </span>
            )}
          </p>
          <p className="truncate font-admin-mono text-[11.5px] text-foreground/45">
            {role.code}
          </p>
        </div>
      </div>
    );
  }

  /** How much of the studio the role can reach, as a bar and a count. */
  function Reach({ role }: { role: AdminRole }) {
    const share = Math.round((role.permissions.length / ALL_PERMISSIONS.length) * 100);
    return (
      <span className="flex items-center gap-2.5">
        <span aria-hidden="true" className="h-1 w-16 overflow-hidden rounded-full bg-muted">
          <span
            className="block h-full rounded-full bg-accent"
            style={{ width: `${share}%` }}
          />
        </span>
        <span className="text-[12px] text-foreground/55 font-feature-tnum">
          {role.permissions.length} of {ALL_PERMISSIONS.length}
        </span>
      </span>
    );
  }

  function RowActions({ role }: { role: AdminRole }) {
    return (
      <>
        <Link
          href={`/admin/users/roles/${role.code}`}
          aria-label={`Edit ${role.name}`}
          className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3.5" strokeWidth={1.7} />
        </Link>

        <Menu>
          <MenuTrigger
            aria-label={`More for ${role.name}`}
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
          >
            <MoreVertical className="size-3.5" strokeWidth={1.7} />
          </MenuTrigger>
          <MenuContent className="font-admin">
            <MenuItem onClick={() => router.push(`/admin/users/roles/${role.code}`)}>
              <Pencil strokeWidth={1.5} />
              Edit role
            </MenuItem>
            <MenuItem onClick={() => duplicate(role.code)}>
              <Copy strokeWidth={1.5} />
              Duplicate
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              disabled={role.system}
              onClick={() => destroy(role.code)}
              className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive data-highlighted:[&_svg]:text-destructive"
            >
              <Trash2 strokeWidth={1.5} />
              {role.system ? "Built in — cannot delete" : "Delete role"}
            </MenuItem>
          </MenuContent>
        </Menu>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Users & Roles"
        blurb="Who may open this door, and how much of the studio each of them sees."
      >
        {/* A link wearing the button's clothes, rather than a Button told to
            render a link — that comes out as <a role="button">, which
            announces "button" for what is plainly navigation. */}
        <Link href="/admin/users/roles/new" className={buttonVariants({ size: "lg" })}>
          <Plus strokeWidth={1.9} />
          Create role
        </Link>
      </AdminPageHeader>

      <div className="mt-6">
        <AdminSectionTabs
          tabs={[
            { href: "/admin/users", label: "Users", count: users.length },
            { href: "/admin/users/roles", label: "Roles", count: roles.length },
          ]}
        />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-admin-surface">
        <div className="hidden md:block">
          <Table containerClassName="admin-table-scroll">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <Th className="pl-4">Role</Th>
                <Th>Users</Th>
                <Th className="hidden lg:table-cell">Reach</Th>
                <Th className="hidden lg:table-cell">Description</Th>
                <Th className="pr-4 text-right">Actions</Th>
              </TableRow>
            </TableHeader>

            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.code}>
                  <TableCell className="py-3 pl-4">
                    <RoleIdentity role={role} />
                  </TableCell>

                  <TableCell className="text-[13px] text-foreground/75 font-feature-tnum">
                    {counts.get(role.code) ?? 0}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell">
                    <Reach role={role} />
                  </TableCell>

                  <TableCell className="hidden max-w-[420px] lg:table-cell">
                    <p className="truncate text-[13px] text-foreground/62">
                      {role.description}
                    </p>
                  </TableCell>

                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <RowActions role={role} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AdminCardList>
          {roles.map((role) => (
            <AdminCard
              key={role.code}
              lead={<RoleMark role={role} />}
              title={
                <span className="flex items-center gap-2">
                  {role.name}
                  {role.system ? (
                    <Lock className="size-3 text-foreground/35" strokeWidth={2} aria-label="Built in" />
                  ) : null}
                  {role.active ? null : (
                    <span className="rounded-4xl bg-muted px-1.5 py-px text-[10.5px] font-normal text-foreground/55">
                      Inactive
                    </span>
                  )}
                </span>
              }
              subtitle={<span className="font-admin-mono">{role.code}</span>}
              fields={[
                { label: "Users", value: counts.get(role.code) ?? 0 },
                { label: "Reach", value: <Reach role={role} /> },
                { label: "Description", value: role.description, wide: true },
              ]}
              actions={<RowActions role={role} />}
            />
          ))}
        </AdminCardList>

        <p className="border-t border-border px-4 py-3 text-[12.5px] text-foreground/58">
          {roles.length} {roles.length === 1 ? "role" : "roles"} · {users.length}{" "}
          people in the directory.
        </p>
      </div>
    </div>
  );
}

function Th({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <TableHead
      className={cn(
        "px-2 text-[11px] font-medium tracking-[0.08em] text-foreground/50 uppercase",
        className
      )}
    >
      {children}
    </TableHead>
  );
}
