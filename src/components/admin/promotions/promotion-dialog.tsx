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
import { Switch } from "@/components/ui/switch";
import { money } from "@/lib/admin/format";
import {
  PROMOTION_KINDS,
  type Promotion,
  type PromotionKind,
} from "@/lib/admin/promotions";
import { usePromotionStore, type PromotionDraft } from "@/lib/admin/promotions-store";

type Values = {
  code: string;
  name: string;
  kind: PromotionKind;
  value: string;
  minimum: string;
  limit: string;
  starts: string;
  ends: string;
  active: boolean;
};

const today = () => new Date().toISOString().slice(0, 10);

/** Whether the offer itself carries a figure, or is the whole offer already. */
function hasValue(kind: PromotionKind) {
  return kind === "Percent off" || kind === "Amount off";
}

export function PromotionDialog({
  open,
  onOpenChange,
  promotion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null when creating. */
  promotion: Promotion | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-admin sm:max-w-[560px]">
        {open ? (
          <PromotionForm
            key={promotion?.id ?? "new"}
            promotion={promotion}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PromotionForm({
  promotion,
  onDone,
}: {
  promotion: Promotion | null;
  onDone: () => void;
}) {
  const promotions = usePromotionStore((s) => s.promotions);
  const addPromotion = usePromotionStore((s) => s.addPromotion);
  const updatePromotion = usePromotionStore((s) => s.updatePromotion);

  const [values, setValues] = useState<Values>(() =>
    promotion
      ? {
          code: promotion.code,
          name: promotion.name,
          kind: promotion.kind,
          value: String(promotion.value),
          minimum: String(promotion.minimum),
          limit: String(promotion.limit),
          starts: promotion.starts,
          ends: promotion.ends,
          active: promotion.active,
        }
      : {
          code: "",
          name: "",
          kind: "Percent off",
          value: "",
          minimum: "0",
          limit: "0",
          starts: today(),
          ends: "",
          active: true,
        }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = values.code.trim().toUpperCase();
    const clash = promotions.some(
      (other) => other.code.toUpperCase() === code && other.id !== promotion?.id
    );
    const value = Number(values.value);
    const wantsValue = hasValue(values.kind);

    const found: Partial<Record<keyof Values, string>> = {
      code: !code
        ? "A code is needed."
        : !/^[A-Z0-9]{4,16}$/.test(code)
          ? "Four to sixteen letters and numbers, no spaces."
          : clash
            ? "That code is already in use."
            : undefined,
      name: values.name.trim().length >= 3 ? undefined : "Say what this offer is.",
      value: !wantsValue
        ? undefined
        : !Number.isFinite(value) || value <= 0
          ? "How much comes off."
          : values.kind === "Percent off" && value > 90
            ? "Over 90% off is almost always a typo."
            : undefined,
      starts: values.starts ? undefined : "A start date is needed.",
      ends: !values.ends
        ? "An end date is needed."
        : values.ends < values.starts
          ? "It cannot end before it starts."
          : undefined,
    };

    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      return;
    }

    const draft: PromotionDraft = {
      code,
      name: values.name.trim(),
      kind: values.kind,
      // Free shipping and a gift are the whole offer; carrying a stale figure
      // from a kind the reader changed away from would show "0% off".
      value: wantsValue ? Math.round(value) : 0,
      minimum: Math.max(0, Math.round(Number(values.minimum) || 0)),
      limit: Math.max(0, Math.round(Number(values.limit) || 0)),
      starts: values.starts,
      ends: values.ends,
      active: values.active,
    };

    if (promotion) {
      updatePromotion(promotion.id, draft);
      toast(`${draft.code} updated.`);
    } else {
      addPromotion(draft);
      toast(`${draft.code} created.`, {
        description: draft.active
          ? "It is running from its start date."
          : "It is saved but switched off.",
      });
    }
    onDone();
  }

  const minimum = Number(values.minimum) || 0;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{promotion ? "Edit promotion" : "Create a promotion"}</DialogTitle>
        <DialogDescription>
          {promotion
            ? "Changing the terms does not alter baskets that already used the code."
            : "A code, what it takes off, and how long it runs."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-1 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
          <Field
            id="promotion-code"
            label="Code"
            value={values.code}
            onChange={(value) =>
              set("code", value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16))
            }
            error={errors.code}
            className="h-10 sm:h-9 font-admin-mono tracking-[0.06em]"
            placeholder="VOLUME01"
          />
          <Field
            id="promotion-name"
            label="What it is"
            value={values.name}
            onChange={(value) => set("name", value)}
            error={errors.name}
            placeholder="Volume 01 launch"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-foreground/70">Offer</Label>
            <Select
              value={values.kind}
              onValueChange={(value) => set("kind", value as PromotionKind)}
              items={PROMOTION_KINDS.map((kind) => ({ value: kind, label: kind }))}
            >
              <SelectTrigger size="field" aria-label="Offer" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROMOTION_KINDS.map((kind) => (
                  <SelectItem key={kind} value={kind}>
                    {kind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Free shipping and a gift have no figure to set, so the field is
              not shown greyed out — it is simply not part of that offer. */}
          {hasValue(values.kind) ? (
            <Field
              id="promotion-value"
              label={values.kind === "Percent off" ? "Percent off" : "Amount off (₹)"}
              inputMode="numeric"
              value={values.value}
              onChange={(value) => set("value", value.replace(/[^\d]/g, "").slice(0, 6))}
              error={errors.value}
              className="h-10 sm:h-9 font-feature-tnum"
              placeholder={values.kind === "Percent off" ? "15" : "2000"}
            />
          ) : (
            <div className="hidden sm:block" aria-hidden="true" />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="promotion-minimum"
            label="Basket has to reach (₹)"
            inputMode="numeric"
            value={values.minimum}
            onChange={(value) => set("minimum", value.replace(/[^\d]/g, ""))}
            className="h-10 sm:h-9 font-feature-tnum"
            hint={minimum > 0 ? `Baskets under ${money(minimum)} cannot use it.` : "0 for no minimum."}
          />
          <Field
            id="promotion-limit"
            label="Times it can be used"
            inputMode="numeric"
            value={values.limit}
            onChange={(value) => set("limit", value.replace(/[^\d]/g, ""))}
            className="h-10 sm:h-9 font-feature-tnum"
            hint="0 for no ceiling."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="promotion-starts"
            label="Starts"
            type="date"
            value={values.starts}
            onChange={(value) => set("starts", value)}
            error={errors.starts}
          />
          <Field
            id="promotion-ends"
            label="Ends"
            type="date"
            value={values.ends}
            onChange={(value) => set("ends", value)}
            error={errors.ends}
          />
        </div>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-border px-3.5 py-3">
          <span className="min-w-0">
            <span className="block text-[13.5px] font-medium">Switched on</span>
            <span className="mt-0.5 block text-[12.5px] text-foreground/55">
              A code that is off is kept, but never accepted at checkout.
            </span>
          </span>
          <Switch
            checked={values.active}
            onCheckedChange={(checked) => set("active", checked)}
            aria-label="Switched on"
          />
        </label>

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" size="lg" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {promotion ? "Save changes" : "Create promotion"}
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
  hint,
  className,
  ...props
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
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
        className={className ?? "h-10 sm:h-9"}
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
      {hint && !error ? (
        <p className="mt-1.5 text-[12px] leading-[18px] text-foreground/50">{hint}</p>
      ) : null}
    </div>
  );
}
