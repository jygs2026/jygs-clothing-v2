"use client";

import { Check, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { SecretInput } from "@/components/ui/secret-input";
import { useForm } from "@/hooks/use-form";
import { useOpenBag } from "@/hooks/use-open-bag";
import { useAuthStore } from "@/lib/auth-store";
import { productForLine, useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/data";
import type { BagLine } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  cardCvc,
  cardExpiry,
  cardNumber,
  CVC_DIGITS,
  digitsOnly,
  email,
  formatCardNumber,
  formatExpiry,
  minLength,
  personName,
  pinCode,
  required,
  all,
} from "@/lib/validation";

const STEPS = [
  { key: "details", num: "01", label: "Details" },
  { key: "payment", num: "02", label: "Payment" },
  { key: "done", num: "03", label: "Done" },
] as const;

export default function CheckoutPage() {
  const bag = useCartStore((s) => s.bag);
  const step = useCartStore((s) => s.step);
  const startCheckout = useCartStore((s) => s.startCheckout);

  useEffect(() => {
    if (bag.length > 0 && step === "bag") startCheckout();
  }, [bag.length, step, startCheckout]);

  if (bag.length === 0 && step !== "done") {
    return <EmptyState />;
  }

  if (step === "done") {
    return <DoneScreen />;
  }

  return (
    <div className="mx-auto max-w-[1160px] px-5 py-10 sm:px-6 sm:py-14">
      <BackToBag />

      <div className="mt-6 grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <div>
          <Stepper step={step} />
          {step === "details" ? <DetailsForm /> : null}
          {step === "payment" ? <PaymentForm /> : null}
        </div>
        <OrderSummary />
      </div>
    </div>
  );
}

function BackToBag() {
  const backToBag = useCartStore((s) => s.backToBag);
  // Desktop reopens the sheet over the home page; mobile goes to /bag.
  const openBag = useOpenBag("/");

  return (
    <button
      type="button"
      onClick={() => {
        backToBag();
        openBag();
      }}
      className="inline-flex items-center gap-1.5 text-xs tracking-[0.09em] text-foreground/55 uppercase transition-colors hover:text-accent-2"
    >
      <ChevronLeft className="size-3.5" strokeWidth={1.6} />
      Back to bag
    </button>
  );
}

function Stepper({ step }: { step: "bag" | "details" | "payment" }) {
  const stepOrder = ["details", "payment", "done"];
  const current = stepOrder.indexOf(step);

  return (
    <div className="mb-9 flex gap-2.5 sm:mb-11">
      {STEPS.map((s) => {
        const thisIndex = stepOrder.indexOf(s.key);
        const on = thisIndex === current;
        const past = thisIndex < current;
        return (
          <div
            key={s.key}
            className={cn(
              "flex flex-1 items-center gap-2 border-t-2 pt-3 text-[11px] tracking-[0.14em] uppercase",
              on || past ? "border-accent" : "border-border",
              on ? "text-accent-2" : past ? "text-foreground/60" : "text-foreground/35"
            )}
          >
            <span className="font-feature-tnum">{s.num}</span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DetailsForm() {
  const submitDetails = useCartStore((s) => s.submitDetails);
  // Signed in only saves typing — checkout never requires an account.
  const account = useAuthStore((s) => s.account);

  const form = useForm({
    id: "ck",
    fields: {
      email: { initial: account?.email ?? "", validate: email() },
      name: { initial: account?.name ?? "", validate: personName("Full name") },
      addr: {
        initial: account?.address?.line ?? "",
        validate: all(required("An address"), minLength(6, "The address")),
      },
      city: {
        initial: account?.address?.city ?? "",
        validate: all(required("A city"), minLength(2, "The city")),
      },
      post: {
        initial: account?.address?.postcode ?? "",
        validate: pinCode(),
        format: digitsOnly(6),
      },
      country: {
        initial: account?.address?.country ?? "India",
        validate: required("A country"),
      },
    },
    onSubmit: (values) =>
      submitDetails({
        email: values.email.trim(),
        name: values.name.trim(),
        city: values.city.trim(),
        postcode: values.post,
      }),
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <h1 className="font-heading text-[32px] font-normal leading-[1.1] sm:text-[38px]">
        Shipping details
      </h1>
      <p className="mt-2.5 max-w-[46ch] text-[14.5px] leading-[24px] text-foreground/68">
        Free shipping across India on Volume 01, duties included. We ship
        within two working days of the waitlist closing.
      </p>

      <div className="mt-8 grid gap-4.5 sm:max-w-[480px]">
        <FormField
          form={form}
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormField
          form={form}
          name="name"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="As it appears on the card"
        />
        <FormField
          form={form}
          name="addr"
          label="Address"
          type="text"
          autoComplete="address-line1"
          placeholder="Street and number"
        />
        <div className="grid grid-cols-[1.4fr_1fr] gap-4.5">
          <FormField
            form={form}
            name="city"
            label="City"
            type="text"
            autoComplete="address-level2"
            placeholder="Mumbai"
          />
          <FormField
            form={form}
            name="post"
            label="PIN code"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="400001"
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

      <Button
        type="submit"
        className="mt-8 h-11 w-full px-6 text-[13.5px] tracking-[0.05em] sm:w-auto sm:px-10"
      >
        Continue to payment
      </Button>
    </form>
  );
}

function PaymentForm() {
  const bag = useCartStore((s) => s.bag);
  const total = useCartStore((s) => s.total());
  const paying = useCartStore((s) => s.paying);
  const order = useCartStore((s) => s.order);
  const submitPayment = useCartStore((s) => s.submitPayment);
  const goToDetails = useCartStore((s) => s.goToDetails);

  const form = useForm({
    id: "ck-pay",
    fields: {
      card: { validate: cardNumber(), format: formatCardNumber },
      exp: { validate: cardExpiry(), format: formatExpiry },
      cvc: { validate: cardCvc(), format: digitsOnly(CVC_DIGITS) },
    },
    // The card details are never kept: the store only learns that a payment
    // was taken. Swap this for the gateway call and the form is unchanged.
    onSubmit: () => submitPayment(),
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <h1 className="font-heading text-[32px] font-normal leading-[1.1] sm:text-[38px]">
        Payment
      </h1>
      <p className="mt-2.5 text-[14.5px] leading-[24px] text-foreground/68">
        Shipping to {order?.shipTo ?? "—"} ·{" "}
        <button
          type="button"
          onClick={goToDetails}
          className="text-accent-2 underline underline-offset-3"
        >
          edit
        </button>
      </p>

      <div className="mt-8 grid gap-4.5 sm:max-w-[480px]">
        <FormField
          form={form}
          name="card"
          label="Card number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          className="font-feature-tnum"
        />
        <div className="grid grid-cols-2 gap-4.5">
          <FormField
            form={form}
            name="exp"
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

      <div className="mt-8 flex flex-col gap-3 sm:max-w-[480px] sm:flex-row sm:items-center">
        <Button
          type="submit"
          disabled={paying}
          className="h-11 w-full px-6 text-[13.5px] tracking-[0.05em] sm:w-auto sm:px-10"
        >
          {paying ? "Taking payment…" : `Pay ${formatMoney(total)}`}
        </Button>
        <span className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.06em] text-foreground/50 uppercase">
          <Lock className="size-3" strokeWidth={1.6} />
          Secure, encrypted checkout
        </span>
      </div>

      <div className="mt-9 border-t border-border pt-6 sm:max-w-[480px]">
        <div className="grid gap-2 text-[13.5px]">
          {bag.map((line) => (
            <div key={line.key} className="flex justify-between gap-4 text-foreground/74">
              <span>
                {line.name} — {line.size} × {line.qty}
              </span>
              <span className="font-feature-tnum">{formatMoney(line.qty * line.unit)}</span>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

function OrderSummary() {
  const bag = useCartStore((s) => s.bag);
  const total = useCartStore((s) => s.total());

  return (
    <aside className="rounded-[3px] border border-border bg-card/60 p-6 lg:sticky lg:top-24">
      <h2 className="text-[11px] tracking-[0.14em] text-foreground/55 uppercase">
        Order summary
      </h2>
      <div className="mt-5 flex flex-col divide-y divide-border/60">
        {bag.map((line, i) => (
          <SummaryLine key={line.key} line={line} index={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-2 border-t border-border pt-5 text-[13.5px]">
        <div className="flex justify-between text-foreground/70">
          <span>Subtotal</span>
          <span className="font-feature-tnum">{formatMoney(total)}</span>
        </div>
        <div className="flex justify-between text-foreground/70">
          <span>Shipping — tracked, two days</span>
          <span className="font-feature-tnum">Free</span>
        </div>
        <div className="flex justify-between text-foreground/70">
          <span>Duties</span>
          <span className="font-feature-tnum">Included</span>
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-5">
        <span className="text-xs tracking-[0.09em] text-foreground/58 uppercase">Total</span>
        <span className="font-heading text-[26px] font-feature-tnum">{formatMoney(total)}</span>
      </div>

      <p className="mt-5 text-[12.5px] leading-[21px] text-foreground/58">
        Thirty days to return it unworn, postage on us. Mended free for as
        long as you own it.
      </p>
    </aside>
  );
}

/**
 * One line of the order summary. Money and the remove control share a
 * right-hand column — price at the top, "Remove" at the foot of the row —
 * so the whole summary reads as two columns rather than each line trailing
 * a stray link. Removal is undoable from the toast, as it is elsewhere.
 */
function SummaryLine({ line, index }: { line: BagLine; index: number }) {
  const removeLine = useCartStore((s) => s.removeLine);
  const restoreLine = useCartStore((s) => s.restoreLine);
  const product = productForLine(line.productId);

  function remove() {
    removeLine(line.key);
    toast(`${line.name} · ${line.size} removed`, {
      action: {
        label: "Undo",
        onClick: () => restoreLine(line, index),
      },
    });
  }

  return (
    <div className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
      <div className="relative aspect-3/4 w-14 shrink-0 overflow-hidden">
        <ProductImage
          src={product?.image}
          alt={`${line.name} — ${line.color}`}
          hint={line.name}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-[15px] leading-[1.25]">{line.name}</h3>
        <p className="mt-1.5 text-[11px] tracking-[0.06em] text-foreground/55 uppercase">
          {line.color} · {line.size} · Qty {line.qty}
        </p>
        {product?.badge === "Made to order" ? (
          <p className="mt-1 text-[11px] tracking-[0.06em] text-accent-2 uppercase">
            Cut to measure
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-4">
        <span className="text-[13px] text-foreground/78 font-feature-tnum">
          {formatMoney(line.qty * line.unit)}
        </span>
        <button
          type="button"
          onClick={remove}
          aria-label={`Remove ${line.name}, ${line.color}, size ${line.size}, from the order`}
          className="cursor-pointer text-[11px] tracking-[0.06em] text-foreground/52 underline underline-offset-3 uppercase transition-colors hover:text-accent-2"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function DoneScreen() {
  const order = useCartStore((s) => s.order);
  const finishOrder = useCartStore((s) => s.finishOrder);
  const router = useRouter();

  const count = order?.count ?? 0;
  const summary =
    count === 1 ? "One piece from Volume 01" : `${count} pieces from Volume 01`;

  return (
    <div className="mx-auto flex max-w-[520px] flex-col items-start gap-5 px-5 py-20 sm:px-6 sm:py-28">
      <span className="flex size-12 items-center justify-center rounded-full border border-accent text-accent-2">
        <Check className="size-5" strokeWidth={1.4} />
      </span>
      <h1 className="font-heading text-[36px] font-normal leading-[1.14] sm:text-[42px]">
        Order {order?.no} is placed.
      </h1>
      <p className="text-[15px] leading-[26px] text-foreground/72">
        A receipt is on its way to {order?.email || "your inbox"}. {summary} —
        we cut, press and post within two working days, and we mend it free
        for as long as you own it.
      </p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-[13.5px]">
        <dt className="text-foreground/55">Paid</dt>
        <dd className="font-feature-tnum">{order?.paid}</dd>
        <dt className="text-foreground/55">Ships to</dt>
        <dd>{order?.shipTo}</dd>
      </dl>
      <Button
        type="button"
        onClick={() => {
          finishOrder();
          router.push("/");
        }}
        className="mt-3 h-11 px-8 text-[13.5px] tracking-[0.05em]"
      >
        Back to Volume 01
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-[480px] flex-col items-start gap-4 px-5 py-24 sm:px-6 sm:py-32">
      <h1 className="font-heading text-[32px] font-normal leading-[1.14]">
        Your bag is empty.
      </h1>
      <p className="text-[14.5px] leading-7 text-foreground/70">
        Volume 01 is five pieces. Open any of them for the cloth, the fit and
        the sizes still running.
      </p>
      <Button
        render={<Link href="/#collection" />}
        nativeButton={false}
        className="mt-1 h-11 px-8 text-[13.5px] tracking-[0.05em]"
      >
        See the collection
      </Button>
    </div>
  );
}
