"use client";

import {
  Copy,
  Download,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard, AdminCardList } from "@/components/admin/admin-card-list";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSectionTabs } from "@/components/admin/admin-section-tabs";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { RolePill } from "@/components/admin/role-pill";
import { StatusDot } from "@/components/admin/status-dot";
import { UserAvatar } from "@/components/admin/user-avatar";
import { UserDialog } from "@/components/admin/users/user-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type AdminUser, type UserStatus } from "@/lib/admin/directory";
import { daysSince, formatDate, timeAgo } from "@/lib/admin/format";
import { useDirectoryStore } from "@/lib/admin/directory-store";
import { cn } from "@/lib/utils";

type Sort = "newest" | "oldest" | "name" | "active";

const SORTS: { value: Sort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name A–Z" },
  { value: "active", label: "Recently active" },
];

const STATUSES: UserStatus[] = ["Active", "Inactive", "Invited"];

export function UsersScreen() {
  // The top bar's search lands here as ?q=. Read once as the starting value —
  // after that the field is the reader's, and retyping should not fight a URL
  // they are no longer looking at.
  const initialQuery = useSearchParams().get("q") ?? "";

  const users = useDirectoryStore((s) => s.users);
  const roles = useDirectoryStore((s) => s.roles);
  const setStatus = useDirectoryStore((s) => s.setStatus);
  const removeUsers = useDirectoryStore((s) => s.removeUsers);
  const replaceUsers = useDirectoryStore((s) => s.replaceUsers);

  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState("all");
  const [status, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const roleName = useMemo(
    () => new Map(roles.map((r) => [r.code, r.name])),
    [roles]
  );

  const stats = useMemo(() => {
    const by = (fn: (u: AdminUser) => boolean) => users.filter(fn).length;
    const share = (n: number) =>
      users.length ? `${Math.round((n / users.length) * 100)}% of the directory` : "—";
    const active = by((u) => u.status === "Active");
    const inactive = by((u) => u.status === "Inactive");
    const invited = by((u) => u.status === "Invited");
    const admins = by((u) => u.roleCode === "SUPER_ADMIN" || u.roleCode === "ADMIN");
    const viewers = by((u) => u.roleCode === "VIEWER");
    const fresh = by((u) => daysSince(u.createdAt) <= 30);
    return { active, inactive, invited, admins, viewers, fresh, share };
  }, [users]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const found = users.filter((user) => {
      if (role !== "all" && user.roleCode !== role) return false;
      if (status !== "all" && user.status !== status) return false;
      if (!needle) return true;
      return (
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle) ||
        user.handle.toLowerCase().includes(needle) ||
        (roleName.get(user.roleCode) ?? "").toLowerCase().includes(needle)
      );
    });

    const order = [...found];
    order.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "name":
          return a.name.localeCompare(b.name);
        case "active":
          // Never signed in sorts last, not first.
          return (b.lastActive || "").localeCompare(a.lastActive || "");
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return order;
  }, [users, query, role, status, sort, roleName]);

  // A filter that shortens the list must not strand the reader on page 9.
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * perPage, current * perPage);

  const shownIds = shown.map((user) => user.id);
  const selectedHere = shownIds.filter((id) => selected.includes(id));
  const allShownPicked = shownIds.length > 0 && selectedHere.length === shownIds.length;

  function resetPage() {
    setPage(1);
    setSelected([]);
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleAllShown() {
    setSelected((prev) =>
      allShownPicked
        ? prev.filter((id) => !shownIds.includes(id))
        : [...new Set([...prev, ...shownIds])]
    );
  }

  function markStatus(ids: string[], next: UserStatus) {
    setStatus(ids, next);
    setSelected([]);
    toast(
      ids.length === 1
        ? `${users.find((u) => u.id === ids[0])?.name} is now ${next.toLowerCase()}.`
        : `${ids.length} users are now ${next.toLowerCase()}.`
    );
  }

  function remove(ids: string[]) {
    const before = users;
    const what =
      ids.length === 1
        ? (users.find((u) => u.id === ids[0])?.name ?? "That user")
        : `${ids.length} users`;
    removeUsers(ids);
    setSelected([]);
    toast(`${what} removed.`, {
      action: { label: "Undo", onClick: () => replaceUsers(before) },
    });
  }

  /** The edit button and overflow menu, identical in both views. */
  function RowActions({ user }: { user: AdminUser }) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setEditing(user);
            setDialogOpen(true);
          }}
          aria-label={`Edit ${user.name}`}
          className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3.5" strokeWidth={1.7} />
        </button>

        <Menu>
          <MenuTrigger
            aria-label={`More for ${user.name}`}
            className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
          >
            <MoreVertical className="size-3.5" strokeWidth={1.7} />
          </MenuTrigger>
          <MenuContent className="font-admin">
            <MenuItem
              onClick={() => {
                navigator.clipboard?.writeText(user.email);
                toast(`${user.email} copied.`);
              }}
            >
              <Copy strokeWidth={1.5} />
              Copy email
            </MenuItem>
            {user.status === "Active" ? (
              <MenuItem onClick={() => markStatus([user.id], "Inactive")}>
                <UserX strokeWidth={1.5} />
                Deactivate
              </MenuItem>
            ) : (
              <MenuItem onClick={() => markStatus([user.id], "Active")}>
                <UserCheck strokeWidth={1.5} />
                Activate
              </MenuItem>
            )}
            <MenuSeparator />
            <MenuItem
              onClick={() => remove([user.id])}
              className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive data-highlighted:[&_svg]:text-destructive"
            >
              <Trash2 strokeWidth={1.5} />
              Remove
            </MenuItem>
          </MenuContent>
        </Menu>
      </>
    );
  }

  function exportCsv() {
    const head = ["Name", "Handle", "Email", "Role", "Status", "Last active", "Added"];
    const rows = filtered.map((user) => [
      user.name,
      `@${user.handle}`,
      user.email,
      roleName.get(user.roleCode) ?? user.roleCode,
      user.status,
      timeAgo(user.lastActive),
      formatDate(user.createdAt),
    ]);
    const csv = [head, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "jygs-users.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast(`${filtered.length} users exported.`);
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Users & Roles"
        blurb="Who may open this door, and how much of the studio each of them sees."
      >
        <Button variant="outline" size="lg" onClick={exportCsv}>
          <Download strokeWidth={1.7} />
          Export
        </Button>
        <Button
          size="lg"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus strokeWidth={1.9} />
          Add new user
        </Button>
      </AdminPageHeader>

      <div className="mt-6">
        <AdminSectionTabs
          tabs={[
            { href: "/admin/users", label: "Users", count: users.length },
            { href: "/admin/users/roles", label: "Roles", count: roles.length },
          ]}
        />
      </div>

      <AdminStatRow>
        <AdminStatCard
          label="Total users"
          value={users.length}
          detail={`${stats.fresh} added in the last 30 days`}
        />
        <AdminStatCard
          label="Active"
          value={stats.active}
          tone="positive"
          detail={stats.share(stats.active)}
        />
        <AdminStatCard
          label="Inactive"
          value={stats.inactive}
          tone="warning"
          detail={stats.share(stats.inactive)}
        />
        <AdminStatCard
          label="Invited"
          value={stats.invited}
          tone="muted"
          detail="Waiting on a first sign-in"
        />
        <AdminStatCard
          label="Admins"
          value={stats.admins}
          detail="Full or near-full access"
        />
        <AdminStatCard
          label="Viewers"
          value={stats.viewers}
          detail="Read-only, nothing they can change"
        />
      </AdminStatRow>

      <div className="mt-5 rounded-lg border border-border bg-admin-surface">
        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
            <p className="mr-1 text-[13px] text-foreground/70 font-feature-tnum">
              {selected.length} selected
            </p>
            <Button variant="outline" size="sm" onClick={() => markStatus(selected, "Active")}>
              <UserCheck strokeWidth={1.7} />
              Activate
            </Button>
            <Button variant="outline" size="sm" onClick={() => markStatus(selected, "Inactive")}>
              <UserX strokeWidth={1.7} />
              Deactivate
            </Button>
            <Button variant="destructive" size="sm" onClick={() => remove(selected)}>
              <Trash2 strokeWidth={1.7} />
              Remove
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setSelected([])}
            >
              Clear
            </Button>
          </div>
        ) : (
          /* Same shape as the shared TableToolbar: search on its own line
             below `sm`, filters on a line that scrolls rather than wraps. */
          <div className="flex flex-col gap-2.5 border-b border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:flex-1 sm:max-w-[280px]">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-foreground/40"
                strokeWidth={1.6}
              />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                aria-label="Search users"
                placeholder="Search users…"
                // 16px on a phone, or iOS zooms the page in on focus.
                className="h-9 w-full rounded-md border border-border bg-transparent pr-2.5 pl-8 text-[16px] outline-none transition-[border-color,box-shadow] duration-(--admin-fast) ease-admin placeholder:text-foreground/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 sm:h-8 sm:text-[13px] [&::-webkit-search-cancel-button]:hidden"
              />
            </div>

            <div className="admin-scroll-x admin-scroll-fade -mx-4 flex items-center gap-2 px-4 max-sm:pb-0.5 sm:mx-0 sm:contents sm:px-0">
              <Filter
                label="All roles"
                value={role}
                onChange={(value) => {
                  setRole(value);
                  resetPage();
                }}
                options={roles.map((r) => ({ value: r.code, label: r.name }))}
              />
              <Filter
                label="All statuses"
                value={status}
                onChange={(value) => {
                  setStatusFilter(value);
                  resetPage();
                }}
                options={STATUSES.map((s) => ({ value: s, label: s }))}
              />

              <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as Sort)}
                  items={SORTS}
                >
                  <SelectTrigger aria-label="Sort users" className="h-9 sm:h-8">
                    <span className="text-foreground/50">Sort:</span>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORTS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Wide enough for columns: the table. Narrower: the same page of
            rows as cards, so nothing scrolls off to the right. */}
        <div className="hidden md:block">
          <Table containerClassName="admin-table-scroll">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allShownPicked}
                    indeterminate={selectedHere.length > 0 && !allShownPicked}
                    onCheckedChange={toggleAllShown}
                    aria-label="Select every user on this page"
                  />
                </TableHead>
                <Th>User</Th>
                <Th className="hidden lg:table-cell">Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th className="hidden lg:table-cell">Last active</Th>
                <Th className="hidden xl:table-cell">Added</Th>
                <Th className="pr-4 text-right">Actions</Th>
              </TableRow>
            </TableHeader>

            <TableBody>
              {shown.map((user) => {
                const picked = selected.includes(user.id);
                return (
                  <TableRow key={user.id} data-state={picked ? "selected" : undefined}>
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={picked}
                        onCheckedChange={() => toggle(user.id)}
                        aria-label={`Select ${user.name}`}
                      />
                    </TableCell>

                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={user.name} />
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium">{user.name}</p>
                          <p className="truncate text-[12px] text-foreground/50">
                            @{user.handle}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden text-[13px] text-foreground/70 lg:table-cell">
                      {user.email}
                    </TableCell>

                    <TableCell>
                      <RolePill
                        code={user.roleCode}
                        name={roleName.get(user.roleCode) ?? user.roleCode}
                      />
                    </TableCell>

                    <TableCell>
                      <StatusDot status={user.status} />
                    </TableCell>

                    <TableCell className="hidden text-[13px] text-foreground/62 lg:table-cell">
                      {timeAgo(user.lastActive)}
                    </TableCell>

                    <TableCell className="hidden text-[13px] text-foreground/62 xl:table-cell">
                      {formatDate(user.createdAt)}
                    </TableCell>

                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <RowActions user={user} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <AdminCardList>
          {shown.map((user) => {
            const picked = selected.includes(user.id);
            return (
              <AdminCard
                key={user.id}
                selected={picked}
                select={
                  <Checkbox
                    checked={picked}
                    onCheckedChange={() => toggle(user.id)}
                    aria-label={`Select ${user.name}`}
                  />
                }
                lead={<UserAvatar name={user.name} />}
                title={user.name}
                subtitle={`@${user.handle}`}
                badges={
                  <>
                    <RolePill
                      code={user.roleCode}
                      name={roleName.get(user.roleCode) ?? user.roleCode}
                    />
                    <StatusDot status={user.status} />
                  </>
                }
                fields={[
                  { label: "Email", value: user.email },
                  { label: "Last active", value: timeAgo(user.lastActive) },
                  { label: "Added", value: formatDate(user.createdAt) },
                ]}
                actions={<RowActions user={user} />}
              />
            );
          })}
        </AdminCardList>

        {shown.length === 0 ? (
          <p className="px-4 py-14 text-center text-[13.5px] text-foreground/55">
            Nobody matches that. Try a different name, role or status.
          </p>
        ) : null}

        <AdminPagination
          page={current}
          perPage={perPage}
          total={filtered.length}
          noun="users"
          onPage={setPage}
          onPerPage={(next) => {
            setPerPage(next);
            setPage(1);
          }}
        />
      </div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editing}
        roles={roles}
      />
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

/** A filter that reads as its own label until something is chosen. */
function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const items = [{ value: "all", label }, ...options];
  return (
    <Select value={value} onValueChange={(next) => onChange(next as string)} items={items}>
      <SelectTrigger
        aria-label={label}
        className={cn("h-8", value !== "all" && "border-accent/60 text-accent-2")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
