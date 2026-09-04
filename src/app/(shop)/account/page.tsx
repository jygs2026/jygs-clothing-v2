"use client";

import { Camera, Check, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AccountAvatar } from "@/components/account-avatar";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { SecretInput } from "@/components/ui/secret-input";
import { useForm } from "@/hooks/use-form";
import { squareThumbnail } from "@/lib/avatar";
import { useAuthStore, type Account } from "@/lib/auth-store";
import type { CardBrand } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  all,
  cardCvc,
  cardExpiry,
  cardNumber,
  CVC_DIGITS,
  digitsOnly,
  email,
  formatCardNumber,
  formatExpiry,
  formatPhone,
  minLength,
  mobile,
  optional,
  personName,
  pinCode,
  required,
} from "@/lib/validation";

/**
 * Everything the studio holds about a customer, on one page: their picture,
 * how to reach them, where a parcel goes and how it gets paid for. Each panel
 * reads first and edits on request, so the page is a record rather than a
 * form someone has to fill in again every visit.
 */
export default function AccountPage() {
  // The layout above only renders this page when someone is signed in.
  const account = useAuthStore((s) => s.account)!;

  return (
    <div>
      <h1 className="font-heading text-[32px] leading-[1.1] font-normal sm:text-[38px]">
        My account
      </h1>
      <p className="mt-2.5 max-w-[52ch] text-[14.5px] leading-[24px] text-foreground/68">
        Your details, kept only so the next order takes a minute instead of
        five. Change anything here and it is used from the next checkout on.
      </p>

      <div className="mt-9 grid gap-5">
        <PhotoPanel account={account} />
        <DetailsPanel account={account} />
        <AddressPanel account={account} />
        <PaymentPanel account={account} />
      </div>

      <p className="mt-8 border-t border-border pt-5 text-[12.5px] leading-[21px] text-foreground/52">
        Demo account — everything on this page is kept in this browser alone.
        Card numbers are read to work out the brand and the last four digits,
        then discarded; nothing is sent anywhere.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- profile */

function PhotoPanel({ account }: { account: Account }) {
  const setAvatar = useAuthStore((s) => s.setAvatar);
  const fileRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState(false);

  async function handlePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear the input either way, so picking the same file twice still fires.
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file.");
      return;
    }

    setReading(true);
    try {
      setAvatar(await squareThumbnail(file));
      toast("Profile picture updated.");
    } catch {
      toast.error("That image could not be read. Try another one.");
    } finally {
      setReading(false);
    }
  }

  return (
    <Panel title="Profile picture">
      <div className="flex flex-wrap items-center gap-5">
        <AccountAvatar account={account} className="size-20 text-[19px]" />

        <div className="grid gap-2.5">
          <div className="flex flex-wrap gap-2.5">
            <Button
              type="button"
              variant="outline"
              disabled={reading}
              onClick={() => fileRef.current?.click()}
              className="h-9 text-[13px] tracking-[0.04em]"
            >
              <Camera className="size-4" strokeWidth={1.5} />
              {reading ? "Reading…" : account.avatar ? "Change photo" : "Add a photo"}
            </Button>
            {account.avatar ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAvatar(null);
                  toast("Profile picture removed.");
                }}
                className="h-9 text-[13px] tracking-[0.04em] text-foreground/62"
              >
                Remove
              </Button>
            ) : null}
          </div>
          <p className="text-[12.5px] leading-[20px] text-foreground/55">
            A square crop works best. Anything larger is cut to the middle and
            scaled to 256px.
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePick}
          className="hidden"
        />
      </div>
    </Panel>
  );
}

