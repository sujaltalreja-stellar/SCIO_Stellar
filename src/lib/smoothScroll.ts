import Lenis from "lenis";

let instance: Lenis | null = null;

export const getLenis = () => instance;

/** Starts inertia ("buttery") smooth scrolling. Returns a cleanup. Skipped for reduced-motion users. */
export function startSmoothScroll(): () => void {
  if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => undefined;
  const lenis = new Lenis({
    lerp: 0.085, // lower = longer, silkier glide
    wheelMultiplier: 0.9,
    smoothWheel: true,
    anchors: false,
  });
  instance = lenis;
  document.documentElement.classList.add("lenis");
  let raf = 0;
  const tick = (t: number) => {
    lenis.raf(t);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    lenis.destroy();
    document.documentElement.classList.remove("lenis");
    instance = null;
  };
}

/** Smooth-scroll to an element or Y offset, using Lenis when active and native smooth scroll otherwise. */
export function scrollToTarget(target: HTMLElement | number, opts: { offset?: number; duration?: number } = {}) {
  if (instance) {
    instance.scrollTo(target, { offset: opts.offset ?? -68, duration: opts.duration ?? 1.4 });
    return;
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY + (opts.offset ?? -68);
  window.scrollTo({ top, behavior: "smooth" });
}
