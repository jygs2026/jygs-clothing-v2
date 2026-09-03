/**
 * Public contact details for the studio. These live in `.env` (committed —
 * they are printed on the site, nothing secret) so a handle or number can
 * change per deployment without a code edit.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time, so each one has to be
 * named literally here — `process.env[name]` would not survive the build.
 */
function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env — see .env.example.`);
  }
  return value;
}

/** Instagram handle without the "@". */
export const INSTAGRAM_HANDLE = required(
  "NEXT_PUBLIC_INSTAGRAM_HANDLE",
  process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE
);

/** WhatsApp number in full international form, digits only — wa.me needs the country code. */
export const WHATSAPP_NUMBER = required(
  "NEXT_PUBLIC_WHATSAPP_NUMBER",
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
);

/** Where "Reach us directly" and the contact form point. */
export const CONTACT_EMAIL = required(
  "NEXT_PUBLIC_CONTACT_EMAIL",
  process.env.NEXT_PUBLIC_CONTACT_EMAIL
);

export const FACEBOOK_URL = required(
  "NEXT_PUBLIC_FACEBOOK_URL",
  process.env.NEXT_PUBLIC_FACEBOOK_URL
);

export const X_URL = required("NEXT_PUBLIC_X_URL", process.env.NEXT_PUBLIC_X_URL);

/**
 * Whether this deployment shows the studio's admin area. Optional — anything
 * other than "true" keeps it hidden and /admin off the map. It decides who is
 * shown the door, not who may walk through it: the value ships to the
 * browser, so real access control belongs on the server behind it.
 */
export const ADMIN_ENABLED = process.env.NEXT_PUBLIC_ADMIN_ENABLED === "true";

export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * The number as a person would write it. `wa.me` wants bare digits, but a
 * contact panel showing `919994452406` reads like a machine, so the display
 * form is derived rather than kept as a second, driftable env value.
 */
export function whatsappDisplay(number: string = WHATSAPP_NUMBER) {
  const digits = number.replace(/\D/g, "");
  const india = digits.match(/^91(\d{5})(\d{5})$/);
  if (india) return `+91 ${india[1]} ${india[2]}`;
  return `+${digits}`;
}

/** A WhatsApp deep link that opens the chat with `message` pre-typed. */
export function whatsappLink(message: string) {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
}
