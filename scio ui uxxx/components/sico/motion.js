// Motion primitives shared by every section of the SICO product page.
//
// ENTRANCE is the design source's own reveal curve —
// `cubic-bezier(.2,.7,.3,1)`, the transition every `data-reveal` element in the
// SICO design file uses. It is deliberately NOT the site-wide `entrance` curve
// from tailwind.config.js: this page reproduces a supplied design, so its
// motion should match that design rather than the surrounding site.
export const ENTRANCE = [0.2, 0.7, 0.3, 1];

// Sections on this page are tall, full-composition blocks (dashboards, split
// panels). Revealing at a quarter on-screen keeps a section from still being
// blank once it already fills the viewport; the WIDE variant is for the
// tallest blocks (control tower, environments) where even 0.25 is too late.
export const VIEWPORT = { once: true, amount: 0.25 };
export const VIEWPORT_WIDE = { once: true, amount: 0.12 };

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: ENTRANCE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: ENTRANCE } },
};

export const fadeRight = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: ENTRANCE } },
};

export const fadeLeft = {
  hidden: { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: ENTRANCE } },
};

export const scaleIn = {
  hidden: { opacity: 0, y: 32, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: ENTRANCE },
  },
};

/**
 * Parent variant that walks its children in. Children must declare their own
 * `hidden`/`visible` states (use the variants above) and must NOT set their own
 * `initial`/`whileInView` — a child that does so detaches from the parent's
 * orchestration and animates on its own timing instead.
 */
export const stagger = (staggerChildren = 0.07, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

// Stroke-draw for the SVG schematics (operating loop, hero graph). Assumes
// `pathLength={1}` on the path so the tween is resolution-independent.
export const drawPath = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.1, ease: ENTRANCE }, opacity: { duration: 0.2 } },
  },
};

// Horizontal meter/bar fill. Call sites pass the target width as a percentage
// string via a custom transition, e.g. `animate={{ width: "94.2%" }}`.
export const barGrow = (width, delay = 0) => ({
  hidden: { width: 0 },
  visible: { width, transition: { duration: 1, ease: ENTRANCE, delay } },
});
