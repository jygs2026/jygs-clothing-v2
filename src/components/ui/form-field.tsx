"use client";

import { AlertCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormApi } from "@/hooks/use-form";

/**
 * One field: label, control, and the message when something is wrong. The
 * control is wired to the form for you — pass `children` only for a control
 * this cannot render itself, such as a Select.
 */
export function FormField<K extends string>({
  form,
  name,
  label,
  hint,
  as = "input",
  rootClassName,
  children,
  ...props
}: {
  form: FormApi<K>;
  name: K;
  label: string;
  /** Quiet guidance under the field; hidden while an error is showing. */
  hint?: string;
  as?: "input" | "textarea";
  /** Classes for the wrapper; `className` goes to the control itself. */
  rootClassName?: string;
  /** Textarea only. */
  rows?: number;
  children?: ReactNode;
} & Omit<ComponentProps<"input">, "form" | "name" | "value" | "onChange" | "onBlur">) {
  const id = `${form.id}-${name}`;
  const error = form.errorFor(name);
  const field = form.field(name);

  return (
    <div className={rootClassName}>
      <Label htmlFor={id} className="mb-1.5 text-xs text-foreground/70">
        {label}
      </Label>

      {children ??
        (as === "textarea" ? (
          <Textarea {...field} {...(props as ComponentProps<"textarea">)} />
        ) : (
          <Input {...field} {...props} />
        ))}

      <FieldError id={`${id}-error`} message={error} />
      {hint && !error ? (
        <p className="mt-1.5 text-[12px] leading-[18px] text-foreground/50">{hint}</p>
      ) : null}
    </div>
  );
}

/** The message itself, so a hand-rolled field can show one the same way. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-[18px] text-destructive"
    >
      <AlertCircle className="mt-px size-3.5 shrink-0" strokeWidth={1.6} />
      {message}
    </p>
  );
}
