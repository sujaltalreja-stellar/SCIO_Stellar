import { NSKU, batchesFor, oldestBatchQuick, LATE_SUPPLIERS } from "./generate";
import type { RetailState } from "./state";
import type { Equipment, Sku, Store } from "./model";

// ---------------------------------------------------------------------------
// Retail analytics: exception detection, recommendations, KPIs and drill-downs.
// Everything is computed from the current (event-applied) state.
// ---------------------------------------------------------------------------

export type Scope = Set<number> | null; // visible store indexes (null = all)
const inScope = (scope: Scope, s: number) => !scope || scope.has(s);

export interface StockoutRisk {
  id: string;
  storeIdx: number;
  skuIdx: number;
  available: number;
  velocity: number;
  daysOfSupply: number;
  inbound: number;
  outOfStock: boolean;
  lostSalesPerDay: number;
  needQty: number;
  donor: null | { type: "store" | "dc"; idx: number; available: number; daysOfSupply: number; qty: number };
}

export interface OverstockRow {
  id: string;
  storeIdx: number;
  skuIdx: number;
  onHand: number;
  velocity: number;
  daysOfSupply: number;
  excessUnits: number;
  excessValue: number;
}

export interface PhantomRow {
  id: string;
  storeIdx: number;
  skuIdx: number;
  systemQty: number;
  velocity: number;
  daysNoSale: number;
  expectedSalesLost: number;
}

export interface ExpiryRow {
  id: string;
  storeIdx: number;
  skuIdx: number;
  lot: string;
  qty: number;
  daysLeft: number;
  expiry: string;
  expectedToSell: number;
  atRiskUnits: number;
  atRiskValue: number;
  recommendation: "markdown" | "transfer";
  transferTo: number | null;
  markedDown: number | null; // pct if already marked down
}

export interface SupplierDelay {
  id: string;
  poId: string;
  supplierIdx: number;
  destType: "dc" | "store";
  destIdx: number;
  daysLate: number;
  lines: number;
  value: number;
  affectedSkus: number[];
  affectedStores: number[];
}

export interface Discrepancy {
  id: string;
  poId: string;
  supplierIdx: number;
  skuIdx: number;
  kind: "Short delivery" | "Invoice qty above received" | "Invoice price above PO";
  ordered: number;
  received: number;
  invoicedQty: number | null;
  unitCost: number;
  invoicedCost: number | null;
  impact: number;
}

export interface EquipmentIssue {
  id: string;
  equipment: Equipment;
  storeIdx: number;
  severity: "critical" | "high";
  latest: number;
  ticketId: string | null;
  ticketStatus: string | null;
  stockAtRiskValue: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// ---- Core per-pair metrics --------------------------------------------------------

export function available(st: RetailState, p: number) {
  return Math.max(0, st.onHand(p) - st.base.reserved[p] - st.base.damaged[p]);
}

export function stockoutRisks(st: RetailState, scope: Scope = null): StockoutRisk[] {
  const { base, thresholds: t } = st;
  const out: StockoutRisk[] = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const v = base.velocity[p];
      if (v < 0.25) continue;
      const avail = available(st, p);
      const inbound = st.inbound(p);
      const dos = avail / v;
      if (dos > t.stockoutDays || avail + inbound >= v * t.stockoutDays * 2) continue;
      const sku = base.skus[k];
      const needQty = Math.max(1, Math.ceil(v * t.targetDays - avail - inbound));
      out.push({
        id: `so-${s.idx}-${k}`,
        storeIdx: s.idx,
        skuIdx: k,
        available: avail,
        velocity: v,
        daysOfSupply: dos,
        inbound,
        outOfStock: avail === 0,
        lostSalesPerDay: v * sku.price,
        needQty: sku.baseUom === "kg" ? needQty : Math.ceil(needQty),
        donor: findDonor(st, s, k, needQty),
      });
    }
  }
  return out.sort((a, b) => Number(b.outOfStock) - Number(a.outOfStock) || b.lostSalesPerDay - a.lostSalesPerDay);
}

/** Best source for a transfer: a nearby store with surplus, otherwise the serving DC. */
export function findDonor(st: RetailState, to: Store, k: number, need: number): StockoutRisk["donor"] {
  const { base } = st;
  let best: StockoutRisk["donor"] = null;
  for (const s of base.stores) {
    if (s.idx === to.idx || s.country !== to.country) continue;
    const p = s.idx * NSKU + k;
    if (!base.carried[p]) continue;
    const v = Math.max(base.velocity[p], 0.05);
    const avail = available(st, p);
    const keep = v * 21; // donor keeps 3 weeks of cover
    const surplus = Math.floor(avail - keep);
    if (surplus < Math.min(need, 2)) continue;
    const sameCity = s.city === to.city ? 2 : s.region === to.region ? 1 : 0;
    const score = sameCity * 1000 + surplus;
    const qty = Math.min(need, surplus);
    if (!best || score > (best as any)._score) best = Object.assign({ type: "store" as const, idx: s.idx, available: avail, daysOfSupply: avail / v, qty }, { _score: score });
  }
  if (best) return best;
  const dcAvail = st.dcOnHand(to.dcIdx, k);
  if (dcAvail >= Math.min(need, 1)) return { type: "dc", idx: to.dcIdx, available: dcAvail, daysOfSupply: 0, qty: Math.min(need, dcAvail) };
  return null;
}

