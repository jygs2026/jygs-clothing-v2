/**
 * Field rules, shared by every form on the site. Each validator takes the
 * field's value (and the rest of the form, for rules that depend on a
 * sibling) and returns a message to show, or null when the value is fine.
 *
 * Messages are written the way the studio writes: plain, specific about what
 * to do next, never scolding.
 */

export type Validator = (
  value: string,
  values: Record<string, string>
) => string | null;

/** Runs rules in order and reports the first that objects. */
export function all(...rules: Validator[]): Validator {
  return (value, values) => {
    for (const rule of rules) {
      const message = rule(value, values);
      if (message) return message;
    }
    return null;
  };
}

/** Applies a rule only when something has been typed — for optional fields. */
export function optional(rule: Validator): Validator {
  return (value, values) => (value.trim() ? rule(value, values) : null);
}

export function required(what = "This"): Validator {
  return (value) => (value.trim() ? null : `${what} is needed.`);
}

export function minLength(n: number, what = "This"): Validator {
  return (value) =>
    value.trim().length >= n ? null : `${what} needs at least ${n} characters.`;
}

export function maxLength(n: number, what = "This"): Validator {
  return (value) =>
    value.trim().length <= n ? null : `${what} has to stay under ${n} characters.`;
}

/**
 * Deliberately not the RFC grammar: one @, something either side, a dot in
 * the domain and no spaces. It catches the typos people actually make
 * without turning away addresses that are perfectly deliverable.
 */
export function email(): Validator {
  return (value) => {
    const trimmed = value.trim();
    if (!trimmed) return "An email address is needed.";
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(trimmed))
      return "That does not look like an email address.";
    return null;
  };
}

/** A name, not a placeholder — two characters and at least one letter. */
export function personName(what = "Name"): Validator {
  return (value) => {
    const trimmed = value.trim();
    if (!trimmed) return `${what} is needed.`;
    if (trimmed.length < 2) return `${what} is too short.`;
    if (!/\p{L}/u.test(trimmed)) return `${what} needs letters, not only numbers.`;
    return null;
  };
}

/** Indian mobile numbers: ten digits starting 6–9, +91 or 0 allowed in front. */
export function mobile(): Validator {
  return (value) => {
    const digits = value.replace(/\D/g, "");
    const local = digits.replace(/^(91|0)/, "");
    if (local.length !== 10 || !/^[6-9]/.test(local))
      return "Enter a ten-digit mobile number.";
    return null;
  };
}

/** Indian PIN codes: six digits, never starting at zero. */
export function pinCode(): Validator {
  return (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "A PIN code is needed.";
    if (!/^[1-9]\d{5}$/.test(digits)) return "A PIN code is six digits.";
    return null;
  };
}

/** The check digit every card number carries, so a typo is caught here. */
export function luhn(digits: string) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits.charCodeAt(i) - 48;
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

/** The length every card the studio takes is printed at. */
export const CARD_DIGITS = 16;

export function cardNumber(): Validator {
  return (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "A card number is needed.";
    if (digits.length !== CARD_DIGITS)
      return `A card number is ${CARD_DIGITS} digits.`;
    if (!luhn(digits)) return "Check the card number — a digit is off.";
    return null;
  };
}

/** MM/YY, a real month, and a card that has not already run out. */
export function cardExpiry(): Validator {
  return (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "An expiry date is needed.";
    if (digits.length !== 4) return "Expiry goes in as MM/YY.";
    const month = Number(digits.slice(0, 2));
    const year = 2000 + Number(digits.slice(2));
    if (month < 1 || month > 12) return "Months run from 01 to 12.";
    const now = new Date();
    // A card is good through the last day of its month.
    const expires = new Date(year, month, 1);
    if (expires <= now) return "That card has expired.";
    if (year > now.getFullYear() + 20) return "Check the year.";
    return null;
  };
}

/** The three digits on the back of the card. */
export const CVC_DIGITS = 3;

export function cardCvc(): Validator {
  return (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "The CVC is needed.";
    if (digits.length !== CVC_DIGITS) return `The CVC is ${CVC_DIGITS} digits.`;
    return null;
  };
}

/* ------------------------------------------------------------- formatting */

/** Keeps digits only, up to `max` of them. */
export function digitsOnly(max: number) {
  return (next: string) => next.replace(/\D/g, "").slice(0, max);
}

/** 4242424242424242 → "4242 4242 4242 4242" as it is typed, and no longer. */
export function formatCardNumber(next: string) {
  const digits = next.replace(/\D/g, "").slice(0, CARD_DIGITS);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** 0929 → "09/29", and deleting back through the slash still works. */
export function formatExpiry(next: string, prev: string) {
  const digits = next.replace(/\D/g, "").slice(0, 4);
  // Someone backspacing over "09/" means to lose the 9, not just the slash.
  if (prev.endsWith("/") && next === prev.slice(0, -1)) return digits.slice(0, 1);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Phone numbers keep a leading + and their spacing, nothing else. */
export function formatPhone(next: string) {
  const kept = next.replace(/[^\d+\s]/g, "").slice(0, 18);
  return kept.startsWith("+") ? "+" + kept.slice(1).replace(/\+/g, "") : kept.replace(/\+/g, "");
}
