"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { RoleForm } from "@/components/admin/users/role-form";
import { useDirectoryStore } from "@/lib/admin/directory-store";

/**
 * Editing happens against the directory held in the page, so the role has to
 * be looked up in the browser rather than on the server — a role created a
 * minute ago exists in this session and nowhere else.
 */
export function EditRoleScreen() {
  const params = useParams<{ code: string }>();
  const role = useDirectoryStore((s) =>
    s.roles.find((entry) => entry.code === params.code)
  );

  if (!role) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
        <Link
          href="/admin/users/roles"
          className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/55 transition-colors hover:text-accent-2"
        >
          <ChevronLeft className="size-3.5" strokeWidth={1.7} />
          Roles
        </Link>
        <div className="mt-6 rounded-lg border border-dashed border-border bg-admin-surface px-6 py-16 text-center">
          <p className="text-[15px] font-medium">No role by that code.</p>
          <p className="mx-auto mt-1.5 max-w-[46ch] text-[13.5px] leading-[22px] text-foreground/58">
            The directory is held in the page, so a reload puts it back to the
            six roles it starts with — anything created since is gone.
          </p>
        </div>
      </div>
    );
  }

  // Keyed by code so switching from one role to another re-seeds the form
  // rather than leaving the previous role's answers in the fields.
  return <RoleForm key={role.code} role={role} />;
}
