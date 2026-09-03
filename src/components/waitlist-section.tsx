"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useForm } from "@/hooks/use-form";
import { email } from "@/lib/validation";

export function WaitlistSection() {
  const [joined, setJoined] = useState(false);

  const form = useForm({
    id: "wl",
    fields: { email: { validate: email() } },
    onSubmit: () => setJoined(true),
  });

  return (
    <section id="waitlist" className="scroll-mt-[120px] py-16">
      <h2 className="max-w-[26ch] ml-[-0.042em] font-heading text-4xl font-normal leading-[1.1] tracking-[-0.01em] sm:text-5xl">
        Be first when Volume 01 opens.
      </h2>
      <p className="mt-6 max-w-[56ch] text-base leading-7 text-foreground/78">
        The waitlist gets the size run twenty-four hours early, and a note on
        what the cloth does after a year of wearing. Nothing else.
      </p>

      {!joined ? (
        <form
          onSubmit={form.handleSubmit}
          noValidate
          className="mt-7 flex max-w-[480px] flex-wrap items-start gap-3.5"
        >
          <FormField
            form={form}
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            rootClassName="min-w-[220px] flex-1 [&_label]:sr-only"
            className="min-h-[38px]"
          />
          <Button
            type="submit"
            variant="outline"
            className="min-h-[38px] flex-1 border-accent whitespace-nowrap text-accent hover:bg-accent/10 hover:text-accent sm:flex-none"
          >
            Join the waitlist
          </Button>
        </form>
      ) : (
        <p className="mt-7 flex items-center gap-2.5 text-[15px] leading-7 text-accent-2">
          <Check className="size-[17px]" strokeWidth={1.4} />
          You&apos;re on the list. We write once before the drop and never
          otherwise.
        </p>
      )}

      <p className="mt-5 text-xs tracking-[0.09em] text-foreground/52 uppercase font-feature-tnum">
        One letter per volume · 2,410 already waiting
      </p>
    </section>
  );
}
