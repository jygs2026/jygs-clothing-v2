"use client";

import { Copy, Download, Eye, MoreVertical, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { AdminStatRow } from "@/components/admin/admin-stat-row";
import { CustomerDialog } from "@/components/admin/customers/customer-dialog";
import { GroupPill } from "@/components/admin/customers/group-pill";
import { StatusMark } from "@/components/admin/status-pill";
import { DataTable } from "@/components/admin/table/data-table";
import { TableToolbar } from "@/components/admin/table/table-toolbar";
import { downloadCsv, toCsv, type Column } from "@/components/admin/table/columns";
import { UserAvatar } from "@/components/admin/user-avatar";
import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import {
  CUSTOMER_GROUPS,
  groupFor,
  locationsIn,
  statsFor,
  type Customer,
  type CustomerStatus,
} from "@/lib/admin/customers";
import { useCustomerStore } from "@/lib/admin/customers-store";
import { count, formatDate, money, moneyShort, percent } from "@/lib/admin/format";
import { byNumber, byText, searchAcross, useAdminTable } from "@/lib/admin/table";

export function CustomersScreen() {
  // The top bar's search lands here as ?q=, read once as the starting value.
  const initialQuery = useSearchParams().get("q") ?? "";

  const customers = useCustomerStore((s) => s.customers);
  const setStatus = useCustomerStore((s) => s.setStatus);
  const removeCustomers = useCustomerStore((s) => s.removeCustomers);
  const replaceCustomers = useCustomerStore((s) => s.replaceCustomers);

  const [editing, setEditing] = useState<Customer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const stats = useMemo(() => statsFor(customers), [customers]);
  const locations = useMemo(() => locationsIn(customers), [customers]);

  const filters = useMemo(
    () => [
      {
        key: "status",
        label: "All statuses",
        options: (["Active", "Inactive"] as CustomerStatus[]).map((s) => ({
          value: s,
          label: s,
        })),
        match: (row: Customer, value: string) => row.status === value,
      },
      {
        key: "group",
        label: "All groups",
        options: CUSTOMER_GROUPS.map((g) => ({ value: g, label: g })),
        match: (row: Customer, value: string) => groupFor(row) === value,
      },
      {
        key: "location",
        label: "All locations",
        options: locations.map((state) => ({ value: state, label: state })),
        match: (row: Customer, value: string) => row.state === value,
      },
    ],
    [locations]
  );

  const table = useAdminTable<Customer>({
    rows: customers,
    id: (row) => row.id,
    initialQuery,
    search: useMemo(
      () =>
        searchAcross<Customer>(
          (row) => row.name,
          (row) => row.email,
          (row) => row.city,
          // Typed with or without the spacing the studio prints it in.
          (row) => row.phone.replace(/\s/g, "")
        ),
      []
    ),
    filters,
    sorts: useMemo(
      () => [
        { value: "newest", label: "Newest first", compare: (a: Customer, b: Customer) => b.joined.localeCompare(a.joined) },
        { value: "oldest", label: "Oldest first", compare: (a: Customer, b: Customer) => a.joined.localeCompare(b.joined) },
        { value: "name", label: "Name A–Z", compare: byText<Customer>((row) => row.name) },
        { value: "spent", label: "Highest spend", compare: byNumber<Customer>((row) => row.spent).high },
        { value: "orders", label: "Most orders", compare: byNumber<Customer>((row) => row.orders).high },
      ],
      []
    ),
  });

  const columns = useMemo<Column<Customer>[]>(
    () => [
      {
        key: "customer",
        header: "Customer",
        csv: (row) => row.name,
        cell: (row) => (
          <div className="flex items-center gap-3">
            <UserAvatar name={row.name} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                <Link href={`/admin/customers/${row.id}`} className="truncate hover:text-accent-2">
                  {row.name}
                </Link>
                <GroupPill group={groupFor(row)} />
              </p>
              <p className="truncate text-[12px] text-foreground/50">
                {row.city}, {row.state}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        hideBelow: "lg",
        className: "text-foreground/70",
        csv: (row) => row.email,
        cell: (row) => row.email,
      },
      {
        key: "phone",
        header: "Phone",
        hideBelow: "xl",
        className: "text-foreground/70 font-feature-tnum",
        csv: (row) => row.phone,
        cell: (row) => row.phone,
      },
      {
        key: "orders",
        header: "Orders",
        align: "right",
        className: "text-foreground/75 font-feature-tnum",
        csv: (row) => row.orders,
        cell: (row) => row.orders,
      },
      {
        key: "spent",
        header: "Total spent",
        align: "right",
        className: "font-medium font-feature-tnum",
        csv: (row) => row.spent,
        cell: (row) => money(row.spent),
      },
      {
        key: "status",
        header: "Status",
        csv: (row) => row.status,
        cell: (row) => (
          <StatusMark tone={row.status === "Active" ? "good" : "bad"}>{row.status}</StatusMark>
        ),
      },
      {
        key: "joined",
        header: "Joined",
        hideBelow: "lg",
        className: "text-foreground/62",
        csv: (row) => row.joined,
        cell: (row) => formatDate(row.joined),
      },
    ],
    []
  );

  function markStatus(rows: Customer[], next: CustomerStatus) {
    setStatus(rows.map((row) => row.id), next);
    table.clearSelection();
    toast(
      rows.length === 1
        ? `${rows[0].name} is now ${next.toLowerCase()}.`
        : `${rows.length} customers are now ${next.toLowerCase()}.`
    );
  }

  function remove(rows: Customer[]) {
    const before = customers;
    const what = rows.length === 1 ? rows[0].name : `${rows.length} customers`;
    removeCustomers(rows.map((row) => row.id));
    table.clearSelection();
    toast(`${what} removed.`, {
      action: { label: "Undo", onClick: () => replaceCustomers(before) },
    });
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Customers"
        blurb="Who buys, what they keep, and how to reach them when a run is ready."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            downloadCsv("jygs-customers.csv", toCsv(columns, table.matched));
            toast(`${table.total} customers exported.`);
          }}
        >
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
          Add customer
        </Button>
      </AdminPageHeader>

      <AdminStatRow>
        <AdminStatCard label="Total customers" value={count(stats.total)} detail="Everyone on file" />
        <AdminStatCard label="New" value={count(stats.fresh)} tone="positive" detail="Joined in the last 30 days" />
        <AdminStatCard label="With orders" value={count(stats.withOrders)} detail={`${percent(stats.withOrders, stats.total)} of the book`} />
        <AdminStatCard label="Repeat" value={count(stats.repeat)} detail={`${percent(stats.repeat, stats.total)} came back`} />
        <AdminStatCard label="Average order" value={money(stats.averageOrder)} detail="Across every order placed" />
        <AdminStatCard label="Total spent" value={moneyShort(stats.spent)} detail="All time" />
      </AdminStatRow>

      <AdminPanel className="mt-5">
        <TableToolbar
          table={table}
          placeholder="Search customers…"
          bulk={(rows) => (
            <>
              <Button variant="outline" size="sm" onClick={() => markStatus(rows, "Active")}>
                <UserCheck strokeWidth={1.7} />
                Mark active
              </Button>
              <Button variant="outline" size="sm" onClick={() => markStatus(rows, "Inactive")}>
                <UserX strokeWidth={1.7} />
                Mark inactive
              </Button>
              <Button variant="destructive" size="sm" onClick={() => remove(rows)}>
                <Trash2 strokeWidth={1.7} />
                Remove
              </Button>
            </>
          )}
        />

        <DataTable
          table={table}
          columns={columns}
          noun="customers"
          selectable
          empty="Nobody matches that. Try a different name, group or place."
          rowHref={(row) => `/admin/customers/${row.id}`}
          card={{
            lead: (row) => <UserAvatar name={row.name} />,
            title: (row) => row.name,
            subtitle: (row) => `${row.city}, ${row.state}`,
            badges: (row) => (
              <>
                <GroupPill group={groupFor(row)} />
                <StatusMark tone={row.status === "Active" ? "good" : "bad"}>
                  {row.status}
                </StatusMark>
              </>
            ),
            metric: (row) => ({ value: money(row.spent), label: "Spent" }),
            fields: ["orders", "email", "phone", "joined"],
            wide: ["email"],
          }}
          actions={(row) => (
            <>
              <Link
                href={`/admin/customers/${row.id}`}
                aria-label={`View ${row.name}`}
                className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Eye className="size-3.5" strokeWidth={1.7} />
              </Link>

              <Menu>
                <MenuTrigger
                  aria-label={`More for ${row.name}`}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-foreground/60 outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-muted"
                >
                  <MoreVertical className="size-3.5" strokeWidth={1.7} />
                </MenuTrigger>
                <MenuContent className="font-admin">
                  <MenuLinkItem render={<Link href={`/admin/customers/${row.id}`} />}>
                    <Eye strokeWidth={1.5} />
                    View customer
                  </MenuLinkItem>
                  <MenuItem
                    onClick={() => {
                      setEditing(row);
                      setDialogOpen(true);
                    }}
                  >
                    <UserCheck strokeWidth={1.5} />
                    Edit details
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigator.clipboard?.writeText(row.email);
                      toast(`${row.email} copied.`);
                    }}
                  >
                    <Copy strokeWidth={1.5} />
                    Copy email
                  </MenuItem>
                  {row.status === "Active" ? (
                    <MenuItem onClick={() => markStatus([row], "Inactive")}>
                      <UserX strokeWidth={1.5} />
                      Mark inactive
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => markStatus([row], "Active")}>
                      <UserCheck strokeWidth={1.5} />
                      Mark active
                    </MenuItem>
                  )}
                  <MenuSeparator />
                  <MenuItem
                    onClick={() => remove([row])}
                    className="text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive data-highlighted:[&_svg]:text-destructive"
                  >
                    <Trash2 strokeWidth={1.5} />
                    Remove
                  </MenuItem>
                </MenuContent>
              </Menu>
            </>
          )}
        />
      </AdminPanel>

      <CustomerDialog open={dialogOpen} onOpenChange={setDialogOpen} customer={editing} />
    </div>
  );
}
