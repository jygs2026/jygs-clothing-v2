"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ImageDrop } from "@/components/admin/image-drop";
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
import {
  CATEGORIES,
  PRODUCT_STATUSES,
  categoryOf,
  type CatalogueItem,
  type ProductStatus,
} from "@/lib/admin/catalogue";
import { nextSku, useCatalogueStore, type ProductDraft } from "@/lib/admin/catalogue-store";
import { money } from "@/lib/admin/format";

type Values = {
  name: string;
  sku: string;
  category: string;
  price: string;
  cost: string;
  status: ProductStatus;
  cloth: string;
  colours: string;
  image: string;
};

/** Adding a piece and editing one ask the same things, so it is one form. */
export function ProductDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Null when adding. */
  product: CatalogueItem | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="font-admin sm:max-w-[560px]">
        {/* Mounted only while showing, and keyed by what it shows, so the
            fields seed themselves on the way in rather than in an effect. */}
        {open ? (
          <ProductForm
            key={product?.id ?? "new"}
            product={product}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ProductForm({
  product,
  onDone,
}: {
  product: CatalogueItem | null;
  onDone: () => void;
}) {
  const items = useCatalogueStore((s) => s.items);
  const addProduct = useCatalogueStore((s) => s.addProduct);
  const updateProduct = useCatalogueStore((s) => s.updateProduct);

  const [values, setValues] = useState<Values>(() =>
    product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          price: String(product.price),
          cost: String(product.cost),
          status: product.status,
          cloth: product.cloth,
          colours: String(product.colours),
          image: product.image ?? "",
        }
      : {
          name: "",
          sku: "",
          category: "",
          price: "",
          cost: "",
          // A new piece is a draft until somebody says otherwise. Publishing
          // by default is how half-finished products reach the shop.
          status: "Draft",
          cloth: "",
          colours: "1",
          image: "",
        }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }

  /**
   * The shelf decides the SKU's prefix, so choosing a category fills the code
   * in — but only while adding, and only while the reader has not written
   * their own. Renumbering a piece that is already cut and labelled would
   * break the one thing a SKU is for.
   */
  function setCategory(category: string) {
    setValues((prev) => ({
      ...prev,
      category,
      sku:
        product || (prev.sku && prev.sku !== nextSku(items, prev.category))
          ? prev.sku
          : nextSku(items, category),
    }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  }

  const price = Number(values.price);
  const cost = Number(values.cost);
  // Shown live rather than on submit: the margin is the number the decision
  // actually turns on, and it is invisible until both figures are in.
  const marginable = price > 0 && cost >= 0 && cost <= price;
  const marginPercent = marginable ? ((price - cost) / price) * 100 : null;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const sku = values.sku.trim().toUpperCase();
    const clash = items.some(
      (item) => item.sku.toUpperCase() === sku && item.id !== product?.id
    );

    const found: Partial<Record<keyof Values, string>> = {
      name: values.name.trim().length >= 2 ? undefined : "A name is needed.",
      sku: !sku
        ? "A SKU is needed."
        : !/^[A-Z0-9-]{3,}$/.test(sku)
          ? "Letters, numbers and hyphens — JYGS-KNI-014."
          : clash
            ? "Another piece already carries that SKU."
            : undefined,
      category: values.category ? undefined : "Pick a shelf.",
      price:
        Number.isFinite(price) && price > 0
          ? undefined
          : "What the shop charges, in rupees.",
      cost:
        Number.isFinite(cost) && cost >= 0
          ? cost > price && price > 0
            ? "Cost is above the price — check both figures."
            : undefined
          : "What one costs to make, in rupees.",
      cloth: values.cloth.trim() ? undefined : "Name the cloth.",
      colours:
        Number(values.colours) >= 1 && Number(values.colours) <= 12
          ? undefined
          : "Between 1 and 12.",
    };

    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      return;
    }

    const draft: ProductDraft = {
      name: values.name.trim(),
      sku,
      category: values.category,
      price: Math.round(price),
      cost: Math.round(cost),
      status: values.status,
      cloth: values.cloth.trim(),
      colours: Number(values.colours),
      image: values.image.trim() || undefined,
    };

    if (product) {
      updateProduct(product.id, draft);
      toast(`${draft.name} updated.`);
    } else {
      addProduct(draft);
      toast(`${draft.name} added to the catalogue.`, {
        description:
          "It has nothing on the shelf yet — cut a run on Inventory before it can sell.",
      });
    }
    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{product ? "Edit product" : "Add a product"}</DialogTitle>
        <DialogDescription>
          {product
            ? "What the studio holds about this piece. Stock is changed on Inventory."
            : "A new piece for the catalogue. It starts as a draft with an empty shelf."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="mt-1 grid gap-4">
        <Field
          id="product-name"
          label="Name"
          value={values.name}
          onChange={(value) => {
            set("name", value);
            // A name usually says which shelf it belongs on. Offered, not
            // imposed: it stops the moment somebody picks one for
            // themselves, and it stays quiet until the name actually matches
            // a shelf — guessing "Other" off the first letter typed would
            // lock the field to the one answer that is never right.
            const guess = categoryOf(value);
            if (!product && !values.category && guess !== "Other") setCategory(guess);
          }}
          error={errors.name}
          placeholder="Loopback hoodie"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 text-xs text-foreground/70">Category</Label>
            <Select
              value={values.category}
              onValueChange={(value) => setCategory(value as string)}
              items={CATEGORIES.map((category) => ({ value: category, label: category }))}
            >
              <SelectTrigger
                size="field"
                aria-label="Category"
                aria-invalid={errors.category ? true : undefined}
                className="w-full"
              >
                <SelectValue placeholder="Pick a shelf" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="product-category-error" message={errors.category} />
          </div>

          <Field
            id="product-sku"
            label="SKU"
            value={values.sku}
            onChange={(value) => set("sku", value.toUpperCase())}
            error={errors.sku}
            className="h-10 sm:h-9 font-admin-mono"
            placeholder="JYGS-KNI-014"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="product-price"
            label="Price (₹)"
            inputMode="numeric"
            value={values.price}
            onChange={(value) => set("price", value.replace(/[^\d]/g, ""))}
            error={errors.price}
            className="h-10 sm:h-9 font-feature-tnum"
            placeholder="14500"
          />
          <Field
            id="product-cost"
            label="Cost to make (₹)"
            inputMode="numeric"
            value={values.cost}
            onChange={(value) => set("cost", value.replace(/[^\d]/g, ""))}
            error={errors.cost}
            className="h-10 sm:h-9 font-feature-tnum"
            placeholder="5200"
          />
        </div>

        {marginPercent === null ? null : (
          <p className="-mt-1 text-[12.5px] text-foreground/60">
            Margin{" "}
            <span className="font-medium text-foreground/85 font-feature-tnum">
              {money(price - cost)}
            </span>{" "}
            —{" "}
            <span
              className={
                marginPercent < 45
                  ? "font-medium text-amber-700 dark:text-amber-400"
                  : "font-medium text-emerald-700 dark:text-emerald-400"
              }
            >
              {marginPercent.toFixed(0)}%
            </span>
            {marginPercent < 45 ? " — thin for a short run." : null}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_110px_130px]">
          <Field
            id="product-cloth"
            label="Cloth"
            value={values.cloth}
            onChange={(value) => set("cloth", value)}
            error={errors.cloth}
            placeholder="14oz loopback cotton"
          />
          <Field
            id="product-colours"
            label="Colours"
            inputMode="numeric"
            value={values.colours}
            onChange={(value) => set("colours", value.replace(/[^\d]/g, "").slice(0, 2))}
            error={errors.colours}
            className="h-10 sm:h-9 font-feature-tnum"
          />
          <div>
            <Label className="mb-1.5 text-xs text-foreground/70">Status</Label>
            <Select
              value={values.status}
              onValueChange={(value) => set("status", value as ProductStatus)}
              items={PRODUCT_STATUSES.map((status) => ({ value: status, label: status }))}
            >
              <SelectTrigger size="field" aria-label="Status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ImageDrop
          label="Photograph"
          alt={values.name || "The piece"}
          value={values.image}
          onChange={(next) => set("image", next)}
          hint="Optional. Without one the piece shows its initials."
        />

        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" size="lg" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit" size="lg">
            {product ? "Save changes" : "Add product"}
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
  className,
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
        className={className ?? "h-10 sm:h-9"}
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
