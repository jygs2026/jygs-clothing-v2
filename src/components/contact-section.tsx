"use client";

import { Check, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { SocialLinks } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "@/hooks/use-form";
import { CONTACT_EMAIL, whatsappDisplay, whatsappLink } from "@/lib/site-config";
import { all, email, maxLength, minLength, personName } from "@/lib/validation";

const TOPICS = [
  "General enquiry",
  "Order & shipping",
  "Customization & printing",
  "Made to order / fittings",
  "Repairs & care",
  "Press & wholesale",
];

const DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: Phone,
    label: "WhatsApp",
    value: whatsappDisplay(),
    href: whatsappLink("Hello JYGS — I have a question."),
  },
  {
    icon: MapPin,
    label: "Atelier",
    value: "Cut in London, sewn in Porto",
    href: undefined as string | undefined,
  },
];

export function ContactSection() {
  const [sent, setSent] = useState("");

  const form = useForm({
    id: "ct",
    fields: {
      name: { validate: personName("Your name") },
      email: { validate: email() },
      topic: { initial: TOPICS[0] },
      message: {
        validate: all(
          minLength(10, "The message"),
          maxLength(1200, "The message")
        ),
      },
    },
    onSubmit: (values) => setSent(values.name.trim()),
  });

  return (
    <section
      id="contact"
      className="grid scroll-mt-[120px] grid-cols-1 items-start gap-11 py-16 min-[860px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[860px]:gap-x-18"
    >
      <div>
        <span className="mb-3.5 block text-[13px] tracking-[0.08em] text-accent-2 uppercase font-feature-tnum">
          Get in touch
        </span>
        <h2 className="font-heading text-[30px] font-normal leading-[1.14] tracking-[-0.008em] sm:text-[42px]">
          Talk to the studio
        </h2>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-[26px] text-foreground/72">
          Questions about fit, an order, a repair, a commission or wholesale
          — write in and a person on the small team answers, usually within a
          working day.
        </p>

        {!sent ? (
          <form onSubmit={form.handleSubmit} noValidate className="mt-8 grid max-w-[520px] gap-4.5">
            <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
              <FormField
                form={form}
                name="name"
                label="Name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
              />
              <FormField
                form={form}
                name="email"
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <FormField form={form} name="topic" label="Topic">
              <Select
                name="topic"
                value={form.values.topic}
                onValueChange={(value) => form.setValue("topic", String(value))}
              >
                <SelectTrigger id="ct-topic" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField
              form={form}
              name="message"
              label="Message"
              as="textarea"
              rows={5}
              placeholder="How can we help?"
              hint="A line about the piece, the order number, or the fit you are after."
            />
            <Button
              type="submit"
              variant="outline"
              className="w-full border-accent text-accent hover:bg-accent/10 hover:text-accent sm:w-auto sm:px-10"
            >
              Send message
            </Button>
          </form>
        ) : (
          <div className="mt-8 flex max-w-[520px] flex-col gap-3.5">
            <span className="flex items-center gap-2.5 text-[14.5px] leading-[26px] text-accent-2">
              <Check className="size-[17px]" strokeWidth={1.4} />
              Message sent{sent ? `, ${sent}` : ""} — thank you.
            </span>
            <p className="text-sm leading-[25px] text-foreground/70">
              We read every note ourselves and reply from a person, not a
              queue. Expect to hear back within one working day.
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                form.reset();
                setSent("");
              }}
              className="self-start text-accent hover:bg-accent/10 hover:text-accent"
            >
              Send another
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border border-border p-6">
        <h3 className="font-heading text-xl font-normal leading-tight">
          Reach us directly
        </h3>
        <dl className="mt-5.5 grid gap-5">
          {DETAILS.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/60">
                <Icon className="size-4" strokeWidth={1.4} />
              </span>
              <div>
                <dt className="text-[11px] tracking-[0.11em] text-foreground/50 uppercase">
                  {label}
                </dt>
                {href ? (
                  <dd className="mt-0.5">
                    <a
                      href={href}
                      className="text-[14.5px] text-accent-2 transition-colors hover:text-accent"
                    >
                      {value}
                    </a>
                  </dd>
                ) : (
                  <dd className="mt-0.5 text-[14.5px] text-foreground/80">{value}</dd>
                )}
              </div>
            </div>
          ))}
        </dl>

        <div className="my-6 border-t border-border" />

        <span className="block text-[11px] tracking-[0.11em] text-foreground/50 uppercase">
          Follow along
        </span>
        <SocialLinks className="mt-3" />

        <p className="mt-6 text-[12.5px] leading-[21px] text-foreground/55">
          Studio hours: Monday–Friday, 9:00–18:00 GMT. Messages outside these
          hours are answered the next working day.
        </p>
      </div>
    </section>
  );
}
