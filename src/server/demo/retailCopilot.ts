import { NSKU } from "../../demo/retail/generate";
import { getRetailData } from "./data";
import { buildState, type RetailEvent, type RetailState } from "../../demo/retail/state";
import {
  equipmentIssues,
  expiryRisks,
  overstock,
  phantomInventory,
  retailKpis,
  storeDiagnosis,
  stockoutRisks,
  supplierDelays,
  supplierScorecards,
  transferRecommendations,
  type Scope,
} from "../../demo/retail/analytics";
import { salesByStore, salesPrev, salesTotals, upcomingEvents } from "../../demo/retail/metrics";
import type { CopilotResponse, CopilotTurn, Visual } from "../../demo/copilotTypes";
import { sarvamChat, type ChatMessage, type ToolDef } from "./sarvam";

// ---------------------------------------------------------------------------
// Ask SCIO for Retail: tool-calling over the live retail state (base data +
// the user's actions). Every figure comes from tools; visuals are built here.
// ---------------------------------------------------------------------------

type Args = Record<string, unknown>;
interface ToolResult {
  data: unknown;
  visuals: Visual[];
}
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
const lim = (a: Args, d = 10, m = 25) => Math.min(m, Math.max(1, Number(a.limit) || d));

function findStore(st: RetailState, q: unknown): number | null {
  if (typeof q !== "string" || !q.trim()) return null;
  const s = q.toLowerCase().replace(/store/g, "").trim();
  const num = s.match(/\d{3}/)?.[0];
  if (num) {
    const hit = st.base.stores.find((x) => x.id === `S${num}`);
    if (hit) return hit.idx;
  }
  return st.base.stores.find((x) => x.name.toLowerCase().includes(s) || x.city.toLowerCase() === s)?.idx ?? null;
}
function countryScope(st: RetailState, c: unknown, base: Scope): Scope {
  if (typeof c !== "string" || !c.trim()) return base;
  const q = c.toLowerCase();
  const country = st.base.countries.find((x) => x.code.toLowerCase() === q || x.name.toLowerCase().includes(q) || (q === "ksa" && x.code === "SA") || (q === "uae" && x.code === "AE"));
  if (!country) return base;
  return new Set(st.base.stores.filter((s) => s.country === country.code && (!base || base.has(s.idx))).map((s) => s.idx));
}
const sname = (st: RetailState, s: number) => `${st.base.stores[s].id} ${st.base.stores[s].name}`;

