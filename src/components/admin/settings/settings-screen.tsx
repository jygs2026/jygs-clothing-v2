"use client";

import { RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPanel } from "@/components/admin/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMounted } from "@/hooks/use-mounted";
import { money } from "@/lib/admin/format";
import {
  DEFAULT_SETTINGS,
  useSettingsStore,
  type Settings,
} from "@/lib/admin/settings-store";
import { cn } from "@/lib/utils";

/**
 * How the shop behaves. Everything on this page is read by something else —
 * the free-shipping line decides what an order detail shows for postage, the
 * tax rate carves the tax out of every total, the low-stock number is what
 * Inventory calls "low" — so a change here is visible elsewhere immediately.
 */
export function SettingsScreen() {
  const saved = useSettingsStore((s) => s.settings);
  const save = useSettingsStore((s) => s.save);
  const reset = useSettingsStore((s) => s.reset);
  const mounted = useMounted();

  // Edited in a draft rather than live: half-typed numbers must not reach the
  // screens that read these values.
  const [draft, setDraft] = useState<Settings>(saved);
  const [seeded, setSeeded] = useState(false);

  // Settings are restored from localStorage, so the draft has to catch up
  // once — after that it is the reader's.
  if (mounted && !seeded) {
    setSeeded(true);
    setDraft(saved);
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-9">
      <AdminPageHeader
        title="Settings"
        blurb="How the shop behaves: shipping, taxes, and the studio's own details."
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => {
            reset();
            setDraft(DEFAULT_SETTINGS);
            toast("Settings put back to their defaults.");
          }}
        >
          <RotateCcw strokeWidth={1.7} />
          Reset
        </Button>
        <Button
          size="lg"
          disabled={!dirty}
          onClick={() => {
            save(draft);
            toast("Settings saved.", {
              description: "Order totals and stock warnings use them from now on.",
            });
          }}
        >
          <Save strokeWidth={1.7} />
          {dirty ? "Save changes" : "Saved"}
        </Button>
      </AdminPageHeader>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        <Section title="The studio" detail="What a customer sees on a receipt.">
          <Text label="Name" value={draft.studioName} onChange={(v) => set("studioName", v)} />
          <Text
            label="Contact email"
            type="email"
            value={draft.contactEmail}
            onChange={(v) => set("contactEmail", v)}
          />
          <Text
            label="Support phone"
            value={draft.supportPhone}
            onChange={(v) => set("supportPhone", v)}
          />
          <Text
            label="Address"
            value={draft.addressLine}
            onChange={(v) => set("addressLine", v)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="City" value={draft.city} onChange={(v) => set("city", v)} />
            <Text
              label="PIN code"
              value={draft.postcode}
              onChange={(v) => set("postcode", v)}
            />
          </div>
        </Section>

        <Section title="Orders" detail="How orders are numbered and when to worry about stock.">
          <Text
            label="Order prefix"
            value={draft.orderPrefix}
            onChange={(v) => set("orderPrefix", v.toUpperCase().slice(0, 4))}
            hint={`Orders read ${draft.orderPrefix || "JY"}-4821.`}
            mono
          />
          <Number
            label="Warn at this much stock"
            value={draft.lowStockAt}
            onChange={(v) => set("lowStockAt", v)}
            hint="Inventory calls anything at or under this Low stock."
          />
          <Number
            label="Dispatch in (working days)"
            value={draft.dispatchDays}
            onChange={(v) => set("dispatchDays", v)}
            hint="Quoted at checkout."
          />
        </Section>

        <Section title="Shipping" detail="What postage costs, and when it stops costing.">
          <Number
            label="Free shipping over"
            value={draft.freeShippingOver}
            onChange={(v) => set("freeShippingOver", v)}
            hint={`Baskets over ${money(draft.freeShippingOver)} ship free.`}
            prefix="₹"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Number
              label="Standard"
              value={draft.standardShipping}
              onChange={(v) => set("standardShipping", v)}
              prefix="₹"
            />
            <Number
              label="Express"
              value={draft.expressShipping}
              onChange={(v) => set("expressShipping", v)}
              prefix="₹"
            />
          </div>
        </Section>

        <Section title="Tax" detail="What the studio collects, and how it is shown.">
          <Number
            label="Rate"
            value={draft.taxPercent}
            onChange={(v) => set("taxPercent", v)}
            suffix="%"
          />
          <Toggle
            label="Prices include tax"
            detail={
              draft.pricesIncludeTax
                ? "Tax is carved out of the price shown."
                : "Tax is added at checkout."
            }
            checked={draft.pricesIncludeTax}
            onChange={(v) => set("pricesIncludeTax", v)}
          />
        </Section>

        <Section title="Returns" detail="How long somebody has, and what happens to the piece.">
          <Number
            label="Return window (days)"
            value={draft.returnWindowDays}
            onChange={(v) => set("returnWindowDays", v)}
          />
          <Toggle
            label="Put returns back on the shelf"
            detail="Only pieces marked As new."
            checked={draft.restockOnReturn}
            onChange={(v) => set("restockOnReturn", v)}
          />
        </Section>

        <Section title="What the studio is told" detail="Which of these reach the bench.">
          <Toggle
            label="A new order arrives"
            checked={draft.notifyNewOrder}
            onChange={(v) => set("notifyNewOrder", v)}
          />
          <Toggle
            label="A piece runs low"
            detail={`At or under ${draft.lowStockAt} available.`}
            checked={draft.notifyLowStock}
            onChange={(v) => set("notifyLowStock", v)}
          />
          <Toggle
            label="A payment fails"
            checked={draft.notifyFailedPayment}
            onChange={(v) => set("notifyFailedPayment", v)}
          />
          <Toggle
            label="Weekly digest"
            detail="Monday morning, the week behind."
            checked={draft.notifyWeeklyDigest}
            onChange={(v) => set("notifyWeeklyDigest", v)}
          />
        </Section>
      </div>

      {dirty ? (
        <p className="mt-4 text-[12.5px] text-amber-700 dark:text-amber-400">
          You have unsaved changes.
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <AdminPanel className="p-5">
      <h2 className="text-[14px] font-semibold">{title}</h2>
      <p className="mt-0.5 text-[12.5px] text-foreground/55">{detail}</p>
      <div className="mt-4 grid gap-4">{children}</div>
    </AdminPanel>
  );
}

function Text({
  label,
  value,
  onChange,
  hint,
  mono,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  mono?: boolean;
  type?: string;
}) {
  const id = `setting-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs text-foreground/70">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn("h-9", mono && "font-admin-mono text-[13px]")}
      />
      {hint ? <p className="mt-1.5 text-[12px] text-foreground/50">{hint}</p> : null}
    </div>
  );
}

function Number({
  label,
  value,
  onChange,
  hint,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  prefix?: string;
  suffix?: string;
}) {
  const id = `setting-${label.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 text-xs text-foreground/70">
        {label}
      </Label>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[13px] text-foreground/45">
            {prefix}
          </span>
        ) : null}
        <Input
          id={id}
          inputMode="numeric"
          value={String(value)}
          onChange={(event) => {
            // Digits only: a settings field is no place for NaN to get in.
            const digits = event.target.value.replace(/\D/g, "");
            onChange(digits ? globalThis.Number(digits) : 0);
          }}
          className={cn("h-9 font-feature-tnum", prefix && "pl-6", suffix && "pr-7")}
        />
        {suffix ? (
          <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[13px] text-foreground/45">
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1.5 text-[12px] text-foreground/50">{hint}</p> : null}
    </div>
  );
}

function Toggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{label}</p>
        {detail ? <p className="mt-0.5 text-[12px] text-foreground/55">{detail}</p> : null}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
