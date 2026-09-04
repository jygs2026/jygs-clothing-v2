"use client";

import { ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FieldError } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminRole } from "@/lib/admin/directory";
import { useDirectoryStore } from "@/lib/admin/directory-store";
import { ALL_PERMISSIONS, PERMISSION_MODULES } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";

/** "Content Manager" → "CONTENT_MANAGER". What the code field fills itself in with. */
function codeFrom(name: string) {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

type Errors = { name?: string; code?: string };

/**
 * One form for both "Create role" and editing an existing one — the questions
 * are identical, and only the code is fixed once a role exists, because users
 * are already carrying it.
 */
export function RoleForm({ role }: { role?: AdminRole }) {
  const router = useRouter();
  const roles = useDirectoryStore((s) => s.roles);
  const saveRole = useDirectoryStore((s) => s.saveRole);

  const editing = Boolean(role);
  // Super Admin is the way back in if every other role is misconfigured, so
  // its grants are shown but cannot be taken away.
  const locked = role?.code === "SUPER_ADMIN";

  const [name, setName] = useState(role?.name ?? "");
  const [code, setCode] = useState(role?.code ?? "");
  const [codeTouched, setCodeTouched] = useState(editing);
  const [description, setDescription] = useState(role?.description ?? "");
  const [active, setActive] = useState(role?.active ?? true);
  const [granted, setGranted] = useState<string[]>(role?.permissions ?? []);
  const [errors, setErrors] = useState<Errors>({});

  // Open whatever already has grants; on a blank role, open the first two so
  // the panel does not read as an empty list of chevrons.
  const [open, setOpen] = useState<string[]>(() => {
    const withGrants = PERMISSION_MODULES.filter((module) =>
      module.actions.some((action) => role?.permissions.includes(action.key))
    ).map((module) => module.key);
    return withGrants.length ? withGrants : PERMISSION_MODULES.slice(0, 2).map((m) => m.key);
  });

  function handleName(next: string) {
    setName(next);
    // The code follows the name until somebody types their own.
    if (!codeTouched) setCode(codeFrom(next));
    setErrors((prev) => ({ ...prev, name: undefined }));
  }

  function toggleModule(key: string, keys: string[], all: boolean) {
    if (locked) return;
    setGranted((prev) =>
      all ? prev.filter((p) => !keys.includes(p)) : [...new Set([...prev, ...keys])]
    );
    if (!all && !open.includes(key)) setOpen((prev) => [...prev, key]);
  }

  function togglePermission(key: string) {
    if (locked) return;
    setGranted((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: Errors = {};
    if (name.trim().length < 2) found.name = "A role needs a name.";
    if (!code.trim()) found.code = "A role code is needed.";
    else if (!/^[A-Z][A-Z0-9_]*$/.test(code))
      found.code = "Use capitals, digits and underscores — starting with a letter.";
    else if (!editing && roles.some((r) => r.code === code))
      found.code = "A role already uses that code.";

    if (found.name || found.code) {
      setErrors(found);
      document.getElementById(found.name ? "role-name" : "role-code")?.focus();
      return;
    }

    if (granted.length === 0) {
      toast("That role cannot reach anything.", {
        description: "Tick at least one permission before saving it.",
      });
      return;
    }

    saveRole({
      code,
      name: name.trim(),
      description: description.trim() || "No description yet.",
      // Keep catalogue order so two roles with the same grants list identically.
      permissions: ALL_PERMISSIONS.filter((key) => granted.includes(key)),
      active,
      system: role?.system,
    });

    toast(editing ? `${name.trim()} saved.` : `${name.trim()} created.`, {
      description: "Nothing is sent — this directory lives in the page.",
    });
    router.push("/admin/users/roles");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9"
    >
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px]">
        <Link href="/admin/users/roles" className="text-foreground/55 hover:text-accent-2">
          Roles
        </Link>
        <ChevronRight className="size-3.5 text-foreground/35" strokeWidth={1.7} />
        <span className="text-foreground/80">{editing ? role?.name : "Create role"}</span>
      </nav>

      <div className="mt-4">
        <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.015em] sm:text-[30px]">
          {editing ? `Edit ${role?.name}` : "Create role"}
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[14px] leading-[23px] text-foreground/62">
          Name the role, then tick exactly what someone holding it may reach.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <section className="rounded-lg border border-border bg-admin-surface p-5">
          <h2 className="text-[14px] font-semibold">Role information</h2>

          <div className="mt-4 grid gap-4">
            <div>
              <Label htmlFor="role-name" className="mb-1.5 text-xs text-foreground/70">
                Role name
              </Label>
              <Input
                id="role-name"
                value={name}
                onChange={(event) => handleName(event.target.value)}
                aria-invalid={errors.name ? true : undefined}
                placeholder="Content Manager"
                className="h-9"
              />
              <FieldError id="role-name-error" message={errors.name} />
            </div>

            <div>
              <Label htmlFor="role-code" className="mb-1.5 text-xs text-foreground/70">
                Role code
              </Label>
              <Input
                id="role-code"
                value={code}
                disabled={editing}
                onChange={(event) => {
                  setCodeTouched(true);
                  setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"));
                  setErrors((prev) => ({ ...prev, code: undefined }));
                }}
                aria-invalid={errors.code ? true : undefined}
                placeholder="CONTENT_MANAGER"
                className="h-9 font-admin-mono text-[13px]"
              />
              <FieldError id="role-code-error" message={errors.code} />
              {errors.code ? null : (
                <p className="mt-1.5 text-[12px] leading-[18px] text-foreground/50">
                  {editing
                    ? "Fixed — people already hold this role by its code."
                    : "Follows the name until you type your own."}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="role-description" className="mb-1.5 text-xs text-foreground/70">
                Description
              </Label>
              <Textarea
                id="role-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                placeholder="Banners, lookbooks and the pages around the collection."
              />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <div>
                <p className="text-[13px] font-medium">Status</p>
                <p className="mt-0.5 text-[12px] text-foreground/55">
                  {active ? "Can be given to people." : "Hidden when assigning a role."}
                </p>
              </div>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                aria-label="Role is active"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-admin-surface">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-[14px] font-semibold">Permissions</h2>
              <p className="mt-0.5 text-[12.5px] text-foreground/55 font-feature-tnum">
                {granted.length} of {ALL_PERMISSIONS.length} granted
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px]">
              <span className="text-foreground/50">Select:</span>
              <button
                type="button"
                disabled={locked}
                onClick={() => setGranted(ALL_PERMISSIONS)}
                className="rounded-[3px] px-1 text-accent-2 hover:underline disabled:pointer-events-none disabled:opacity-45"
              >
                All
              </button>
              <span aria-hidden="true" className="text-foreground/25">
                |
              </span>
              <button
                type="button"
                disabled={locked}
                onClick={() => setGranted([])}
                className="rounded-[3px] px-1 text-accent-2 hover:underline disabled:pointer-events-none disabled:opacity-45"
              >
                None
              </button>
            </div>
          </header>

          {locked ? (
            <p className="flex items-start gap-2 border-b border-border bg-muted/40 px-5 py-3 text-[12.5px] leading-[19px] text-foreground/65">
              <Info className="mt-px size-3.5 shrink-0" strokeWidth={1.7} />
              Super Admin keeps every permission. It is the way back in when
              another role is set up wrongly, so its grants cannot be edited.
            </p>
          ) : null}

          <div className="divide-y divide-border">
            {PERMISSION_MODULES.map((module) => {
              const keys = module.actions.map((action) => action.key);
              const held = keys.filter((key) => granted.includes(key));
              const all = held.length === keys.length;
              const some = held.length > 0 && !all;

              return (
                <Collapsible
                  key={module.key}
                  open={open.includes(module.key)}
                  onOpenChange={(next) =>
                    setOpen((prev) =>
                      next ? [...prev, module.key] : prev.filter((k) => k !== module.key)
                    )
                  }
                >
                  <div className="flex items-center gap-3 px-5 py-2.5">
                    <Checkbox
                      checked={all}
                      indeterminate={some}
                      disabled={locked}
                      onCheckedChange={() => toggleModule(module.key, keys, all)}
                      aria-label={`Every permission on ${module.label}`}
                    />
                    <CollapsibleTrigger className="flex flex-1 items-center gap-2 rounded-[3px] text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                      <span className="text-[13.5px] font-medium">{module.label}</span>
                      <span
                        className={cn(
                          "text-[11.5px] font-feature-tnum",
                          held.length ? "text-accent-2" : "text-foreground/40"
                        )}
                      >
                        {held.length}/{keys.length}
                      </span>
                      <ChevronRight
                        aria-hidden="true"
                        className={cn(
                          "ml-auto size-4 text-foreground/40 transition-transform",
                          open.includes(module.key) && "rotate-90"
                        )}
                        strokeWidth={1.7}
                      />
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="overflow-hidden">
                    <div className="grid gap-y-1 pb-3 pl-[3.25rem] sm:grid-cols-2">
                      {module.actions.map((action) => (
                        <label
                          key={action.key}
                          className={cn(
                            "flex items-center gap-2.5 py-1 pr-5 text-[13px]",
                            locked ? "text-foreground/55" : "text-foreground/80"
                          )}
                        >
                          <Checkbox
                            checked={granted.includes(action.key)}
                            disabled={locked}
                            onCheckedChange={() => togglePermission(action.key)}
                          />
                          {action.label}
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2.5">
        <Link
          href="/admin/users/roles"
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          Cancel
        </Link>
        <Button type="submit" size="lg">
          {editing ? "Save role" : "Create role"}
        </Button>
      </div>
    </form>
  );
}