export function overstock(st: RetailState, scope: Scope = null): OverstockRow[] {
  const { base, thresholds: t } = st;
  const out: OverstockRow[] = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const v = Math.max(base.velocity[p], 0.02);
      const oh = st.onHand(p);
      const dos = oh / v;
      if (dos < t.overstockDays) continue;
      const excessUnits = Math.floor(oh - v * 30);
      const excessValue = excessUnits * base.skus[k].cost;
      if (excessValue < 1000) continue;
      out.push({ id: `os-${s.idx}-${k}`, storeIdx: s.idx, skuIdx: k, onHand: oh, velocity: v, daysOfSupply: dos, excessUnits, excessValue });
    }
  }
  return out.sort((a, b) => b.excessValue - a.excessValue);
}

export function phantomInventory(st: RetailState, scope: Scope = null): PhantomRow[] {
  const { base, thresholds: t } = st;
  const out: PhantomRow[] = [];
  const counting = new Set(st.counts.filter((c) => c.status === "Counting").map((c) => c.storeIdx * NSKU + c.skuIdx));
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p] || base.velocity[p] < 1) continue;
      const oh = st.onHand(p);
      const last = st.lastSale(p);
      if (oh <= 0 || last < t.phantomDays || counting.has(p)) continue;
      out.push({ id: `ph-${s.idx}-${k}`, storeIdx: s.idx, skuIdx: k, systemQty: oh, velocity: base.velocity[p], daysNoSale: last, expectedSalesLost: base.velocity[p] * last * base.skus[k].price });
    }
  }
  return out.sort((a, b) => b.expectedSalesLost - a.expectedSalesLost);
}

export function expiryRisks(st: RetailState, scope: Scope = null): ExpiryRow[] {
  const { base, thresholds: t } = st;
  const out: ExpiryRow[] = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const sku = base.skus[k];
      if (!sku.perishable) continue;
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const oh = st.onHand(p);
      const quick = oldestBatchQuick(base, s.idx, k, oh);
      if (!quick || quick.daysLeft > t.expiryDays) continue;
      const md0 = st.markdowns.get(p);
      if (!md0 && quick.qty <= base.velocity[p] * quick.daysLeft) continue;
      const b = batchesFor(base, s.idx, k, oh)[0];
      const md = st.markdowns.get(p);
      const uplift = md ? 1 + (md.pct / 100) * 3 : 1;
      const v = base.velocity[p] * uplift;
      const expectedToSell = v * b.daysLeft;
      const atRisk = Math.floor(b.qty - expectedToSell);
      if (atRisk <= 0 && !md) continue;
      // transfer target: same-city store selling faster with room
      let transferTo: number | null = null;
      let bestV = base.velocity[p] * 1.4;
      for (const o of base.stores) {
        if (o.idx === s.idx || o.city !== s.city) continue;
        const q = o.idx * NSKU + k;
        if (!base.carried[q]) continue;
        if (base.velocity[q] > bestV && st.onHand(q) < base.velocity[q] * 4) {
          bestV = base.velocity[q];
          transferTo = o.idx;
        }
      }
      out.push({
        id: `ex-${s.idx}-${k}`,
        storeIdx: s.idx,
        skuIdx: k,
        lot: b.lot,
        qty: b.qty,
        daysLeft: b.daysLeft,
        expiry: b.expiry,
        expectedToSell: r1(expectedToSell),
        atRiskUnits: Math.max(0, atRisk),
        atRiskValue: Math.max(0, atRisk) * sku.cost,
        recommendation: transferTo !== null && b.daysLeft >= 3 ? "transfer" : "markdown",
        transferTo,
        markedDown: md ? md.pct : null,
      });
    }
  }
  return out.sort((a, b) => b.atRiskValue - a.atRiskValue);
}

export function supplierDelays(st: RetailState, scope: Scope = null): SupplierDelay[] {
  const { base } = st;
  const today = base.anchorDate;
  const out: SupplierDelay[] = [];
  for (const po of st.pos) {
    if (po.status !== "Sent" && po.status !== "Approved") continue;
    if (po.promised >= today) continue;
    const daysLate = Math.round((new Date(today).getTime() - new Date(po.promised).getTime()) / 86_400_000);
    const servedStores = po.destType === "store" ? [po.destIdx] : base.stores.filter((s) => s.dcIdx === po.destIdx).map((s) => s.idx);
    const affectedSkus = po.lines.map((l) => l.skuIdx);
    const affectedStores = servedStores.filter((s) => inScope(scope, s) && affectedSkus.some((k) => {
      const p = s * NSKU + k;
      return base.carried[p] && available(st, p) < base.velocity[p] * 7;
    }));
    if (scope && !servedStores.some((s) => scope.has(s))) continue;
    out.push({
      id: `sd-${po.id}`,
      poId: po.id,
      supplierIdx: po.supplierIdx,
      destType: po.destType,
      destIdx: po.destIdx,
      daysLate,
      lines: po.lines.length,
      value: po.lines.reduce((s, l) => s + (l.ordered - l.received) * l.unitCost, 0),
      affectedSkus,
      affectedStores,
    });
  }
  return out.sort((a, b) => b.affectedStores.length - a.affectedStores.length || b.daysLate - a.daysLate);
}

