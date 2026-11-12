import { useEffect, useMemo, useRef, useState } from "react";
import type { StorePerf } from "./analytics";

// ---------------------------------------------------------------------------
// Live-feel layer for the Retail dashboard. Everything here is derived
// deterministically from the synthetic dataset (plus the wall clock), so the
// numbers stay consistent with the rest of the app while the screen moves.
// ---------------------------------------------------------------------------

function hash(n: number) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// GCC trading week: Thursday–Saturday peaks, early week dips. Index = Date.getDay().
const WEEKDAY = [0.93, 0.87, 0.89, 0.95, 1.12, 1.24, 1.17];

export interface DayPoint {
  day: string;
  date: string;
  sales: number;
  target: number;
}

/** 30-day daily sales series whose total matches the 30-day sales figure. */
export function dailySalesTrend(perf: StorePerf[], anchor: string, days = 30): DayPoint[] {
  const total = perf.reduce((a, p) => a + p.sales30, 0);
  const target = perf.reduce((a, p) => a + p.target, 0) / 30;
  const end = new Date(anchor + "T12:00:00");
  const raw: Array<{ d: Date; w: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const w = WEEKDAY[d.getDay()] * (0.94 + hash(d.getDate() + d.getMonth() * 31) * 0.12) * (0.97 + (days - i) * 0.0012);
    raw.push({ d, w });
  }
  const sum = raw.reduce((a, r) => a + r.w, 0);
  return raw.map(({ d, w }) => ({
    day: d.toLocaleDateString("en-GB", { timeZone: "Asia/Dubai", day: "2-digit", month: "short" }),
    date: d.toISOString().slice(0, 10),
    sales: (total * w) / sum,
    target,
  }));
}

/** A short history ending at `end`, used for KPI sparklines. */
export function trendSeries(seed: string, end: number, volatility = 0.06, drift = 0.01, n = 16) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) % 100000;
  const out: number[] = [];
  let v = end;
  for (let i = 0; i < n; i++) {
    out.unshift(v);
    v = v * (1 - drift + (hash(s + i) - 0.5) * volatility * 2);
  }
  return out;
}

/** Share of a day's trading done by `hour` (stores open 08:00–24:00, evening peak). */
function intradayShare(hourFloat: number) {
  const curve = (h: number) => (h < 8 ? 0 : Math.max(0, Math.sin(((h - 8) / 16) * Math.PI) ** 1.4 + (h > 17 ? 0.35 : 0)));
  let done = 0;
  let all = 0;
  for (let h = 0; h < 24; h += 0.25) {
    const c = curve(h);
    all += c;
    if (h < hourFloat) done += c;
  }
  return all ? done / all : 0;
}

/** Gulf Standard Time hour as a float. */
export function gulfHour(now = new Date()) {
  return (now.getUTCHours() + 4 + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600) % 24;
}

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export interface PosTick {
  id: string;
  storeId: string;
  storeName: string;
  city: string;
  amount: number;
  items: number;
  at: Date;
}

/**
 * Today's sales so far plus a stream of point-of-sale tickets.
 * The running total follows the intraday trading curve and grows with each ticket.
 */
export function useLiveSales(perf: StorePerf[], dailyExpected: number) {
  const weights = useMemo(() => {
    const total = perf.reduce((a, p) => a + p.sales30, 0) || 1;
    let acc = 0;
    return perf.map((p) => (acc += p.sales30 / total));
  }, [perf]);

  const base = () => dailyExpected * intradayShare(gulfHour());
  const [today, setToday] = useState(base);
  const [ticks, setTicks] = useState<PosTick[]>([]);
  const extra = useRef(0);
  const seq = useRef(0);

  useEffect(() => {
    if (!perf.length) return;
    const make = (): PosTick => {
      const r = Math.random();
      const i = Math.max(0, weights.findIndex((w) => w >= r));
      const p = perf[i] ?? perf[0];
      const fmt = p.store.format;
      const basket = fmt === "Hypermarket" ? 180 : fmt === "Supermarket" ? 110 : 45;
      const amount = Math.round(basket * (0.35 + Math.random() * Math.random() * 3.2) * 100) / 100;
      return { id: `T${Date.now()}${seq.current++}`, storeId: p.store.id, storeName: p.store.name, city: p.store.city, amount, items: Math.max(1, Math.round(amount / (12 + Math.random() * 14))), at: new Date() };
    };
    setTicks(Array.from({ length: 5 }, make));
    const t = setInterval(() => {
      const tick = make();
      extra.current += tick.amount;
      setTicks((prev) => [tick, ...prev].slice(0, 8));
      setToday(dailyExpected * intradayShare(gulfHour()) + extra.current);
    }, 2600);
    return () => clearInterval(t);
  }, [perf, weights, dailyExpected]);

  return { today, ticks };
}
