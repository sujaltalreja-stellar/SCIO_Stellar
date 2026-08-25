"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { ENTRANCE } from "./motion";

/**
 * Counts a KPI numeral up from zero the first time it scrolls into view.
 *
 * The page shows a lot of hard numbers (1,286 inspections / 88.3% compliance /
 * 94.2% asset health) and a static number reads as a screenshot; counting them
 * up is what makes the dashboards read as live. Under `prefers-reduced-motion`
 * the final value is rendered immediately with no tween.
 *
 * `amount: 0.6` rather than the page default: a numeral is a short element, so
 * it should be comfortably on screen before it starts moving.
 */
function CountUp({
  to,
  decimals = 0,
  duration = 1.6,
  delay = 0,
  prefix = "",
  suffix = "",
  className = "",
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (shouldReduceMotion) {
      setValue(to);
      return undefined;
    }
    const controls = animate(0, to, {
      duration,
      delay,
      ease: ENTRANCE,
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [inView, shouldReduceMotion, to, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

export default CountUp;