export function discrepancies(st: RetailState): Discrepancy[] {
  const out: Discrepancy[] = [];
  for (const po of st.pos) {
    if (!po.received) continue;
    for (const l of po.lines) {
      const base = { poId: po.id, supplierIdx: po.supplierIdx, skuIdx: l.skuIdx, ordered: l.ordered, received: l.received, invoicedQty: l.invoicedQty, unitCost: l.unitCost, invoicedCost: l.invoicedCost };
      if (l.invoicedQty !== null && l.invoicedQty > l.received) out.push({ id: `dq-${po.id}-${l.skuIdx}`, kind: "Invoice qty above received", impact: (l.invoicedQty - l.received) * (l.invoicedCost ?? l.unitCost), ...base });
      if (l.invoicedCost !== null && l.invoicedCost > l.unitCost * 1.01) out.push({ id: `dp-${po.id}-${l.skuIdx}`, kind: "Invoice price above PO", impact: (l.invoicedCost - l.unitCost) * (l.invoicedQty ?? l.received), ...base });
      if (l.received < l.ordered && po.status !== "Received") out.push({ id: `ds-${po.id}-${l.skuIdx}`, kind: "Short delivery", impact: (l.ordered - l.received) * l.unitCost, ...base });
    }
  }
  return out.sort((a, b) => b.impact - a.impact);
}

export function equipmentIssues(st: RetailState, scope: Scope = null): EquipmentIssue[] {
  const { base } = st;
  const out: EquipmentIssue[] = [];
  for (const e of base.equipment) {
    if (!e.fault || !inScope(scope, e.storeIdx)) continue;
    const ticket = st.tickets.find((t) => t.equipmentId === e.id && t.status !== "Resolved") ?? null;
    const resolved = st.tickets.find((t) => t.equipmentId === e.id && t.status === "Resolved" && t.created >= base.anchorDate);
    if (resolved && !ticket) continue;
    const cold = e.type === "Freezer" || e.type === "Chiller" || e.type === "Cold Room";
    // stock at risk in cold equipment ~ share of frozen/chilled inventory value in store
    let coldValue = 0;
    if (cold) {
      for (let k = 0; k < NSKU; k++) {
        const sku = base.skus[k];
        if ((e.type === "Freezer" && sku.department === "Frozen") || (e.type !== "Freezer" && (sku.category === "Dairy & Eggs" || sku.category === "Meat & Poultry"))) {
          coldValue += st.onHand(e.storeIdx * NSKU + k) * sku.cost;
        }
      }
      const units = base.equipment.filter((x) => x.storeIdx === e.storeIdx && (e.type === "Freezer" ? x.type === "Freezer" : x.type === "Chiller" || x.type === "Cold Room")).length || 1;
      coldValue /= units;
    }
    out.push({
      id: `eq-${e.id}`,
      equipment: e,
      storeIdx: e.storeIdx,
      severity: cold || e.type === "HVAC" ? "critical" : "high",
      latest: e.readings[e.readings.length - 1],
      ticketId: ticket?.id ?? null,
      ticketStatus: ticket?.status ?? null,
      stockAtRiskValue: coldValue,
    });
  }
  return out.sort((a, b) => b.stockAtRiskValue - a.stockAtRiskValue);
}

// ---- Store performance -------------------------------------------------------------

export interface StorePerf {
  store: Store;
  sales30: number;
  target: number;
  vsTarget: number;
  availability: number;
  carried: number;
  outOfStock: number;
  lostSales30: number;
  inventoryValue: number;
  shrinkValue: number;
  openTasks: number;
  pricingExceptions: number;
  auditScore: number;
  equipmentFaults: number;
}

export function storePerformance(st: RetailState, scope: Scope = null): StorePerf[] {
  const { base } = st;
  const out: StorePerf[] = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    let sales = 0;
    let lost = 0;
    let carried = 0;
    let oos = 0;
    let inv = 0;
    let shrink = 0;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      carried++;
      const sku = base.skus[k];
      const v = base.velocity[p];
      const oh = st.onHand(p);
      const noSale = Math.min(30, st.lastSale(p));
      sales += v * sku.price * (30 - noSale);
      lost += v * sku.price * noSale;
      if (available(st, p) === 0 && v >= 0.25) oos++;
      inv += oh * sku.cost;
      shrink += base.damaged[p] * sku.cost;
    }
    const audits = base.audits.filter((a) => a.storeIdx === s.idx);
    out.push({
      store: s,
      sales30: sales,
      target: s.monthlyTargetAed,
      vsTarget: sales / s.monthlyTargetAed,
      availability: carried ? 1 - oos / carried : 1,
      carried,
      outOfStock: oos,
      lostSales30: lost,
      inventoryValue: inv,
      shrinkValue: shrink,
      openTasks: st.tasks.filter((t) => t.storeIdx === s.idx && t.status !== "Done").length,
      pricingExceptions: base.pricingExceptions.filter((x) => x.storeIdx === s.idx && !st.fixedPrices.has(x.id)).length,
      auditScore: audits.length ? audits.reduce((a, x) => a + x.score, 0) / audits.length : 100,
      equipmentFaults: base.equipment.filter((e) => e.storeIdx === s.idx && e.fault && !st.tickets.some((t) => t.equipmentId === e.id && t.status === "Resolved")).length,
    });
  }
  return out;
}

// ---- Command-center KPIs & prioritized problems --------------------------------------

