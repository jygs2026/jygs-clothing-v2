"use client";

import { Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ProductImage } from "@/components/product-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { productForLine, useCartStore } from "@/lib/cart-store";
import { formatMoney } from "@/lib/data";
import { SIZES } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "details", num: "01", label: "Details" },
  { key: "payment", num: "02", label: "Payment" },
  { key: "done", num: "03", label: "Done" },
] as const;

export function CartSheet() {
  const open = useCartStore((s) => s.open);
  const step = useCartStore((s) => s.step);
  const closeBag = useCartStore((s) => s.closeBag);

  const title =
    step === "bag"
      ? "Your bag"
      : step === "details"
      ? "Details"
      : step === "payment"
      ? "Payment"
      : "Thank you";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && closeBag()}>
      <SheetContent className="flex w-full flex-col gap-0 p-6 sm:max-w-[420px]">
        <SheetHeader className="p-0">
          <div className="flex items-baseline justify-between gap-4">
            <SheetTitle className="font-heading text-[28px] font-normal leading-[1.14]">
              {title}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Your bag and checkout
          </SheetDescription>
        </SheetHeader>

        {step !== "bag" && step !== "done" ? (
          <div className="mt-4 flex gap-2">
            {STEPS.map((s) => {
                const stepOrder = ["details", "payment", "done"];
                const current = stepOrder.indexOf(step);
                const thisIndex = stepOrder.indexOf(s.key);
                const on = thisIndex === current;
                const past = thisIndex < current;
                return (
                  <div
                    key={s.key}
                    className={cn(
                      "flex flex-1 items-center gap-1.5 border-t px-2 py-1.5 text-[11px] tracking-[0.09em] uppercase",
                      on || past ? "border-accent" : "border-border",
                      on
                        ? "text-accent-2"
                        : past
                        ? "text-foreground/60"
                        : "text-foreground/38"
                    )}
                  >
                    <span className="font-feature-tnum">{s.num}</span>
                    <span>{s.label}</span>
                  </div>
                );
              })}
          </div>
        ) : null}

        <div className="mt-4.5 border-t border-border" />

        {step === "bag" ? <BagView /> : null}
        {step === "details" ? <DetailsView /> : null}
        {step === "payment" ? <PaymentView /> : null}
        {step === "done" ? <DoneView /> : null}
      </SheetContent>
    </Sheet>
  );
}

