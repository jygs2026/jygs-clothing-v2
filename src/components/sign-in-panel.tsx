"use client";

import { ChevronLeft, Mail } from "lucide-react";
import { GoogleIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { FieldError, FormField } from "@/components/ui/form-field";
import { useForm } from "@/hooks/use-form";
import { useAuthStore } from "@/lib/auth-store";
import { digitsOnly, email as emailRule, required } from "@/lib/validation";

/**
 * Two ways in and no password field: Google, or a six-digit code by email.
 * Nothing here gates the shop — checkout works signed out, and this is only
 * ever offered, never required.
 */
export function SignInPanel() {
  const step = useAuthStore((s) => s.step);

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="font-heading text-[32px] font-normal leading-[1.1] sm:text-[38px]">
        {step === "code" ? "Check your email" : "Sign in"}
      </h1>
      <p className="mt-2.5 text-[14.5px] leading-[24px] text-foreground/68">
        {step === "code"
          ? "We sent a six-digit code. It is good for ten minutes."
          : "Keep your orders, sizes and addresses in one place. You never need an account to buy — it only saves you typing next time."}
      </p>

      <div className="mt-8">{step === "code" ? <CodeStep /> : <EmailStep />}</div>

      <p className="mt-8 border-t border-border pt-5 text-[12.5px] leading-[21px] text-foreground/52">
        Demo sign-in — no account is created and nothing leaves this browser.
        Google returns a sample customer; any six digits pass as the code.
      </p>
    </div>
  );
}

function EmailStep() {
  const busy = useAuthStore((s) => s.busy);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const sendCode = useAuthStore((s) => s.sendCode);

  const form = useForm({
    id: "signin",
    fields: { email: { validate: emailRule() } },
    onSubmit: (values) => sendCode(values.email.trim()),
  });

  return (
    <div className="grid gap-5">
      <Button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy !== false}
        variant="outline"
        className="h-11 w-full text-[13.5px] tracking-[0.04em]"
      >
        <GoogleIcon className="size-4" />
        {busy === "google" ? "Signing in…" : "Continue with Google"}
      </Button>

      <div className="flex items-center gap-3.5 text-[11px] tracking-[0.11em] text-foreground/45 uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={form.handleSubmit} noValidate className="grid gap-4">
        <FormField
          form={form}
          name="email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Button
          type="submit"
          disabled={busy !== false}
          className="h-11 w-full text-[13.5px] tracking-[0.05em]"
        >
          <Mail className="size-4" strokeWidth={1.5} />
          {busy === "sending" ? "Sending the code…" : "Email me a code"}
        </Button>
      </form>
    </div>
  );
}

function CodeStep() {
  const busy = useAuthStore((s) => s.busy);
  const storeError = useAuthStore((s) => s.error);
  const pendingEmail = useAuthStore((s) => s.pendingEmail);
  const verifyCode = useAuthStore((s) => s.verifyCode);
  const editEmail = useAuthStore((s) => s.editEmail);

  const form = useForm({
    id: "signin-code",
    fields: {
      code: {
        format: digitsOnly(6),
        validate: (value) =>
          required("The code")(value, {}) ??
          (value.length === 6 ? null : "The code is six digits."),
      },
    },
    onSubmit: (values) => verifyCode(values.code),
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="grid gap-4">
      <p className="text-[13.5px] text-foreground/70">
        Sent to <span className="text-foreground">{pendingEmail}</span>
      </p>

      <div>
        <FormField
          form={form}
          name="code"
          label="Six-digit code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          placeholder="000000"
          className="text-center text-[18px] tracking-[0.5em] font-feature-tnum"
        />
        {/* Whatever the server makes of a code the form was happy with. */}
        {!form.errorFor("code") ? (
          <FieldError id="signin-code-store-error" message={storeError ?? undefined} />
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={busy !== false}
        className="h-11 w-full text-[13.5px] tracking-[0.05em]"
      >
        {busy === "verifying" ? "Checking…" : "Sign in"}
      </Button>

      <button
        type="button"
        onClick={editEmail}
        className="inline-flex items-center gap-1.5 justify-self-start text-xs tracking-[0.09em] text-foreground/55 uppercase transition-colors hover:text-accent-2"
      >
        <ChevronLeft className="size-3.5" strokeWidth={1.6} />
        Use another email
      </button>
    </form>
  );
}