export function retailKpis(st: RetailState, scope: Scope = null) {
  const { base } = st;
  const perf = storePerformance(st, scope);
  const so = stockoutRisks(st, scope);
  const ov = overstock(st, scope);
  const ex = expiryRisks(st, scope);
  const ph = phantomInventory(st, scope);
  const sd = supplierDelays(st, scope);
  let active = 0;
  const seen = new Uint8Array(NSKU);
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) if (base.carried[s.idx * NSKU + k] && !seen[k] && base.skus[k].status !== "Discontinued") { seen[k] = 1; active++; }
  }
  const sales = perf.reduce((a, p) => a + p.sales30, 0);
  const target = perf.reduce((a, p) => a + p.target, 0);
  return {
    stores: perf.length,
    activeSkus: active,
    inventoryValue: perf.reduce((a, p) => a + p.inventoryValue, 0),
    stockoutRisks: so.length,
    outOfStock: so.filter((x) => x.outOfStock).length,
    lostSalesPerDay: so.reduce((a, x) => a + (x.outOfStock ? x.lostSalesPerDay : 0), 0),
    overstockValue: ov.reduce((a, x) => a + x.excessValue, 0),
    overstockCount: ov.length,
    supplierDelays: sd.length,
    expiryRiskValue: ex.filter((e) => !e.markedDown).reduce((a, x) => a + x.atRiskValue, 0),
    expiryCount: ex.filter((e) => !e.markedDown).length,
    phantomCount: ph.length,
    inventoryLoss: perf.reduce((a, p) => a + p.shrinkValue, 0) + ex.reduce((a, x) => a + (x.daysLeft <= 2 && !x.markedDown ? x.atRiskValue : 0), 0) + ph.reduce((a, x) => a + x.systemQty * base.skus[x.skuIdx].cost * 0.5, 0),
    sales30: sales,
    salesVsTarget: target ? sales / target : 1,
    availability: perf.length ? perf.reduce((a, p) => a + p.availability, 0) / perf.length : 1,
    perf,
    so,
    ov,
    ex,
    ph,
    sd,
  };
}

export type ProblemKind =
  | "stockout"
  | "supplier"
  | "expiry"
  | "phantom"
  | "equipment"
  | "overstock"
  | "store"
  | "margin"
  | "promotion"
  | "returns"
  | "transfer"
  | "compliance";

export interface Problem {
  id: string;
  kind: ProblemKind;
  severity: "critical" | "high" | "medium";
  title: string;
  why: string;
  where: string;
  impact: number; // AED
  impactLabel: string;
  team: string;
  action: string;
  link: string;
  count: number;
}