function BagView() {
  const bag = useCartStore((s) => s.bag);
  const total = useCartStore((s) => s.total());
  const decrementLine = useCartStore((s) => s.decrementLine);
  const incrementLine = useCartStore((s) => s.incrementLine);
  const removeLine = useCartStore((s) => s.removeLine);
  const changeLineSize = useCartStore((s) => s.changeLineSize);
  const startCheckout = useCartStore((s) => s.startCheckout);
  const closeBag = useCartStore((s) => s.closeBag);

  if (bag.length === 0) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <h3 className="font-heading text-xl font-normal">
          Nothing in the bag yet.
        </h3>
        <p className="text-[14.5px] leading-7 text-foreground/70">
          Volume 01 is five pieces. Open any of them for the cloth, the fit
          and the sizes still running.
        </p>
        <Button
          render={<Link href="/#collection" onClick={closeBag} />}
          nativeButton={false}
          variant="outline"
          className="self-start border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
          See the collection
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto">
        {bag.map((line) => {
          const product = productForLine(line.productId);
          const madeToOrder = product?.badge === "Made to order";
          return (
            <div
              key={line.key}
              className="grid grid-cols-[64px_minmax(0,1fr)] gap-4 border-b border-border py-5"
            >
              <div className="relative aspect-3/4 w-16 overflow-hidden">
                <ProductImage alt={line.name} hint={line.name} />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-lg font-normal leading-tight">
                    {line.name}
                  </h3>
                  <span className="text-[13.5px] text-foreground/78 font-feature-tnum">
                    {formatMoney(line.qty * line.unit)}
                  </span>
                </div>
                <p className="mt-2 text-xs tracking-[0.08em] text-foreground/55 uppercase">
                  {line.color} · Size {line.size}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {madeToOrder ? (
                    <span className="text-[11px] tracking-[0.08em] text-accent-2 uppercase">
                      Cut to measure
                    </span>
                  ) : (
                    <Select
                      value={line.size}
                      onValueChange={(v) => v && changeLineSize(line.key, v)}
                    >
                      <SelectTrigger
                        size="sm"
                        aria-label="Size"
                        className="h-auto min-h-0 gap-1.5 border-border px-2 py-1 text-[13px] font-feature-tnum shadow-none"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            disabled={product?.out.includes(s)}
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <div className="flex items-center gap-0.5 rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => decrementLine(line.key)}
                      aria-label="Decrease quantity"
                      className="flex size-7 items-center justify-center"
                    >
                      <Minus className="size-3" strokeWidth={1.6} />
                    </button>
                    <span className="min-w-[22px] text-center text-[13.5px] font-feature-tnum">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => incrementLine(line.key)}
                      aria-label="Increase quantity"
                      className="flex size-7 items-center justify-center"
                    >
                      <Plus className="size-3" strokeWidth={1.6} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    className="text-xs tracking-[0.06em] text-foreground/52 underline underline-offset-3 uppercase"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="pt-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs tracking-[0.09em] text-foreground/58 uppercase">
            Subtotal
          </span>
          <span className="font-heading text-2xl font-feature-tnum">
            {formatMoney(total)}
          </span>
        </div>
        <p className="mt-2.5 text-[12.5px] leading-[22px] text-foreground/60">
          Shipping and duties calculated at checkout. Made-to-order pieces
          ship in six weeks.
        </p>
        <Button
          type="button"
          onClick={startCheckout}
          variant="outline"
          className="mt-4 w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
          Checkout — {formatMoney(total)}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={closeBag}
          className="mt-2 w-full text-accent hover:bg-accent/10 hover:text-accent"
        >
          Keep looking
        </Button>
      </div>
    </>
  );
}

function DetailsView() {
  const submitDetails = useCartStore((s) => s.submitDetails);
  const backToBag = useCartStore((s) => s.backToBag);
  const total = useCartStore((s) => s.total());
  const count = useCartStore((s) => s.count());

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        submitDetails({
          email: String(f.get("email") ?? ""),
          name: String(f.get("name") ?? ""),
          city: String(f.get("city") ?? ""),
          postcode: String(f.get("post") ?? ""),
        });
      }}
      className="flex flex-1 flex-col overflow-y-auto pt-5"
    >
      <div className="grid gap-3.5">
        <Field label="Email" id="ck-email">
          <Input id="ck-email" name="email" type="email" required placeholder="you@example.com" />
        </Field>
        <Field label="Full name" id="ck-name">
          <Input id="ck-name" name="name" type="text" required placeholder="As it appears on the card" />
        </Field>
        <Field label="Address" id="ck-addr">
          <Input id="ck-addr" name="addr" type="text" required placeholder="Street and number" />
        </Field>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3.5">
          <Field label="City" id="ck-city">
            <Input id="ck-city" name="city" type="text" required placeholder="London" />
          </Field>
          <Field label="Postcode" id="ck-post">
            <Input id="ck-post" name="post" type="text" required placeholder="E2 7DP" />
          </Field>
        </div>
        <Field label="Country" id="ck-country">
          <Input id="ck-country" name="country" type="text" required defaultValue="United Kingdom" />
        </Field>
      </div>
      <div className="mt-auto pt-6">
        <div className="border-t border-border pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-xs tracking-[0.09em] text-foreground/58 uppercase">
              {count === 1 ? "1 piece" : `${count} pieces`}
            </span>
            <span className="font-heading text-[22px] font-feature-tnum">
              {formatMoney(total)}
            </span>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="mt-4 w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
          >
            Continue to payment
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={backToBag}
            className="mt-2 w-full text-accent hover:bg-accent/10 hover:text-accent"
          >
            Back to bag
          </Button>
        </div>
      </div>
    </form>
  );
}

function PaymentView() {
  const bag = useCartStore((s) => s.bag);
  const total = useCartStore((s) => s.total());
  const paying = useCartStore((s) => s.paying);
  const order = useCartStore((s) => s.order);
  const submitPayment = useCartStore((s) => s.submitPayment);
  const goToDetails = useCartStore((s) => s.goToDetails);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitPayment();
      }}
      className="flex flex-1 flex-col overflow-y-auto pt-5"
    >
      <p className="mb-4.5 text-[13px] leading-[23px] text-foreground/66">
        Shipping to {order?.shipTo ?? "—"} ·{" "}
        <button
          type="button"
          onClick={goToDetails}
          className="text-accent-2 underline underline-offset-3"
        >
          edit
        </button>
      </p>
      <div className="grid gap-3.5">
        <Field label="Card number" id="ck-card">
          <Input
            id="ck-card"
            name="card"
            type="text"
            inputMode="numeric"
            required
            placeholder="4242 4242 4242 4242"
            className="font-feature-tnum"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Expiry" id="ck-exp">
            <Input
              id="ck-exp"
              name="exp"
              type="text"
              inputMode="numeric"
              required
              placeholder="09 / 29"
              className="font-feature-tnum"
            />
          </Field>
          <Field label="CVC" id="ck-cvc">
            <Input
              id="ck-cvc"
              name="cvc"
              type="text"
              inputMode="numeric"
              required
              placeholder="123"
              className="font-feature-tnum"
            />
          </Field>
        </div>
      </div>

      <div className="my-5.5 border-t border-border" />

      <div className="grid gap-2 text-[13.5px]">
        {bag.map((line) => (
          <div
            key={line.key}
            className="flex justify-between gap-4 text-foreground/74"
          >
            <span>
              {line.name} — {line.size} × {line.qty}
            </span>
            <span className="font-feature-tnum">
              {formatMoney(line.qty * line.unit)}
            </span>
          </div>
        ))}
        <div className="flex justify-between gap-4 text-foreground/74">
          <span>Shipping — tracked, two days</span>
          <span className="font-feature-tnum">Free</span>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="border-t border-border pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-xs tracking-[0.09em] text-foreground/58 uppercase">
              Total
            </span>
            <span className="font-heading text-2xl font-feature-tnum">
              {formatMoney(total)}
            </span>
          </div>
          <Button
            type="submit"
            disabled={paying}
            variant="outline"
            className="mt-4 w-full border-accent text-accent hover:bg-accent/10 hover:text-accent"
          >
            {paying ? "Taking payment…" : `Pay ${formatMoney(total)}`}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={goToDetails}
            className="mt-2 w-full text-accent hover:bg-accent/10 hover:text-accent"
          >
            Back to details
          </Button>
        </div>
      </div>
    </form>
  );
}

