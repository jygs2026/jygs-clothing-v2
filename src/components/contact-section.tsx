"use client";

import { Check, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { SOCIAL_LINKS } from "@/components/social-icons";
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
import { Textarea } from "@/components/ui/textarea";

const TOPICS = [
  "General enquiry",
  "Order & shipping",
  "Made to order / fittings",
  "Repairs & care",
  "Press & wholesale",
];

const DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: "hello@jygs.co",
    href: "mailto:hello@jygs.co",
  },
  {
    icon: Phone,
    label: "WhatsApp",
    value: "+91 12345 67890",
    href: "https://wa.me/911234567890",
  },
  {
    icon: MapPin,
    label: "Atelier",
    value: "Cut in London, sewn in Porto",
    href: undefined as string | undefined,
  },
];

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");

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
          Questions about fit, an order, a repair or wholesale — write in and
          a person on the small team answers, usually within a working day.
        </p>

        {!sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="mt-8 grid max-w-[520px] gap-4.5"
          >
            <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
              <div>
                <Label htmlFor="ct-name" className="mb-1.5 text-xs text-foreground/70">
                  Name
                </Label>
                <Input
                  id="ct-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="ct-email" className="mb-1.5 text-xs text-foreground/70">
                  Email
                </Label>
                <Input id="ct-email" name="email" type="email" required placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <Label htmlFor="ct-topic" className="mb-1.5 text-xs text-foreground/70">
                Topic
              </Label>
              <Select name="topic" defaultValue={TOPICS[0]}>
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
            </div>
            <div>
              <Label htmlFor="ct-message" className="mb-1.5 text-xs text-foreground/70">
                Message
              </Label>
              <Textarea id="ct-message" name="message" rows={5} required placeholder="How can we help?" />
            </div>
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
              Message sent{name ? `, ${name}` : ""} — thank you.
            </span>
            <p className="text-sm leading-[25px] text-foreground/70">
              We read every note ourselves and reply from a person, not a
              queue. Expect to hear back within one working day.
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSent(false)}
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
        <div className="mt-3 flex items-center gap-3">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={label}
              className="flex size-8 items-center justify-center rounded-full border border-border text-foreground/60 transition-colors hover:border-accent hover:text-accent-2"
            >
              <Icon className="size-[16px]" />
            </a>
          ))}
        </div>

        <p className="mt-6 text-[12.5px] leading-[21px] text-foreground/55">
          Studio hours: Monday–Friday, 9:00–18:00 GMT. Messages outside these
          hours are answered the next working day.
        </p>
      </div>
    </section>
  );
}