export function prioritizedProblems(st: RetailState, k: ReturnType<typeof retailKpis>, scope: Scope = null): Problem[] {
  const { base } = st;
  const name = (s: number) => `${base.stores[s].id} ${base.stores[s].name}`;
  const out: Problem[] = [];

  // Stores with severe availability problems
  const worst = [...k.perf].sort((a, b) => b.lostSales30 - a.lostSales30)[0];
  if (worst && worst.availability < 0.985) {
    out.push({
      id: `store-${worst.store.idx}`,
      kind: "store",
      severity: "critical",
      title: `${name(worst.store.idx)} is losing sales`,
      why: `${worst.outOfStock} fast-moving SKUs out of stock · availability ${(worst.availability * 100).toFixed(1)}% · ${Math.round(worst.vsTarget * 100)}% of sales target`,
      where: `${worst.store.city}, ${worst.store.country}`,
      impact: worst.lostSales30,
      impactLabel: "lost sales · 30 days",
      team: "Store Operations · Inventory",
      action: "Open store diagnosis",
      link: `/app/retail/stores/${worst.store.id}`,
      count: worst.outOfStock,
    });
  }

  const oos = k.so.filter((x) => x.outOfStock);
  if (oos.length) {
    const withDonor = oos.filter((x) => x.donor).length;
    out.push({
      id: "stockouts",
      kind: "stockout",
      severity: "critical",
      title: `${oos.length} store-SKUs out of stock`,
      why: `Demand continues but shelf stock is zero. ${withDonor} can be fixed today by transfer from a nearby store or DC.`,
      where: `${new Set(oos.map((x) => x.storeIdx)).size} stores`,
      impact: oos.reduce((a, x) => a + x.lostSalesPerDay, 0) * 7,
      impactLabel: "lost sales · next 7 days",
      team: "Inventory & Replenishment",
      action: "Review transfer recommendations",
      link: "/app/retail/replenishment?tab=stockouts",
      count: oos.length,
    });
  }

  const eq = equipmentIssues(st, scope).filter((e) => !e.ticketId || e.ticketStatus === "Open");
  if (eq.length) {
    const top = eq[0];
    out.push({
      id: "equipment",
      kind: "equipment",
      severity: "critical",
      title: `${eq.length} equipment fault${eq.length > 1 ? "s" : ""} without a technician`,
      why: `${top.equipment.type} ${top.equipment.id}: ${top.equipment.fault!.kind.toLowerCase()} (${top.latest}${top.equipment.unit}).`,
      where: Array.from(new Set(eq.map((e) => base.stores[e.storeIdx].id))).slice(0, 4).join(", ") + (eq.length > 4 ? "…" : ""),
      impact: eq.reduce((a, e) => a + e.stockAtRiskValue, 0),
      impactLabel: "chilled & frozen stock at risk",
      team: "Facilities & Maintenance",
      action: "Create tickets & assign technicians",
      link: "/app/retail/maintenance",
      count: eq.length,
    });
  }

  const sd = k.sd.filter((x) => !st.alertStatus.has(x.id));
  if (sd.length) {
    const late = sd.filter((x) => LATE_SUPPLIERS.includes(x.supplierIdx));
    out.push({
      id: "supplier",
      kind: "supplier",
      severity: "high",
      title: `${sd.length} purchase orders overdue`,
      why: `${late.length ? `${base.suppliers[late[0].supplierIdx].name} and ${new Set(late.map((x) => x.supplierIdx)).size - 1} other chronic late suppliers` : "Suppliers"} past promised date; ${new Set(sd.flatMap((x) => x.affectedStores)).size} stores running low on affected SKUs.`,
      where: `${new Set(sd.map((x) => x.supplierIdx)).size} suppliers`,
      impact: sd.reduce((a, x) => a + x.value, 0),
      impactLabel: "undelivered order value",
      team: "Procurement",
      action: "Arrange alternative replenishment",
      link: "/app/retail/suppliers?tab=delays",
      count: sd.length,
    });
  }

  const ex = k.ex.filter((x) => !x.markedDown && x.atRiskUnits > 0);
  if (ex.length) {
    out.push({
      id: "expiry",
      kind: "expiry",
      severity: "high",
      title: `${ex.length} batches will expire before they sell`,
      why: `Perishable stock expiring within ${st.thresholds.expiryDays} days exceeds forecast sales. Markdown or transfer to faster-selling stores.`,
      where: `${new Set(ex.map((x) => x.storeIdx)).size} stores`,
      impact: ex.reduce((a, x) => a + x.atRiskValue, 0),
      impactLabel: "stock value at risk of write-off",
      team: "Store Operations · Category",
      action: "Apply markdowns / transfers",
      link: "/app/retail/replenishment?tab=expiry",
      count: ex.length,
    });
  }

  if (k.ph.length) {
    out.push({
      id: "phantom",
      kind: "phantom",
      severity: "high",
      title: `${k.ph.length} possible phantom inventory records`,
      why: `System shows stock but no sales for ${st.thresholds.phantomDays}+ days on items that normally sell daily. Likely shrink, misplacement or receiving errors.`,
      where: `${new Set(k.ph.map((x) => x.storeIdx)).size} stores`,
      impact: k.ph.reduce((a, x) => a + x.expectedSalesLost, 0),
      impactLabel: "sales missed while invisible",
      team: "Inventory Control",
      action: "Start cycle counts",
      link: "/app/retail/replenishment?tab=phantom",
      count: k.ph.length,
    });
  }

  if (k.ov.length) {
    out.push({
      id: "overstock",
      kind: "overstock",
      severity: "medium",
      title: `${k.ov.length} store-SKUs overstocked`,
      why: `More than ${st.thresholds.overstockDays} days of supply on hand. Rebalance to stores at risk and reduce future orders.`,
      where: `${new Set(k.ov.map((x) => x.storeIdx)).size} stores`,
      impact: k.ov.reduce((a, x) => a + x.excessValue, 0),
      impactLabel: "working capital tied up",
      team: "Inventory & Replenishment",
      action: "Review excess stock",
      link: "/app/retail/replenishment?tab=overstock",
      count: k.ov.length,
    });
  }

  // Margin leakage: unusually deep realised discounts, negative unit economics,
  // or unresolved shelf/system price mismatches. Exposure is an estimate, not a
  // confirmed accounting loss.
  let marginPairs = 0;
  let marginExposure = 0;
  const marginStores = new Set<number>();
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let skuIdx = 0; skuIdx < NSKU; skuIdx++) {
      const p = s.idx * NSKU + skuIdx;
      if (!base.carried[p]) continue;
      const sku = base.skus[skuIdx];
      const discount = (base.discountPct?.[p] ?? 0) / 100;
      const landedCost = sku.landedCost ?? sku.cost;
      const realisedPrice = sku.price * (1 - discount);
      if (discount < 0.28 && realisedPrice >= landedCost * 1.05) continue;
      const units30 = base.velocity[p] * Math.max(0, 30 - st.lastSale(p));
      const targetPrice = Math.max(landedCost * 1.12, sku.price * 0.82);
      const exposure = Math.max(0, targetPrice - realisedPrice) * units30;
      if (exposure < 250) continue;
      marginPairs++;
      marginExposure += exposure;
      marginStores.add(s.idx);
    }
  }
  const unresolvedPrices = base.pricingExceptions.filter((x) => inScope(scope, x.storeIdx) && !st.fixedPrices.has(x.id));
  if (marginPairs || unresolvedPrices.length) {
    const priceExposure = unresolvedPrices.reduce((sum, x) => {
      const p = x.storeIdx * NSKU + x.skuIdx;
      return sum + Math.abs(x.shelfPrice - x.systemPrice) * base.velocity[p] * 7;
    }, 0);
    out.push({
      id: "margin-leakage",
      kind: "margin",
      severity: marginExposure + priceExposure > 100_000 ? "high" : "medium",
      title: `${marginPairs + unresolvedPrices.length} margin leakage exceptions`,
      why: `${marginPairs} store-SKUs have abnormal realised discounts or weak unit economics; ${unresolvedPrices.length} shelf/system price mismatches remain open.`,
      where: `${new Set([...marginStores, ...unresolvedPrices.map((x) => x.storeIdx)]).size} stores`,
      impact: marginExposure + priceExposure,
      impactLabel: "estimated margin exposure · 30 days",
      team: "Commercial · Pricing",
      action: "Review pricing and discount controls",
      link: "/app/retail/reports",
      count: marginPairs + unresolvedPrices.length,
    });
  }

  // Promotional availability: active campaigns whose promoted products cannot
  // sustain the configured stockout horizon.
  const activePromos = base.promotions.filter((p) => p.start <= base.anchorDate && p.end >= base.anchorDate);
  let promoShortages = 0;
  let promoExposure = 0;
  const promoStores = new Set<number>();
  for (const promo of activePromos) {
    for (const s of base.stores) {
      if (!inScope(scope, s.idx) || !promo.countries.includes(s.country)) continue;
      for (const skuIdx of promo.skuIdxs) {
        const p = s.idx * NSKU + skuIdx;
        if (!base.carried[p]) continue;
        const demand = base.velocity[p] * (1 + promo.upliftPct / 100);
        const gap = demand * st.thresholds.stockoutDays - available(st, p) - st.inbound(p);
        if (gap <= 0) continue;
        promoShortages++;
        promoExposure += gap * base.skus[skuIdx].price;
        promoStores.add(s.idx);
      }
    }
  }
  if (promoShortages) {
    out.push({
      id: "promotion-shortage",
      kind: "promotion",
      severity: "high",
      title: `${promoShortages} promotional stock shortages forecast`,
      why: `Current ATS plus inbound stock will not cover uplift demand for active campaigns. Replenish before shelf availability falls.`,
      where: `${promoStores.size} stores · ${activePromos.length} active campaigns`,
      impact: promoExposure,
      impactLabel: "estimated promotional sales at risk",
      team: "Category · Replenishment",
      action: "Open replenishment recommendations",
      link: "/app/retail/replenishment?tab=stockouts",
      count: promoShortages,
    });
  }

  // Abnormal returns and damaged stock use the 30-day POS/stock ledger.
  let returnPairs = 0;
  let returnExposure = 0;
  const returnStores = new Set<number>();
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let skuIdx = 0; skuIdx < NSKU; skuIdx++) {
      const p = s.idx * NSKU + skuIdx;
      if (!base.carried[p]) continue;
      const sold = base.velocity[p] * 30;
      const returned = base.returns30?.[p] ?? 0;
      const damaged = base.damaged[p];
      if ((sold < 1 || returned / sold < 0.08) && damaged < Math.max(3, sold * 0.05)) continue;
      returnPairs++;
      returnExposure += (returned + damaged) * (base.skus[skuIdx].landedCost ?? base.skus[skuIdx].cost);
      returnStores.add(s.idx);
    }
  }
  if (returnPairs) {
    out.push({
      id: "returns-damage",
      kind: "returns",
      severity: returnExposure > 75_000 ? "high" : "medium",
      title: `${returnPairs} abnormal return or damage exceptions`,
      why: "Return rates or damaged units materially exceed normal product movement, indicating quality, handling, or customer-experience issues.",
      where: `${returnStores.size} stores`,
      impact: returnExposure,
      impactLabel: "estimated landed-cost exposure",
      team: "Store Operations · Quality",
      action: "Investigate returns and handling",
      link: "/app/retail/reports",
      count: returnPairs,
    });
  }

  const now = new Date(base.anchorDate).getTime();
  const delayedTransfers = st.transfers.filter((t) => {
    if (!inScope(scope, t.toStore) || t.status === "Received" || t.status === "Cancelled") return false;
    return now - new Date(t.created).getTime() > 2 * 86_400_000;
  });
  if (delayedTransfers.length) {
    const exposure = delayedTransfers.reduce((sum, t) => sum + t.qty * base.skus[t.skuIdx].price, 0);
    out.push({
      id: "transfer-delay",
      kind: "transfer",
      severity: delayedTransfers.some((t) => t.reason.toLowerCase().includes("stockout")) ? "high" : "medium",
      title: `${delayedTransfers.length} stock transfers require follow-up`,
      why: "Requested or in-transit transfers have remained open for more than two days, delaying availability at destination stores.",
      where: `${new Set(delayedTransfers.map((t) => t.toStore)).size} destination stores`,
      impact: exposure,
      impactLabel: "inventory value delayed",
      team: "Inventory Control · Logistics",
      action: "Review and receive transfers",
      link: "/app/retail/transfers",
      count: delayedTransfers.length,
    });
  }

  const failedAudits = base.audits.filter((a) => inScope(scope, a.storeIdx) && a.score < 75);
  if (failedAudits.length) {
    const openFollowUps = st.tasks.filter((t) => inScope(scope, t.storeIdx) && t.type === "Audit follow-up" && t.status !== "Done").length;
    out.push({
      id: "compliance",
      kind: "compliance",
      severity: failedAudits.some((a) => a.score < 60 || a.type === "Cold chain") ? "high" : "medium",
      title: `${failedAudits.length} store inspection failures need closure`,
      why: `${openFollowUps} corrective tasks remain open across shelf, pricing, hygiene, safety, and cold-chain inspections.`,
      where: `${new Set(failedAudits.map((a) => a.storeIdx)).size} stores`,
      impact: failedAudits.reduce((sum, a) => sum + (100 - a.score) * 250, 0),
      impactLabel: "estimated compliance exposure",
      team: "Retail Compliance · Store Operations",
      action: "Open inspections and corrective tasks",
      link: "/app/retail/inspection",
      count: failedAudits.length,
    });
  }

  const rank = { critical: 0, high: 1, medium: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity] || b.impact - a.impact);
}

