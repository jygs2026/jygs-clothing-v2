/**
 * The site ships light-only for now. The dark and system themes still work —
 * `next-themes` is wired up and every component keeps its dark styles — but
 * the switchers (header, mobile nav, admin account menu) stay hidden and the
 * theme is pinned to light. Flip this back to `true` to bring them back.
 */
export const THEME_SWITCHER_ENABLED = false;

/** Theme forced on everyone while the switcher is hidden. */
export const FORCED_THEME = "light";
