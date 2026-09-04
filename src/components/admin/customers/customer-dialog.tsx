"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Customer, CustomerStatus } from "@/lib/admin/customers";
import { useCustomerStore } from "@/lib/admin/customers-store";
import { email as emailRule, mobile, personName } from "@/lib/validation";

const STATUSES: CustomerStatus[] = ["Active", "Inactive"];

type Values = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: CustomerStatus;
};

const EMPTY: Values = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  status: "Active",
};

/** Adding a customer and editing one ask the same things, so it is one form. */
export function CustomerDialog({
  open,
  onOpenChange,
  customer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null when adding. */
  customer: Customer | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-admin sm:max-w-[480px]">
        {/* Mounted only while showing, and keyed by who it shows, so the
            fields seed themselves on the way in rather than in an effect. */}
        {open ? (
          <CustomerForm
            key={customer?.id ?? "new"}
            customer={customer}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CustomerForm({
  customer,
  onDone,
}: {
  customer: Customer | null;
  onDone: () => void;
}) {
  const addCustomer = useCustomerStore((s) => s.addCustomer);
  const updateCustomer = useCustomerStore((s) => s.updateCustomer);

  const [values, setValues] = useState<Values>(() =>
    customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          city: customer.city,
          state: customer.state,
          status: customer.status,
        }
      : EMPTY
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: Partial<Record<keyof Values, string>> = {
      name: personName("A name")(values.name, {}) ?? undefined,
      email: emailRule()(values.email, {}) ?? undefined,
      phone: mobile()(values.phone, {}) ?? undefined,
      city: values.city.trim() ? undefined : "A city is needed.",
      state: /^[A-Z]{2}$/.test(values.state.trim().toUpperCase())
        ? undefined
        : "Two letters, as on an address — TN, KA, MH.",
    };
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      return;
    }

    const clean = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      city: values.city.trim(),
      state: values.state.trim().toUpperCase(),
      status: values.status,
    };

    if (customer) {
      updateCustomer(customer.id, clean);
      toast(`${clean.name} updated.`);
    } else {
      addCustomer(clean);
      toast(`${clean.name} added to the book.`, {
        description: "Nothing is sent — this book lives in the page.",
      });
    }
    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{customer ? "Edit customer" : "Add a customer"}</DialogTitle>
        <DialogDescription>
          {customer
            ? "Change how the studio reaches this person."
            : "Somebody the studio already knows, entered by hand."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-1 grid gap-4">
        <Field
          id="customer-name"
          label="Name"
          value={values.name}
          onChange={(value) => set("name", value)}
          error={errors.name}
          placeholder="Meera Iyer"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="customer-email"
            label="Email"
            type="email"
            value={values.email}
            onChange={(value) => set("email", value)}
            error={errors.email}
            placeholder="meera.iyer@email.com"
          />
          <Field
            id="customer-phone"
            label="Phone"
            type="tel"
            value={values.phone}
            onChange={(value) => set("phone", value)}
            error={errors.phone}
            placeholder="+91 94440 11223"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_110px]">
          <Field
            id="customer-city"
            label="City"
            value={values.city}
            onChange={(value) => set("city", value)}
            error={errors.city}
            placeholder="Chennai"
          />
          <Field
            id="customer-state"
            label="State"
            value={values.state}
            onChange={(value) => set("state", value.toUpperCase().slice(0, 2))}
            error={errors.state}
            placeholder="TN"
          />
        </div>

        <div>
          <Label className="mb-1.5 text-xs text-foreground/70">Status</Label>
          <Select
            value={values.status}
            onValueChange={(value) => set("status", value as CustomerStatus)}
            items={STATUSES.map((status) => ({ value: status, label: status }))}
          >
            <SelectTrigger className="h-9 w-full">
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

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" size="lg" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {customer ? "Save changes" : "Add customer"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
} & Omit<React.ComponentProps<"input">, "id" | "value" | "onChange">) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs text-foreground/70">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className="h-9"
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