// ---- Drill-down --------------------------------------------------------------------

export type Level = "country" | "region" | "store" | "department" | "category" | "sku";
export interface DrillPath {
  country?: string;
  region?: string;
  store?: number;
  department?: string;
  category?: string;
}

export interface DrillRow {
  key: string;
  label: string;
  sub?: string;
  sales30: number;
  inventoryValue: number;
  availability: number;
  outOfStock: number;
  overstockValue: number;
  carried: number;
}

export function nextLevel(path: DrillPath): Level {
  if (!path.country) return "country";
  if (!path.region) return "region";
  if (path.store === undefined) return "store";
  if (!path.department) return "department";
  if (!path.category) return "category";
  return "sku";
}

export function drillDown(st: RetailState, path: DrillPath, scope: Scope = null): DrillRow[] {
  const { base, thresholds } = st;
  const level = nextLevel(path);
  const rows = new Map<string, DrillRow>();
  const keyOf = (s: Store, sku: Sku): [string, string, string?] => {
    switch (level) {
      case "country":
        return [s.country, base.countries.find((c) => c.code === s.country)!.name];
      case "region":
        return [s.region, s.region];
      case "store":
        return [String(s.idx), `${s.id} ${s.name}`, `${s.format} · ${s.city}`];
      case "department":
        return [sku.department, sku.department];
      case "category":
        return [sku.category, sku.category];
      default:
        return [String(sku.idx), sku.name, `${sku.id} · ${sku.brand}`];
    }
  };
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    if (path.country && s.country !== path.country) continue;
    if (path.region && s.region !== path.region) continue;
    if (path.store !== undefined && s.idx !== path.store) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const sku = base.skus[k];
      if (path.department && sku.department !== path.department) continue;
      if (path.category && sku.category !== path.category) continue;
      const [key, label, sub] = keyOf(s, sku);
      let r = rows.get(key);
      if (!r) rows.set(key, (r = { key, label, sub, sales30: 0, inventoryValue: 0, availability: 0, outOfStock: 0, overstockValue: 0, carried: 0 }));
      const v = base.velocity[p];
      const oh = st.onHand(p);
      r.sales30 += v * sku.price * (30 - Math.min(30, st.lastSale(p)));
      r.inventoryValue += oh * sku.cost;
      r.carried++;
      if (available(st, p) === 0 && v >= 0.25) r.outOfStock++;
      if (oh / Math.max(v, 0.02) > thresholds.overstockDays) r.overstockValue += Math.max(0, oh - v * 30) * sku.cost;
    }
  }
  for (const r of rows.values()) r.availability = r.carried ? 1 - r.outOfStock / r.carried : 1;
  return Array.from(rows.values()).sort((a, b) => b.sales30 - a.sales30);
}

