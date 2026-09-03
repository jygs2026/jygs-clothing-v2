"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

import type { Validator } from "@/lib/validation";

/**
 * The small amount of form machinery this site needs: values, per-field
 * rules, and the timing that makes validation feel considered rather than
 * nagging — nothing is marked wrong until the reader has left the field or
 * pressed the button, and once a field is in error it re-checks on every
 * keystroke so the message disappears the moment it is fixed.
 */

export type FieldSpec = {
  initial?: string;
  validate?: Validator;
  /** Keystroke-level shaping: masks, grouping, truncation. */
  format?: (next: string, prev: string) => string;
};

export type FieldProps = {
  id: string;
  name: string;
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  onBlur: () => void;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

export type FormApi<K extends string> = {
  /** Prefix for field ids, so two forms on one page cannot collide. */
  id: string;
  values: Record<K, string>;
  /** True while an async onSubmit is in flight. */
  submitting: boolean;
  /** Everything an Input or Textarea needs to take part in the form. */
  field: (name: K) => FieldProps;
  errorFor: (name: K) => string | undefined;
  setValue: (name: K, value: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  reset: () => void;
};

export function useForm<K extends string>({
  id,
  fields,
  onSubmit,
}: {
  id: string;
  fields: Record<K, FieldSpec>;
  onSubmit: (values: Record<K, string>) => void | Promise<void>;
}): FormApi<K> {
  // Specs and the submit handler are declared inline at the call site, so they
  // are new objects on every render — hold the latest in refs rather than
  // rebuilding every callback each time. They are read only from handlers,
  // which run long after the effect below has caught them up.
  const specs = useRef(fields);
  const submit = useRef(onSubmit);
  useEffect(() => {
    specs.current = fields;
    submit.current = onSubmit;
  });

  // Captured once: a form does not re-seed itself under the reader's hands.
  const [initial] = useState<Record<K, string>>(
    () =>
      Object.fromEntries(
        (Object.keys(fields) as K[]).map((name) => [name, fields[name].initial ?? ""])
      ) as Record<K, string>
  );

  const [values, setValues] = useState<Record<K, string>>(initial);
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<K, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const check = useCallback((name: K, all: Record<K, string>) => {
    const rule = specs.current[name]?.validate;
    return rule ? rule(all[name], all) ?? undefined : undefined;
  }, []);

  const setValue = useCallback(
    (name: K, raw: string) => {
      const format = specs.current[name]?.format;
      const value = format ? format(raw, values[name]) : raw;
      if (value === values[name]) return;
      const next = { ...values, [name]: value };
      setValues(next);
      // Only a field already showing a message re-checks on every keystroke;
      // one being filled in for the first time is left in peace.
      setErrors((current) =>
        current[name] === undefined ? current : { ...current, [name]: check(name, next) }
      );
    },
    [check, values]
  );

  const field = useCallback(
    (name: K): FieldProps => ({
      id: `${id}-${name}`,
      name,
      value: values[name],
      onChange: (event) => setValue(name, event.target.value),
      onBlur: () => {
        setTouched((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: check(name, values) }));
      },
      "aria-invalid": errors[name] && touched[name] ? true : undefined,
      "aria-describedby": errors[name] && touched[name] ? `${id}-${name}-error` : undefined,
    }),
    [check, errors, id, setValue, touched, values]
  );

  const errorFor = useCallback(
    (name: K) => (touched[name] ? errors[name] : undefined),
    [errors, touched]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (submitting) return;

      const names = Object.keys(specs.current) as K[];
      const found: Partial<Record<K, string>> = {};
      for (const name of names) found[name] = check(name, values);

      setErrors(found);
      setTouched(Object.fromEntries(names.map((name) => [name, true])) as Record<K, boolean>);

      const firstBad = names.find((name) => found[name]);
      if (firstBad) {
        // Put the reader where the problem is instead of leaving them to
        // hunt for the red line.
        document.getElementById(`${id}-${firstBad}`)?.focus();
        return;
      }

      const result = submit.current(values);
      if (result instanceof Promise) {
        setSubmitting(true);
        result.finally(() => setSubmitting(false));
      }
    },
    [check, id, submitting, values]
  );

  const reset = useCallback(() => {
    setValues(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  return { id, values, submitting, field, errorFor, setValue, handleSubmit, reset };
}