function DoneView() {
  const order = useCartStore((s) => s.order);
  const finishOrder = useCartStore((s) => s.finishOrder);

  const count = order?.count ?? 0;
  const summary =
    count === 1 ? "One piece from Volume 01" : `${count} pieces from Volume 01`;

  return (
    <div className="flex flex-1 flex-col justify-center gap-4 pt-5">
      <span className="flex size-[42px] items-center justify-center rounded-full border border-accent text-accent-2">
        <Check className="size-[19px]" strokeWidth={1.4} />
      </span>
      <h3 className="font-heading text-[26px] font-normal leading-[1.16]">
        Order {order?.no} is placed.
      </h3>
      <p className="text-[14.5px] leading-7 text-foreground/72">
        A receipt is on its way to {order?.email || "your inbox"}. {summary} —
        we cut, press and post within two working days, and we mend it free
        for as long as you own it.
      </p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-[13.5px]">
        <dt className="text-foreground/55">Paid</dt>
        <dd className="font-feature-tnum">{order?.paid}</dd>
        <dt className="text-foreground/55">Ships to</dt>
        <dd>{order?.shipTo}</dd>
      </dl>
      <Button
        type="button"
        onClick={finishOrder}
        variant="outline"
        className="mt-2 self-start border-accent text-accent hover:bg-accent/10 hover:text-accent"
      >
        Back to Volume 01
      </Button>
    </div>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs text-foreground/70">
        {label}
      </Label>
      {children}
    </div>
  );
}