// ---- Store diagnosis ---------------------------------------------------------------

export function storeDiagnosis(st: RetailState, storeIdx: number) {
  const { base } = st;
  const perf = storePerformance(st);
  const me = perf.find((p) => p.store.idx === storeIdx)!;
  const peers = perf.filter((p) => p.store.region === me.store.region && p.store.idx !== storeIdx);
  const avg = (f: (p: StorePerf) => number) => (peers.length ? peers.reduce((a, p) => a + f(p), 0) / peers.length : f(me));
  const so = stockoutRisks(st, new Set([storeIdx]));
  const oos = so.filter((x) => x.outOfStock);
  const byCat = new Map<string, { lost: number; count: number }>();
  for (const x of oos) {
    const c = base.skus[x.skuIdx].category;
    const e = byCat.get(c) ?? { lost: 0, count: 0 };
    e.lost += x.lostSalesPerDay;
    e.count++;
    byCat.set(c, e);
  }
  const faults = equipmentIssues(st, new Set([storeIdx]));
  const prices = base.pricingExceptions.filter((x) => x.storeIdx === storeIdx && !st.fixedPrices.has(x.id));
  const audits = base.audits.filter((a) => a.storeIdx === storeIdx).sort((a, b) => a.score - b.score);
  const delays = supplierDelays(st, new Set([storeIdx])).filter((d) => d.affectedStores.includes(storeIdx));
  return {
    perf: me,
    peerAvg: { availability: avg((p) => p.availability), vsTarget: avg((p) => p.vsTarget), auditScore: avg((p) => p.auditScore), lostSales30: avg((p) => p.lostSales30) },
    topOos: oos.slice(0, 12),
    oosByCategory: Array.from(byCat, ([category, v]) => ({ category, ...v })).sort((a, b) => b.lost - a.lost),
    faults,
    pricingExceptions: prices,
    lowAudits: audits.slice(0, 4),
    supplierDelays: delays,
  };
}