function DetailsPanel({ account }: { account: Account }) {
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [editing, setEditing] = useState(false);

  const form = useForm({
    id: "ac-details",
    fields: {
      name: { initial: account.name, validate: personName("Name") },
      email: { initial: account.email, validate: email() },
      // A mobile number is not required; a half-typed one still is not saved.
      phone: { initial: account.phone, validate: optional(mobile()), format: formatPhone },
    },
    onSubmit: (values) => {
      updateProfile({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
      setEditing(false);
      toast("Details saved.");
    },
  });

  if (!editing) {
    return (
      <Panel title="Details" action={<EditButton onClick={() => setEditing(true)} />}>
        <dl className="grid gap-4 sm:grid-cols-3">
          <ReadRow label="Name" value={account.name} />
          <ReadRow label="Email" value={account.email} />
          <ReadRow label="Mobile number" value={account.phone} empty="Not added" />
        </dl>
      </Panel>
    );
  }

  return (
    <Panel title="Details">
      <form onSubmit={form.handleSubmit} noValidate>
        <div className="grid gap-4.5 sm:max-w-[480px]">
          <FormField form={form} name="name" label="Name" type="text" autoComplete="name" />
          <FormField
            form={form}
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
          />
          <FormField
            form={form}
            name="phone"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            hint="Optional — used only for a delivery call."
          />
        </div>
        <FormActions
          onCancel={() => {
            form.reset();
            setEditing(false);
          }}
        />
      </form>
    </Panel>
  );
}

function AddressPanel({ account }: { account: Account }) {
  const updateAddress = useAuthStore((s) => s.updateAddress);
  const [editing, setEditing] = useState(false);
  const address = account.address;

  const form = useForm({
    id: "ac-address",
    fields: {
      line: {
        initial: address?.line ?? "",
        validate: all(required("An address"), minLength(6, "The address")),
      },
      city: {
        initial: address?.city ?? "",
        validate: all(required("A city"), minLength(2, "The city")),
      },
      postcode: {
        initial: address?.postcode ?? "",
        validate: pinCode(),
        format: digitsOnly(6),
      },
      country: { initial: address?.country ?? "India", validate: required("A country") },
    },
    onSubmit: (values) => {
      updateAddress({
        line: values.line.trim(),
        city: values.city.trim(),
        postcode: values.postcode,
        country: values.country.trim(),
      });
      setEditing(false);
      toast("Address saved.");
    },
  });

  if (!editing) {
    return (
      <Panel
        title="Address"
        action={
          <EditButton
            onClick={() => setEditing(true)}
            label={address ? "Edit" : "Add an address"}
          />
        }
      >
        {address ? (
          <address className="text-[14px] leading-[24px] text-foreground/80 not-italic">
            {address.line}
            <br />
            {address.city} {address.postcode}
            <br />
            {address.country}
          </address>
        ) : (
          <p className="text-[13.5px] text-foreground/55">
            No address on file. Add one and checkout will fill itself in.
          </p>
        )}
      </Panel>
    );
  }

  return (
    <Panel title="Address">
      <form onSubmit={form.handleSubmit} noValidate>
        <div className="grid gap-4.5 sm:max-w-[480px]">
          <FormField
            form={form}
            name="line"
            label="Street and number"
            type="text"
            autoComplete="address-line1"
            placeholder="12 Rutland Gate, Kilpauk"
          />
          <div className="grid grid-cols-[1.4fr_1fr] gap-4.5">
            <FormField
              form={form}
              name="city"
              label="City"
              type="text"
              autoComplete="address-level2"
              placeholder="Chennai"
            />
            <FormField
              form={form}
              name="postcode"
              label="PIN code"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="600010"
              className="font-feature-tnum"
            />
          </div>
          <FormField
            form={form}
            name="country"
            label="Country"
            type="text"
            autoComplete="country-name"
          />
        </div>
        <FormActions
          onCancel={() => {
            form.reset();
            setEditing(false);
          }}
        />
      </form>
    </Panel>
  );
}

/* --------------------------------------------------------------- payment */

/** Short marks, so a long issuer name cannot burst its box. */
const BRAND_MARK: Record<CardBrand, string> = {
  Visa: "Visa",
  Mastercard: "MC",
  Amex: "Amex",
  RuPay: "RuPay",
  Card: "Card",
};

/** Enough of the issuer ranges to name the card in front of someone. */
function brandOf(digits: string): CardBrand {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(60|65|81|82)/.test(digits)) return "RuPay";
  return "Card";
}

function PaymentPanel({ account }: { account: Account }) {
  const removeCard = useAuthStore((s) => s.removeCard);
  const makeCardPrimary = useAuthStore((s) => s.makeCardPrimary);
  const [adding, setAdding] = useState(false);

  return (
    <Panel
      title="Payment methods"
      action={
        adding ? null : (
          <EditButton
            onClick={() => setAdding(true)}
            label="Add a card"
            icon={<Plus className="size-3.5" strokeWidth={1.6} />}
          />
        )
      }
    >
      {account.cards.length ? (
        <ul className="flex flex-col divide-y divide-border/60">
          {account.cards.map((card) => (
            <li
              key={card.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2.5 py-3.5 first:pt-0 last:pb-0"
            >
              <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-[3px] border border-border bg-background text-[9.5px] tracking-[0.06em] text-foreground/62 uppercase">
                {BRAND_MARK[card.brand]}
              </span>
              <div className="min-w-0">
                <p className="text-[14px] leading-tight font-feature-tnum">
                  •••• •••• •••• {card.last4}
                </p>
                <p className="mt-1 text-[11.5px] tracking-[0.04em] text-foreground/55 uppercase font-feature-tnum">
                  {card.holder} · Expires {card.expiry}
                </p>
              </div>

              <div className="ml-auto flex items-center gap-3">
                {card.primary ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-accent px-2 py-[3px] text-[10px] tracking-[0.1em] text-accent uppercase">
                    <Check className="size-3" strokeWidth={2} />
                    Default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      makeCardPrimary(card.id);
                      toast(`${card.brand} ending ${card.last4} is now the default.`);
                    }}
                    className="text-[12px] tracking-[0.04em] text-foreground/58 uppercase transition-colors hover:text-accent-2"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${card.brand} ending ${card.last4}`}
                  onClick={() => {
                    removeCard(card.id);
                    toast(`${card.brand} ending ${card.last4} removed.`);
                  }}
                  className="text-foreground/45 transition-colors hover:text-destructive"
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13.5px] text-foreground/55">
          No cards saved. You can also pay as a guest at checkout.
        </p>
      )}

      {adding ? (
        <AddCardForm account={account} onDone={() => setAdding(false)} />
      ) : null}
    </Panel>
  );
}

function AddCardForm({ account, onDone }: { account: Account; onDone: () => void }) {
  const addCard = useAuthStore((s) => s.addCard);

  const form = useForm({
    id: "ac-card",
    fields: {
      holder: { initial: account.name, validate: personName("The name on the card") },
      number: { validate: cardNumber(), format: formatCardNumber },
      expiry: { validate: cardExpiry(), format: formatExpiry },
      cvc: { validate: cardCvc(), format: digitsOnly(CVC_DIGITS) },
    },
    onSubmit: (values) => {
      const digits = values.number.replace(/\D/g, "");
      addCard({
        brand: brandOf(digits),
        last4: digits.slice(-4),
        expiry: values.expiry,
        holder: values.holder.trim(),
      });
      // Only the last four digits went to the store; drop the rest now.
      form.reset();
      onDone();
      toast(`${brandOf(digits)} ending ${digits.slice(-4)} saved.`);
    },
  });

  const brand = brandOf(form.values.number.replace(/\D/g, ""));

  return (
    <form onSubmit={form.handleSubmit} noValidate className="mt-6 border-t border-border pt-6">
      <div className="grid gap-4.5 sm:max-w-[480px]">
        <FormField
          form={form}
          name="holder"
          label="Name on card"
          type="text"
          autoComplete="cc-name"
          placeholder={account.name}
        />
        <FormField
          form={form}
          name="number"
          label="Card number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          className="font-feature-tnum"
          hint={
            form.values.number.length > 3 && brand !== "Card"
              ? `Looks like a ${brand} card.`
              : "We keep the brand and the last four digits, nothing else."
          }
        />
        <div className="grid grid-cols-2 gap-4.5">
          <FormField
            form={form}
            name="expiry"
            label="Expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            className="font-feature-tnum"
          />
          <FormField form={form} name="cvc" label="CVC">
            <SecretInput
              {...form.field("cvc")}
              autoComplete="cc-csc"
              maxLength={CVC_DIGITS}
              placeholder="•••"
              className="font-feature-tnum"
            />
          </FormField>
        </div>
      </div>

      <FormActions
        label="Save card"
        onCancel={() => {
          form.reset();
          onDone();
        }}
      />
    </form>
  );
}

/* ----------------------------------------------------------------- parts */

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[3px] border border-border bg-card/45 p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h2 className="text-[11px] tracking-[0.11em] text-foreground/50 uppercase">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EditButton({
  onClick,
  label = "Edit",
  icon,
}: {
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-foreground/58 uppercase transition-colors hover:text-accent-2"
    >
      {icon}
      {label}
    </button>
  );
}

function ReadRow({
  label,
  value,
  empty,
}: {
  label: string;
  value: string;
  empty?: string;
}) {
  return (
    <div>
      <dt className="text-[11px] tracking-[0.11em] text-foreground/50 uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1.5 text-[14px] leading-[22px] break-words",
          value ? "text-foreground/85" : "text-foreground/45"
        )}
      >
        {value || empty}
      </dd>
    </div>
  );
}

function FormActions({
  onCancel,
  label = "Save changes",
}: {
  onCancel: () => void;
  label?: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <Button type="submit" className="h-10 px-6 text-[13px] tracking-[0.05em]">
        {label}
      </Button>
      <button
        type="button"
        onClick={onCancel}
        className="text-[12.5px] tracking-[0.05em] text-foreground/58 uppercase transition-colors hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  );
}
