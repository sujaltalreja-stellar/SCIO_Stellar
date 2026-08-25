/**
 * Palette and type scale taken from the SICO Platform design source
 * (claude.ai/design project "SICO Product Page Design"). Every colour here is
 * lifted verbatim from that file — do not substitute the site's brand tokens,
 * this page is a self-contained warm-cream/indigo system that does not use
 * them.
 */
export const C = {
  // Warm light surfaces
  cream: "#FCF7F1", // page background
  creamRaised: "#FFFDFA", // raised card on cream
  creamSunk: "#F5F3F0", // subtle fill
  lineLight: "rgba(20,17,14,.12)", // hairline on cream
  lineLightSoft: "rgba(20,17,14,.08)",

  // Warm light foreground ramp
  ink: "#14110E", // primary text
  inkBody: "#4A423A", // body copy
  inkMuted: "#6B6259", // secondary
  inkFaint: "#8A7F73", // eyebrows / labels
  inkDim: "#A89A88", // step numbers, metadata
  inkGhost: "#C4B6A5", // faintest

  // Dark surfaces
  night: "#0B0D0F", // dark section background
  nightRaised: "#101315", // dark card
  nightCard: "#14181B", // dark card, second level
  nightPanel: "#0A0C0E", // dark rail / sidebar
  lineDark: "rgba(255,255,255,.07)",
  lineDarkSoft: "rgba(255,255,255,.045)",

  // Dark foreground ramp
  chalk: "#E8E6E3", // primary text on dark
  chalkBright: "#F2F1EF", // KPI numerals
  slate200: "#C7CCD2",
  slate300: "#B9C0C7",
  slate400: "#99A0A9",
  slate450: "#8A929B",
  slate500: "#7B838D",
  slate600: "#6F7783",
  slate700: "#5A6270",
  slate800: "#4E5661",
  slate900: "#3A4149",

  // Accents
  indigo: "#5B4DF0", // primary brand
  violet: "#8B5CF6", // secondary brand
  indigoLink: "#4A3FD6",
  violetSoft: "#A99BFF", // mono IDs on dark
  violetPale: "#D6D0FF", // active chip text
  violetTint: "#DED6FF", // selection
  green: "#2FBF71",
  cyan: "#3FC8D8",
  red: "#F0526B",
  amber: "#E8A33D",
};

/**
 * StellarMind brand colours, from the supplied Figma measurements for this
 * page's light sections. These are NOT from the SICO design source — that file
 * renders eyebrows in warm grey and CTAs in indigo. Where a Figma spec has been
 * given for a section, it wins over the design source.
 */
export const BRAND = {
  blue: "#2568E5", // eyebrows, step numbers
  blueDot: "#2563EB", // Royal Blue — hero eyebrow marker
  primaryFrom: "#153A7F", // primary CTA gradient, top
  primaryTo: "#2568E5", // primary CTA gradient, bottom
  primaryLabel: "#FCF7F1", // Linen — primary CTA label
  green: "#00D443", // secondary CTA hairline + marker
};

export const GRADIENT_BRAND = `linear-gradient(150deg, ${C.indigo}, ${C.violet})`;
export const GRADIENT_BRAND_BUTTON = `linear-gradient(135deg, ${C.indigo}, ${C.violet})`;

/**
 * Type floors.
 *
 * The design source drops to 8.5–10.5px for monospace labels and 11.5px for
 * dense dashboard copy. That is below a comfortable reading floor, so every
 * size here is raised to a minimum of 11px for mono / 12.5px for prose while
 * keeping the design's relative hierarchy intact — the requested readability
 * fix. Section headings, body copy and CTAs are unchanged from the design.
 */
export const T = {
  monoMicro: "11px", // was 8.5–9.5px in source
  monoLabel: "11.5px", // was 10px
  monoBody: "12.5px", // was 10.5–11.5px
  microCopy: "12.5px", // was 11.5px — dense dashboard prose
  dense: "13px", // was 12px — list rows, alert copy
  ui: "14px", // nav, small UI
  bodySm: "15px",
  body: "17.5px", // hero / section lead
};

/** Page gutter and max width, matching the design's container. */
export const SHELL = "mx-auto w-full max-w-[1360px] px-4 sm:px-6 lg:px-8";

/** The design's entrance curve, used for every scroll reveal. */
export const EASE = [0.2, 0.7, 0.3, 1];