/** Transfers recommended to fix stockouts (one per store-SKU). */
export function transferRecommendations(st: RetailState, scope: Scope = null) {
  const pending = new Set(st.transfers.filter((t) => t.status !== "Cancelled" && t.status !== "Received").map((t) => `${t.toStore}-${t.skuIdx}`));
  return stockoutRisks(st, scope).filter((x) => x.donor && !pending.has(`${x.storeIdx}-${x.skuIdx}`));
}

// ---- Supplier scorecards -------------------------------------------------------------

export interface SupplierScore {
  idx: number;
  pos: number;
  openPos: number;
  latePos: number;
  onTimeRate: number;
  fillRate: number;
  avgDelayDays: number;
  spend: number;
  invoiceIssues: number;
  skuCount: number;
  riskScore: number;
}

export function supplierScorecards(st: RetailState): SupplierScore[] {
  const { base } = st;
  const today = base.anchorDate;
  const skuCount = new Map<number, number>();
  base.skus.forEach((s) => skuCount.set(s.supplierIdx, (skuCount.get(s.supplierIdx) ?? 0) + 1));
  return base.suppliers.map((s) => {
    const mine = st.pos.filter((p) => p.supplierIdx === s.idx);
    const done = mine.filter((p) => p.received);
    const onTime = done.filter((p) => p.received! <= p.promised).length;
    const ordered = done.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.ordered, 0), 0);
    const received = done.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.received, 0), 0);
    const delays = done.map((p) => Math.max(0, (new Date(p.received!).getTime() - new Date(p.promised).getTime()) / 86_400_000));
    const open = mine.filter((p) => !p.received && p.status !== "Cancelled");
    const late = open.filter((p) => p.promised < today && p.status !== "Pending approval");
    const issues = done.reduce((a, p) => a + p.lines.filter((l) => (l.invoicedCost ?? l.unitCost) > l.unitCost * 1.01 || (l.invoicedQty ?? 0) > l.received).length, 0);
    const onTimeRate = done.length ? onTime / done.length : 1;
    const fillRate = ordered ? received / ordered : 1;
    const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
    return {
      idx: s.idx,
      pos: mine.length,
      openPos: open.length,
      latePos: late.length,
      onTimeRate,
      fillRate,
      avgDelayDays: avgDelay,
      spend: mine.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.ordered * l.unitCost, 0), 0),
      invoiceIssues: issues,
      skuCount: skuCount.get(s.idx) ?? 0,
      riskScore: Math.round(Math.min(100, (1 - onTimeRate) * 60 + (1 - fillRate) * 120 + Math.min(avgDelay, 8) * 3 + late.length * 4)),
    };
  });
}

// ---- Stock movement ledger (derived) -------------------------------------------------

export interface Movement {
  date: string;
  type: "Sale" | "Receipt" | "Transfer in" | "Transfer out" | "Adjustment" | "Return" | "Cycle count" | "Damage";
  qty: number;
  ref: string;
}

export function movementHistory(st: RetailState, storeIdx: number, k: number, days = 21): Movement[] {
  const { base } = st;
  const p = storeIdx * NSKU + k;
  const v = base.velocity[p];
  const out: Movement[] = [];
  const day = (n: number) => new Date(new Date(base.anchorDate).getTime() - n * 86_400_000).toISOString().slice(0, 10);
  const noSale = st.lastSale(p);
  for (let d = days; d >= 1; d--) {
    const sold = d <= noSale ? 0 : Math.round(v * (0.7 + ((d * 37 + k) % 10) / 16));
    if (sold > 0) out.push({ date: day(d), type: "Sale", qty: -sold, ref: "POS" });
    if ((d + k) % 7 === 0 && d > noSale) out.push({ date: day(d), type: "Receipt", qty: Math.max(1, Math.round(v * 7)), ref: `GRN-${(k * 13 + d) % 9000 + 1000}` });
    if ((d * 3 + k) % 29 === 0) out.push({ date: day(d), type: "Return", qty: 1, ref: `RTN-${(k + d) % 900 + 100}` });
    if ((d + storeIdx + k) % 41 === 0) out.push({ date: day(d), type: "Damage", qty: -1, ref: "Write-off" });
  }
  for (const t of st.transfers.filter((t) => t.skuIdx === k && t.status !== "Cancelled" && t.status !== "Requested")) {
    if (t.toStore === storeIdx && t.status === "Received") out.push({ date: t.created.slice(0, 10), type: "Transfer in", qty: t.qty, ref: t.id });
    if (t.from.type === "store" && t.from.idx === storeIdx) out.push({ date: t.created.slice(0, 10), type: "Transfer out", qty: -t.qty, ref: t.id });
  }
  for (const c of st.counts.filter((c) => c.storeIdx === storeIdx && c.skuIdx === k && c.status === "Reconciled")) out.push({ date: c.created.slice(0, 10), type: "Cycle count", qty: c.variance ?? 0, ref: c.id });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

/** Replenishment parameters for a store-SKU. */
export function replenParams(st: RetailState, storeIdx: number, k: number) {
  const { base } = st;
  const sku = base.skus[k];
  const v = base.velocity[storeIdx * NSKU + k];
  const lead = sku.perishable ? base.suppliers[sku.supplierIdx].leadTimeDays : 2;
  const safety = Math.ceil(v * 3);
  const min = safety;
  const rop = Math.ceil(safety + v * lead);
  const max = Math.ceil(rop + v * st.thresholds.targetDays);
  return { velocity: v, lead, safety, min, rop, max };
}