function tools(st: RetailState, scope: Scope): Array<ToolDef & { run: (a: Args) => ToolResult }> {
  const { base } = st;
  return [
    {
      type: "function",
      function: { name: "get_retail_overview", description: "Chain KPIs: stores, active SKUs, inventory value, stockouts, overstock, supplier delays, expiry risk, losses, sales vs target and the top problems.", parameters: { type: "object", properties: {} } },
      run: () => {
        const k = retailKpis(st, scope);
        return {
          data: { currency: "AED", stores: k.stores, activeSkus: k.activeSkus, inventoryValue: r0(k.inventoryValue), outOfStockStoreSkus: k.outOfStock, stockoutRisks: k.stockoutRisks, lostSalesPerDay: r0(k.lostSalesPerDay), overstockValue: r0(k.overstockValue), overdueSupplierPOs: k.supplierDelays, expiryRiskValue: r0(k.expiryRiskValue), phantomRecords: k.phantomCount, sales30: r0(k.sales30), salesVsTarget: r1(k.salesVsTarget * 100) + "%", availability: r1(k.availability * 100) + "%" },
          visuals: [],
        };
      },
    },
    {
      type: "function",
      function: {
        name: "get_stockout_forecast",
        description: "Stores and SKUs that will run out of stock within N days (default 7), with lost sales and whether a transfer source exists. Optional country or store filter.",
        parameters: { type: "object", properties: { days: { type: "number" }, country: { type: "string" }, store: { type: "string" }, limit: { type: "number" } } },
      },
      run: (a) => {
        const days = Math.min(30, Math.max(1, Number(a.days) || 7));
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? new Set([sIdx]) : countryScope(st, a.country, scope);
        const rows: Array<{ s: number; k: number; dos: number; lost: number; donor: boolean }> = [];
        for (const s of base.stores) {
          if (sc && !sc.has(s.idx)) continue;
          for (let k = 0; k < NSKU; k++) {
            const p = s.idx * NSKU + k;
            if (!base.carried[p] || base.velocity[p] < 0.25) continue;
            const avail = Math.max(0, st.onHand(p) - base.reserved[p] - base.damaged[p]) + st.inbound(p);
            const dos = avail / base.velocity[p];
            if (dos <= days) rows.push({ s: s.idx, k, dos, lost: base.velocity[p] * base.skus[k].price, donor: false });
          }
        }
        const byStore = new Map<number, { count: number; lost: number }>();
        for (const r of rows) {
          const e = byStore.get(r.s) ?? { count: 0, lost: 0 };
          e.count++;
          e.lost += r.lost * Math.max(0, days - r.dos);
          byStore.set(r.s, e);
        }
        const stores = Array.from(byStore, ([s, v]) => ({ s, ...v })).sort((x, y) => y.lost - x.lost).slice(0, lim(a, 10));
        const top = rows.sort((x, y) => x.dos - y.dos || y.lost - x.lost).slice(0, 12);
        return {
          data: { horizonDays: days, storeSkusAtRisk: rows.length, storesAffected: byStore.size, worstStores: stores.map((x) => ({ store: sname(st, x.s), skusRunningOut: x.count, expectedLostSalesAED: r0(x.lost) })), mostUrgent: top.map((r) => ({ store: base.stores[r.s].id, sku: base.skus[r.k].id, name: base.skus[r.k].name, daysOfSupply: r1(r.dos) })) },
          visuals: [
            { kind: "hbar", title: `Expected lost sales if not replenished · next ${days} days`, xKey: "store", format: "money", series: [{ key: "lost", label: "Lost sales" }], rows: stores.map((x) => ({ store: sname(st, x.s), lost: r0(x.lost) })) },
            { kind: "table", title: "Most urgent store-SKUs", columns: [{ key: "store", label: "Store" }, { key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "dos", label: "Days of supply", format: "days" }], rows: top.map((r) => ({ store: base.stores[r.s].id, sku: base.skus[r.k].id, name: base.skus[r.k].name, dos: r1(r.dos) })) },
          ],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_overstock", description: "Overstocked store-SKUs (days of supply above threshold) with excess value. Optional store, country or category.", parameters: { type: "object", properties: { store: { type: "string" }, country: { type: "string" }, category: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? new Set([sIdx]) : countryScope(st, a.country, scope);
        const cat = typeof a.category === "string" ? a.category.toLowerCase() : "";
        const rows = overstock(st, sc).filter((r) => !cat || base.skus[r.skuIdx].category.toLowerCase().includes(cat) || base.skus[r.skuIdx].department.toLowerCase().includes(cat));
        const top = rows.slice(0, lim(a, 10));
        return {
          data: { currency: "AED", overstockedStoreSkus: rows.length, excessValue: r0(rows.reduce((s, r) => s + r.excessValue, 0)), top: top.map((r) => ({ store: base.stores[r.storeIdx].id, sku: base.skus[r.skuIdx].id, name: base.skus[r.skuIdx].name, daysOfSupply: r0(r.daysOfSupply), excessUnits: r.excessUnits, excessValue: r0(r.excessValue) })) },
          visuals: [{ kind: "table", title: "Most overstocked", columns: [{ key: "store", label: "Store" }, { key: "name", label: "Product" }, { key: "dos", label: "Days of supply", format: "number" }, { key: "val", label: "Excess value", format: "money" }], rows: top.map((r) => ({ store: base.stores[r.storeIdx].id, name: base.skus[r.skuIdx].name, dos: r0(r.daysOfSupply), val: r0(r.excessValue) })) }],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_transfer_recommendations", description: "Products that should be transferred between stores (or from DC) to fix stockouts, with source, destination, quantity and sales protected.", parameters: { type: "object", properties: { store: { type: "string" }, country: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? new Set([sIdx]) : countryScope(st, a.country, scope);
        const rows = transferRecommendations(st, sc).slice(0, lim(a, 12));
        const src = (r: (typeof rows)[number]) => (r.donor!.type === "store" ? base.stores[r.donor!.idx].id : base.dcs[r.donor!.idx].name);
        return {
          data: rows.map((r) => ({ product: base.skus[r.skuIdx].name, sku: base.skus[r.skuIdx].id, from: src(r), to: sname(st, r.storeIdx), qty: r.donor!.qty, destinationDaysLeft: r1(r.daysOfSupply), salesProtected7dAED: r0(r.lostSalesPerDay * 7) })),
          visuals: [{ kind: "table", title: "Recommended transfers", columns: [{ key: "p", label: "Product" }, { key: "f", label: "From" }, { key: "t", label: "To" }, { key: "q", label: "Qty", format: "number" }, { key: "v", label: "Sales protected (7d)", format: "money" }], rows: rows.map((r) => ({ p: base.skus[r.skuIdx].name, f: src(r), t: base.stores[r.storeIdx].id, q: r.donor!.qty, v: r0(r.lostSalesPerDay * 7) })) }],
        };
      },
    },
    {
      type: "function",
      function: { name: "diagnose_store", description: "Explain a store's performance: sales vs target, availability vs regional peers, lost sales, out-of-stock categories, equipment faults, pricing exceptions, audit scores, supplier delays. Use for 'why is store X losing sales'.", parameters: { type: "object", properties: { store: { type: "string", description: "Store id (e.g. S118 or 118) or name" } }, required: ["store"] } },
      run: (a) => {
        const s = findStore(st, a.store);
        if (s === null) return { data: { error: "Store not found" }, visuals: [] };
        const d = storeDiagnosis(st, s);
        return {
          data: {
            store: sname(st, s),
            city: base.stores[s].city,
            sales30AED: r0(d.perf.sales30),
            targetAED: r0(d.perf.target),
            salesVsTarget: r1(d.perf.vsTarget * 100) + "%",
            availability: r1(d.perf.availability * 100) + "%",
            regionalPeerAvailability: r1(d.peerAvg.availability * 100) + "%",
            outOfStockSkus: d.perf.outOfStock,
            lostSales30AED: r0(d.perf.lostSales30),
            peerAvgLostSales30AED: r0(d.peerAvg.lostSales30),
            topOutOfStockCategories: d.oosByCategory.slice(0, 4).map((c) => ({ category: c.category, skus: c.count, lostPerMonthAED: r0(c.lost * 30) })),
            equipmentFaults: d.faults.map((f) => ({ equipment: `${f.equipment.type} ${f.equipment.id}`, issue: f.equipment.fault!.kind, ticket: f.ticketId ?? "none" })),
            pricingExceptions: d.pricingExceptions.length,
            auditScore: r0(d.perf.auditScore),
            peerAuditScore: r0(d.peerAvg.auditScore),
            supplierDelaysAffecting: d.supplierDelays.length,
          },
          visuals: [
            { kind: "bar", title: `${base.stores[s].id} vs ${base.stores[s].region} peers`, xKey: "metric", format: "percent", series: [{ key: "store", label: base.stores[s].id }, { key: "peers", label: "Peer average" }], rows: [{ metric: "Availability", store: r1(d.perf.availability * 100), peers: r1(d.peerAvg.availability * 100) }, { metric: "Sales vs target", store: r1(d.perf.vsTarget * 100), peers: r1(d.peerAvg.vsTarget * 100) }, { metric: "Audit score", store: r0(d.perf.auditScore), peers: r0(d.peerAvg.auditScore) }] },
            { kind: "table", title: "Out-of-stock categories", columns: [{ key: "c", label: "Category" }, { key: "n", label: "SKUs out", format: "number" }, { key: "l", label: "Lost sales / month", format: "money" }], rows: d.oosByCategory.slice(0, 6).map((c) => ({ c: c.category, n: c.count, l: r0(c.lost * 30) })) },
          ],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_supplier_performance", description: "Suppliers ranked by delivery risk: on-time rate, fill rate, average delay, late open POs, invoice issues; plus currently overdue POs and affected stores.", parameters: { type: "object", properties: { limit: { type: "number" } } } },
      run: (a) => {
        const sc = supplierScorecards(st).sort((x, y) => y.riskScore - x.riskScore).slice(0, lim(a, 8));
        const delays = supplierDelays(st, scope);
        return {
          data: { overduePOs: delays.map((d) => ({ po: d.poId, supplier: base.suppliers[d.supplierIdx].name, daysLate: d.daysLate, storesRunningLow: d.affectedStores.length })), suppliers: sc.map((s) => ({ supplier: base.suppliers[s.idx].name, onTime: r1(s.onTimeRate * 100) + "%", fillRate: r1(s.fillRate * 100) + "%", avgDelayDays: r1(s.avgDelayDays), lateOpenPOs: s.latePos, riskScore: s.riskScore })) },
          visuals: [
            { kind: "hbar", title: "Supplier on-time delivery (%)", xKey: "s", format: "percent", series: [{ key: "v", label: "On time" }], rows: sc.map((s) => ({ s: base.suppliers[s.idx].name, v: r1(s.onTimeRate * 100) })) },
            { kind: "table", title: "Supplier scorecard", columns: [{ key: "s", label: "Supplier" }, { key: "ot", label: "On time", format: "percent" }, { key: "f", label: "Fill rate", format: "percent" }, { key: "d", label: "Avg delay", format: "days" }, { key: "l", label: "Late POs", format: "number" }], rows: sc.map((s) => ({ s: base.suppliers[s.idx].name, ot: r1(s.onTimeRate * 100), f: r1(s.fillRate * 100), d: r1(s.avgDelayDays), l: s.latePos })) },
          ],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_expiring_products", description: "Perishable batches expiring within N days (default 15) that will not sell through in time, with value at risk and recommended markdown or transfer.", parameters: { type: "object", properties: { days: { type: "number" }, store: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? new Set([sIdx]) : scope;
        const days = Math.min(30, Math.max(1, Number(a.days) || st.thresholds.expiryDays));
        const rows = expiryRisks({ ...st, thresholds: { ...st.thresholds, expiryDays: days } }, sc).filter((x) => x.markedDown === null);
        const top = rows.slice(0, lim(a, 12));
        return {
          data: { windowDays: days, batchesAtRisk: rows.length, valueAtRiskAED: r0(rows.reduce((s, r) => s + r.atRiskValue, 0)), top: top.map((r) => ({ store: base.stores[r.storeIdx].id, product: base.skus[r.skuIdx].name, lot: r.lot, daysLeft: r.daysLeft, qty: r.qty, expectedToSell: r.expectedToSell, valueAtRiskAED: r0(r.atRiskValue), recommendation: r.recommendation === "transfer" ? `transfer to ${base.stores[r.transferTo!].id}` : `markdown ${st.thresholds.markdownPct}%` })) },
          visuals: [{ kind: "table", title: `Expiring within ${days} days`, columns: [{ key: "s", label: "Store" }, { key: "p", label: "Product" }, { key: "d", label: "Days left", format: "number" }, { key: "q", label: "Qty", format: "number" }, { key: "v", label: "At risk", format: "money" }, { key: "r", label: "Recommendation" }], rows: top.map((r) => ({ s: base.stores[r.storeIdx].id, p: base.skus[r.skuIdx].name, d: r.daysLeft, q: r.qty, v: r0(r.atRiskValue), r: r.recommendation === "transfer" ? `Transfer → ${base.stores[r.transferTo!].id}` : `Markdown ${st.thresholds.markdownPct}%` })) }],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_inventory_accuracy", description: "Phantom inventory (system shows stock but no sales for days) and cycle counts in progress.", parameters: { type: "object", properties: { store: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const rows = phantomInventory(st, sIdx !== null ? new Set([sIdx]) : scope).slice(0, lim(a, 10));
        return {
          data: { phantomRecords: rows.length, countsInProgress: st.counts.filter((c) => c.status === "Counting").length, reconciled: st.counts.filter((c) => c.status === "Reconciled").map((c) => ({ count: c.id, variance: c.variance })), top: rows.map((r) => ({ store: base.stores[r.storeIdx].id, product: base.skus[r.skuIdx].name, systemQty: r.systemQty, daysNoSale: r.daysNoSale })) },
          visuals: [{ kind: "table", title: "Possible phantom inventory", columns: [{ key: "s", label: "Store" }, { key: "p", label: "Product" }, { key: "q", label: "System qty", format: "number" }, { key: "d", label: "Days without sale", format: "number" }], rows: rows.map((r) => ({ s: base.stores[r.storeIdx].id, p: base.skus[r.skuIdx].name, q: r.systemQty, d: r.daysNoSale })) }],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_equipment_issues", description: "Store equipment faults (refrigeration, HVAC, POS, generators) from IoT readings, ticket status and stock at risk.", parameters: { type: "object", properties: {} } },
      run: () => {
        const rows = equipmentIssues(st, scope);
        return {
          data: rows.map((e) => ({ store: base.stores[e.storeIdx].id, equipment: `${e.equipment.type} ${e.equipment.id}`, issue: e.equipment.fault!.kind, reading: `${e.latest}${e.equipment.unit}`, ticket: e.ticketId ? `${e.ticketId} (${e.ticketStatus})` : "no ticket", stockAtRiskAED: r0(e.stockAtRiskValue) })),
          visuals: [{ kind: "table", title: "Equipment faults", columns: [{ key: "s", label: "Store" }, { key: "e", label: "Equipment" }, { key: "r", label: "Reading" }, { key: "t", label: "Ticket" }, { key: "v", label: "Stock at risk", format: "money" }], rows: rows.map((e) => ({ s: base.stores[e.storeIdx].id, e: `${e.equipment.type} ${e.equipment.id}`, r: `${e.latest}${e.equipment.unit}`, t: e.ticketId ?? "None", v: r0(e.stockAtRiskValue) })) }],
        };
      },
    },
    {
      type: "function",
      function: { name: "get_sku_analysis", description: "Analyse one product by SKU id, barcode or name: stock and sales across stores, stockouts, overstock, expiry and recommended actions.", parameters: { type: "object", properties: { sku: { type: "string" } }, required: ["sku"] } },
      run: (a) => {
        const q = String(a.sku ?? "").toLowerCase();
        const sku = base.skus.find((s) => s.id.toLowerCase() === q || s.gtin === q) ?? base.skus.find((s) => s.name.toLowerCase().includes(q));
        if (!sku) return { data: { error: "SKU not found" }, visuals: [] };
        const rows = base.stores.filter((s) => (!scope || scope.has(s.idx)) && base.carried[s.idx * NSKU + sku.idx]).map((s) => {
          const p = s.idx * NSKU + sku.idx;
          return { store: s.id, onHand: st.onHand(p), perDay: r1(base.velocity[p]), dos: r1(st.onHand(p) / Math.max(0.05, base.velocity[p])) };
        });
        const so = stockoutRisks(st, scope).filter((r) => r.skuIdx === sku.idx);
        return {
          data: { sku: sku.id, name: sku.name, brand: sku.brand, category: `${sku.department} > ${sku.category}`, costAED: sku.cost, priceAED: sku.price, marginPct: r1(((sku.price - sku.cost) / sku.price) * 100), storesRanged: rows.length, totalOnHand: rows.reduce((s, r) => s + r.onHand, 0), salesPerDay: r1(rows.reduce((s, r) => s + r.perDay, 0)), storesAtStockoutRisk: so.map((r) => base.stores[r.storeIdx].id), lowestCover: rows.sort((x, y) => x.dos - y.dos).slice(0, 5) },
          visuals: [{ kind: "table", title: `${sku.name} · lowest cover`, columns: [{ key: "store", label: "Store" }, { key: "onHand", label: "On hand", format: "number" }, { key: "perDay", label: "Sales/day", format: "number" }, { key: "dos", label: "Days of supply", format: "days" }], rows: rows.slice(0, 10) }],
        };
      },
    },
    {
      type: "function",
      function: {
        name: "get_sales_growth_levers",
        description:
          "Sales & margin analysis with the biggest levers to grow sales: net sales, LFL growth, gross margin, ATV, UPT, conversion, discount leakage, weakest stores, lost sales from stockouts, basket cross-sell pairs and upcoming trading events. Use for any question about increasing sales, revenue, growth, margin or store performance.",
        parameters: { type: "object", properties: { days: { type: "number", description: "Period in days (default 30)" } } },
      },
      run: (a) => {
        const days = Math.min(120, Math.max(7, Number(a.days) || 30));
        const t = salesTotals(st, scope, days);
        const prev = salesPrev(st, scope, days);
        const stores = salesByStore(st, scope, days);
        const weakest = [...stores].sort((x, y) => x.lfl - y.lfl).slice(0, 5);
        const k = retailKpis(st, scope);
        const lost30 = k.perf.reduce((s, p) => s + p.lostSales30, 0);
        const byCity = new Map<string, { net: number; gross: number; disc: number; cogs: number }>();
        for (const s of stores) {
          const e = byCity.get(s.store.city) ?? { net: 0, gross: 0, disc: 0, cogs: 0 };
          e.net += s.net;
          e.gross += s.gross;
          e.disc += s.discounts;
          e.cogs += s.cogs;
          byCity.set(s.store.city, e);
        }
        const leakage = [...byCity.entries()].map(([city, e]) => ({ city, discountRate: r1((e.disc / Math.max(1, e.gross)) * 100), gmPct: r1(((e.net - e.cogs) / Math.max(1, e.net)) * 100), net: r0(e.net) })).sort((x, y) => y.discountRate - x.discountRate).slice(0, 4);
        const events = upcomingEvents(st, scope, 45).map((e) => ({ name: e.name, start: e.start, end: e.end, upliftByDepartment: e.uplift }));
        const cross = base.basket.filter((_, i) => i % 2 === 0).slice(0, 4).map((b) => ({ ifBuys: b.a, alsoBuys: b.b, confidencePct: r0(b.confidence * 100), lift: b.lift }));
        return {
          data: {
            periodDays: days,
            netSalesAED: r0(t.net),
            vsPriorPeriodPct: r1((t.net / Math.max(1, prev.net) - 1) * 100),
            lflGrowthPct: r1(t.lfl * 100),
            grossMarginPct: r1(t.gmPct * 100),
            grossMarginChangePp: r1((t.gmPct - prev.gmPct) * 100),
            atvAED: r1(t.atv),
            unitsPerTransaction: r1(t.upt),
            conversionPct: r1(t.conversion * 100),
            discountRatePct: r1(t.discountRate * 100),
            lostSalesFromStockouts30dAED: r0(lost30),
            outOfStockNow: k.outOfStock,
            weakestStoresByLfl: weakest.map((s) => ({ store: `${s.store.id} ${s.store.name}`, city: s.store.city, lflPct: r1(s.lfl * 100), conversionPct: r1(s.conversion * 100), netAED: r0(s.net) })),
            highestDiscountCities: leakage,
            crossSellPairs: cross,
            upcomingEvents: events,
          },
          visuals: [
            { kind: "hbar", title: "Weakest stores · LFL growth %", xKey: "name", series: [{ key: "lfl", label: "LFL %" }], format: "number", rows: weakest.map((s) => ({ name: `${s.store.id} ${s.store.name}`, lfl: r1(s.lfl * 100) })) },
            { kind: "table", title: "Growth levers", columns: [{ key: "lever", label: "Lever" }, { key: "evidence", label: "Evidence" }, { key: "value", label: "Size (AED)", format: "money" }], rows: [
              { lever: "Fix stockouts", evidence: `${k.outOfStock} store-SKUs out of stock now`, value: r0(lost30) },
              { lever: "Stop discount leakage", evidence: `${leakage[0]?.city ?? "—"} discount rate ${leakage[0]?.discountRate ?? 0}% · GM ${leakage[0]?.gmPct ?? 0}%`, value: r0((t.discounts - prev.discounts) > 0 ? t.discounts - prev.discounts : 0) },
              { lever: "Lift basket size (cross-sell)", evidence: cross[0] ? `${cross[0].ifBuys} → ${cross[0].alsoBuys} (lift ${cross[0].lift}×)` : "—", value: r0(t.net * 0.02) },
              { lever: "Turn around weakest stores", evidence: weakest[0] ? `${weakest[0].store.id} LFL ${r1(weakest[0].lfl * 100)}%` : "—", value: r0(weakest.reduce((s, x) => s + Math.max(0, x.lyNet - x.net), 0)) },
            ] },
          ],
        };
      },
    },
  ];
}

const FOLLOW: Record<string, string[]> = {
  get_retail_overview: ["Which stores will run out of stock this week?", "Which suppliers are delivering late?"],
  get_stockout_forecast: ["Which products should be transferred between stores?", "Why is Store 118 losing sales?"],
  get_overstock: ["Which products should be transferred between stores?", "Which products will expire within 15 days?"],
  get_transfer_recommendations: ["Which SKUs are overstocked?", "Which stores will run out of stock this week?"],
  diagnose_store: ["Which products should be transferred to this store?", "Which equipment faults are open?"],
  get_supplier_performance: ["Which stores are affected by late deliveries?", "Which stores will run out of stock this week?"],
  get_expiring_products: ["Which SKUs are overstocked?", "What is the total inventory loss risk?"],
  get_inventory_accuracy: ["Which stores will run out of stock this week?", "Why is Store 118 losing sales?"],
  get_equipment_issues: ["Why is Store 118 losing sales?", "Which products will expire within 15 days?"],
  get_sku_analysis: ["Which products should be transferred between stores?", "Which SKUs are overstocked?"],
  get_sales_growth_levers: ["Why is gross margin declining in Dubai stores?", "Why is Store 118 losing sales?", "Which stores will run out of stock this week?"],
};

/** What SCIO did for each tool, shown to the user as a step. */
const STEP: Record<string, (a: Args) => string> = {
  get_retail_overview: () => "Read chain KPIs across stores, stock, suppliers and expiry",
  get_stockout_forecast: () => "Forecast days of supply for every store-SKU",
  get_overstock: () => "Scanned store-SKUs above the overstock threshold",
  get_transfer_recommendations: () => "Matched stockouts with donor stores and DCs",
  diagnose_store: (a) => `Diagnosed store ${String(a.store ?? "").toUpperCase()} against regional peers`,
  get_supplier_performance: () => "Scored suppliers on on-time delivery and fill rate",
  get_expiring_products: (a) => `Checked perishable batches expiring within ${a.days ?? 15} days`,
  get_inventory_accuracy: () => "Looked for phantom inventory and open cycle counts",
  get_equipment_issues: () => "Read equipment sensors, faults and open tickets",
  get_sku_analysis: (a) => `Analysed ${String(a.sku ?? "the SKU")} across all stores`,
  get_sales_growth_levers: (a) => `Analysed ${a.days ?? 30}-day POS sales, margin, baskets and lost sales across stores`,
};

/** Where the user can act on each kind of answer. */
const ACTION: Record<string, (a: Args) => { label: string; to: string }> = {
  get_retail_overview: () => ({ label: "Open master dashboard", to: "/app/retail/master" }),
  get_stockout_forecast: () => ({ label: "Fix stockouts", to: "/app/retail/replenishment?tab=stockouts" }),
  get_overstock: () => ({ label: "Rebalance overstock", to: "/app/retail/replenishment?tab=overstock" }),
  get_transfer_recommendations: () => ({ label: "Approve transfers", to: "/app/retail/transfers" }),
  diagnose_store: (a) => ({ label: `Open store ${String(a.store ?? "").toUpperCase().replace(/^(\d)/, "S$1")}`, to: `/app/retail/stores/${String(a.store ?? "").toUpperCase().replace(/^(\d)/, "S$1")}` }),
  get_supplier_performance: () => ({ label: "Review late deliveries", to: "/app/retail/suppliers?tab=delays" }),
  get_expiring_products: () => ({ label: "Apply markdowns & transfers", to: "/app/retail/replenishment?tab=expiry" }),
  get_inventory_accuracy: () => ({ label: "Start cycle counts", to: "/app/retail/replenishment?tab=phantom" }),
  get_equipment_issues: () => ({ label: "Create maintenance tickets", to: "/app/retail/maintenance" }),
  get_sku_analysis: (a) => ({ label: "Open SKU details", to: `/app/retail/skus?sku=${encodeURIComponent(String(a.sku ?? ""))}` }),
  get_sales_growth_levers: () => ({ label: "Open sales & margin dashboard", to: "/app/retail/insights/sales" }),
};

/** Turn an evidence table into a ranked bar chart (category column × money/number column). */
function chartFor(t: Visual): Visual | null {
  if (t.kind !== "table" || t.rows.length < 2) return null;
  const valueCol = t.columns.find((c) => c.format === "money") ?? t.columns.find((c) => c.format === "number" || c.format === "days");
  const catCol = t.columns.find((c) => !c.format || c.format === "text");
  if (!valueCol || !catCol) return null;
  const sums = new Map<string, number>();
  for (const r of t.rows) {
    const k = String(r[catCol.key] ?? "—");
    sums.set(k, (sums.get(k) ?? 0) + (Number(r[valueCol.key]) || 0));
  }
  const rows = [...sums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value: Math.round(value) }));
  if (rows.length < 2) return null;
  return { kind: "hbar", title: `${valueCol.label} by ${catCol.label.toLowerCase()}`, xKey: "name", series: [{ key: "value", label: valueCol.label }], format: valueCol.format === "money" ? "money" : "number", rows };
}

export async function runRetailCopilot(question: string, history: CopilotTurn[], events: RetailEvent[], scopeStores: number[] | null, token?: string): Promise<CopilotResponse> {
  const base = await getRetailData(token);
  const st = buildState(base, Array.isArray(events) ? events.slice(-2000) : []);
  const scope: Scope = scopeStores ? new Set(scopeStores) : null;
  const T = tools(st, scope);
  const defs: ToolDef[] = T.map(({ type, function: f }) => ({ type, function: f }));
  const system = `You are SCIO, the retail operations copilot inside SCIO Retail OS for a retail chain operating in the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain (${base.stores.length} stores in UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain; ${base.skus.length} SKUs). Today is ${base.anchorDate}. Reporting currency AED.
${scope ? `The user can only see these stores: ${[...scope].map((s) => base.stores[s].id).join(", ")}.` : "The user sees all stores."}
Store ids look like S101-S150 ("Store 118" = S118).
Rules:
- ALWAYS call tools before answering. Never invent numbers; use only tool figures.
- Never refuse or say you lack data. For growth, revenue, sales or margin questions call get_sales_growth_levers (plus other tools as useful) and give a prioritised action plan: the biggest levers first, each with its AED size and who should act.
- Format: one-sentence direct answer, then 2-5 short bullets with key figures (**bold** numbers), then a line starting "Recommendation:" with concrete actions (who should do what).
- Mention that tables/charts below show the evidence. Never write markdown tables (the evidence tables are rendered separately). Under 180 words.
- If asked where the data comes from, say it is sample data for this workspace; never present it as a real customer's data.`;
  const messages: ChatMessage[] = [{ role: "system", content: system }, ...history.slice(-8).map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }) as ChatMessage), { role: "user", content: question.slice(0, 1000) }];
  const visuals: Visual[] = [];
  const used: string[] = [];
  const steps: string[] = [];
  const actions: Array<{ label: string; to: string }> = [];
  const finish = (answer: string): CopilotResponse => ({
    answer,
    visuals,
    toolsUsed: used,
    followUps: Array.from(new Set(used.flatMap((t) => FOLLOW[t] ?? []))).slice(0, 3),
    steps: [...steps, ...(used.length ? [`Ranked findings by business impact and drafted actions`] : [])],
    actions: actions.filter((a, i) => actions.findIndex((x) => x.to === a.to) === i).slice(0, 3),
  });
  for (let step = 0; step < 4; step++) {
    const { message } = await sarvamChat({ messages, tools: defs, maxTokens: 900 });
    const calls = message.tool_calls ?? [];
    if (!calls.length) {
      return finish((message.content ?? "").trim() || "I couldn't answer that. Try rephrasing.");
    }
    messages.push({ role: "assistant", content: message.content ?? null, tool_calls: calls });
    for (const c of calls) {
      const tool = T.find((t) => t.function.name === c.function.name);
      let args: Args = {};
      try {
        args = JSON.parse(c.function.arguments || "{}");
      } catch {
        /* defaults */
      }
      let content: string;
      if (!tool) content = JSON.stringify({ error: "unknown tool" });
      else {
        const r = tool.run(args);
        if (!used.includes(tool.function.name)) {
          used.push(tool.function.name);
          // chart first (explains at a glance), then the evidence table
          const hasChart = r.visuals.some((v) => v.kind !== "table");
          const charts = hasChart ? [] : r.visuals.map(chartFor).filter((v): v is Visual => v !== null);
          visuals.push(...charts, ...r.visuals);
          const table = r.visuals.find((v) => v.kind === "table");
          steps.push(`${(STEP[tool.function.name] ?? (() => tool.function.name))(args)}${table ? ` · ${table.rows.length} results ranked` : ""}`);
          const act = ACTION[tool.function.name]?.(args);
          if (act) actions.push(act);
        }
        content = JSON.stringify(r.data);
      }
      messages.push({ role: "tool", tool_call_id: c.id, content });
    }
  }
  const { message } = await sarvamChat({ messages, maxTokens: 900 });
  return finish((message.content ?? "").trim());
}
