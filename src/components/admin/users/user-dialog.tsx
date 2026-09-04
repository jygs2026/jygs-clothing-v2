"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminRole, AdminUser, UserStatus } from "@/lib/admin/directory";
import { useDirectoryStore } from "@/lib/admin/directory-store";
import { email as emailRule, personName } from "@/lib/validation";

const STATUSES: UserStatus[] = ["Active", "Inactive", "Invited"];

type Values = {
  name: string;
  handle: string;
  email: string;
  roleCode: string;
  status: UserStatus;
};

const EMPTY: Values = {
  name: "",
  handle: "",
  email: "",
  roleCode: "STAFF",
  status: "Invited",
};

/**
 * Adding someone, and editing them, are the same five questions — so they are
 * the same form. `user` decides which of the two it is.
 */
export function UserDialog({
  open,
  onOpenChange,
  user,
  roles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null when adding. */
  user: AdminUser | null;
  roles: AdminRole[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-admin sm:max-w-[460px]">
        {/*
          Mounted only while it is showing, and keyed by who it is showing, so
          the fields are seeded from `user` on the way in. An effect that
          re-seeded them would have to run after a render that shows the
          previous person's details.
        */}
        {open ? (
          <UserForm
            key={user?.id ?? "new"}
            user={user}
            roles={roles}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Validation runs on submit rather than per keystroke: five fields in a
 * dialog are read at a glance, and marking them wrong while they are still
 * being filled in is only nagging.
 */
function UserForm({
  user,
  roles,
  onDone,
}: {
  user: AdminUser | null;
  roles: AdminRole[];
  onDone: () => void;
}) {
  const addUser = useDirectoryStore((s) => s.addUser);
  const updateUser = useDirectoryStore((s) => s.updateUser);

  const [values, setValues] = useState<Values>(() =>
    user
      ? {
          name: user.name,
          handle: user.handle,
          email: user.email,
          roleCode: user.roleCode,
          status: user.status,
        }
      : EMPTY
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  const usable = roles.filter(
    (role) => role.active || role.code === values.roleCode
  );

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: Partial<Record<keyof Values, string>> = {
      name: personName("A name")(values.name, {}) ?? undefined,
      email: emailRule()(values.email, {}) ?? undefined,
      handle: values.handle.trim() ? undefined : "A handle is needed.",
    };
    if (found.name || found.email || found.handle) {
      setErrors(found);
      return;
    }

    const clean = {
      name: values.name.trim(),
      handle: values.handle.trim().replace(/^@/, ""),
      email: values.email.trim().toLowerCase(),
      roleCode: values.roleCode,
      status: values.status,
    };

    if (user) {
      updateUser(user.id, clean);
      toast(`${clean.name} updated.`);
    } else {
      addUser(clean);
      toast(`${clean.name} added to the studio.`, {
        description: "Nothing is sent — this directory lives in the page.",
      });
    }
    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{user ? "Edit user" : "Add a user"}</DialogTitle>
        <DialogDescription>
          {user
            ? "Change what this person is called and what they may reach."
            : "Someone new at the bench, and what the studio lets them do."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-1 grid gap-4">
        <div>
          <Label htmlFor="user-name" className="mb-1.5 text-xs text-foreground/70">
            Name
          </Label>
          <Input
            id="user-name"
            value={values.name}
            onChange={(event) => set("name", event.target.value)}
            aria-invalid={errors.name ? true : undefined}
            placeholder="Meera Iyer"
            className="h-10 sm:h-9"
          />
          <FieldError id="user-name-error" message={errors.name} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label
              htmlFor="user-handle"
              className="mb-1.5 text-xs text-foreground/70"
            >
              Handle
            </Label>
            <Input
              id="user-handle"
              value={values.handle}
              onChange={(event) => set("handle", event.target.value)}
              aria-invalid={errors.handle ? true : undefined}
              placeholder="meera.i"
              className="h-10 sm:h-9"
            />
            <FieldError id="user-handle-error" message={errors.handle} />
          </div>

          <div>
            <Label
              htmlFor="user-email"
              className="mb-1.5 text-xs text-foreground/70"
            >
              Email
            </Label>
            <Input
              id="user-email"
              type="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              aria-invalid={errors.email ? true : undefined}
              placeholder="meera@jygs.in"
              className="h-10 sm:h-9"
            />
            <FieldError id="user-email-error" message={errors.email} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-foreground/70">Role</Label>
            <Select
              value={values.roleCode}
              onValueChange={(value) => set("roleCode", value as string)}
              items={usable.map((role) => ({
                value: role.code,
                label: role.name,
              }))}
            >
              <SelectTrigger size="field" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {usable.map((role) => (
                  <SelectItem key={role.code} value={role.code}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 text-xs text-foreground/70">Status</Label>
            <Select
              value={values.status}
              onValueChange={(value) => set("status", value as UserStatus)}
              items={STATUSES.map((status) => ({
                value: status,
                label: status,
              }))}
            >
              <SelectTrigger size="field" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" size="lg" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {user ? "Save changes" : "Add user"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
