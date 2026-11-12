import { NSKU, addDaysIso } from "./generate";
import type { PoStatus, PurchaseOrder, RetailBase, Ticket, StoreTask } from "./model";

// ---------------------------------------------------------------------------
// Event-sourced operational state. Every user action is an event with an
// audit stamp; the current state = generated base data + applied events.
// ---------------------------------------------------------------------------

export interface Thresholds {
  stockoutDays: number; // days of supply at or below which a SKU is at stockout risk
  overstockDays: number; // days of supply above which stock is excess
  expiryDays: number; // look-ahead window for expiry risk
  phantomDays: number; // days without a sale (while system shows stock) to flag phantom inventory
  markdownPct: number; // default markdown for expiring stock
  targetDays: number; // days of cover a replenishment should restore
}

export const DEFAULT_THRESHOLDS: Thresholds = { stockoutDays: 3, overstockDays: 90, expiryDays: 15, phantomDays: 5, markdownPct: 30, targetDays: 14 };

export type Loc = { type: "store" | "dc"; idx: number };

interface Stamp {
  id: string;
  at: string;
  user: string;
  role: string;
}

export type RetailEvent = Stamp &
  (
    | { type: "transfer_create"; transferId: string; skuIdx: number; from: Loc; toStore: number; qty: number; reason: string; alertId?: string }
    | { type: "transfer_approve"; transferId: string }
    | { type: "transfer_receive"; transferId: string }
    | { type: "transfer_cancel"; transferId: string }
    | { type: "po_create"; poId: string; supplierIdx: number; destType: "dc" | "store"; destIdx: number; lines: Array<{ skuIdx: number; qty: number; unitCost: number }>; reason: string; leadDays: number; alertId?: string }
    | { type: "po_approve"; poId: string }
    | { type: "po_receive"; poId: string; lines: Array<{ skuIdx: number; qty: number }> }
    | { type: "markdown"; storeIdx: number; skuIdx: number; lot: string; pct: number; alertId?: string }
    | { type: "count_start"; countId: string; storeIdx: number; skuIdx: number; alertId?: string }
    | { type: "count_complete"; countId: string; counted: number }
    | { type: "ticket_create"; ticketId: string; equipmentId: string; storeIdx: number; issue: string; priority: Ticket["priority"]; alertId?: string }
    | { type: "ticket_assign"; ticketId: string; technician: string }
    | { type: "ticket_status"; ticketId: string; status: Ticket["status"] }
    | { type: "alert_status"; alertId: string; status: "acknowledged" | "resolved" | "dismissed"; note?: string }
    | { type: "task_status"; taskId: string; status: StoreTask["status"] }
    | { type: "price_fix"; exceptionId: string }
    | { type: "thresholds"; values: Partial<Thresholds> }
  );

export type EventInput = RetailEvent extends infer E ? (E extends RetailEvent ? Omit<E, keyof Stamp> : never) : never;

export interface Transfer {
  id: string;
  skuIdx: number;
  from: Loc;
  toStore: number;
  qty: number;
  reason: string;
  status: "Requested" | "Approved · in transit" | "Received" | "Cancelled";
  created: string;
  createdBy: string;
  alertId?: string;
}

export interface CycleCount {
  id: string;
  storeIdx: number;
  skuIdx: number;
  systemQty: number;
  counted: number | null;
  status: "Counting" | "Reconciled";
  variance: number | null;
  created: string;
  createdBy: string;
}

export interface Markdown {
  storeIdx: number;
  skuIdx: number;
  lot: string;
  pct: number;
  at: string;
  by: string;
}

export interface RetailState {
  base: RetailBase;
  events: RetailEvent[];
  thresholds: Thresholds;
  /** current on-hand per store x sku (base + deltas) */
  onHand: (p: number) => number;
  dcOnHand: (dcIdx: number, k: number) => number;
  /** units arriving at a store (open POs + in-transit transfers) */
  inbound: (p: number) => number;
  /** units arriving at a DC from open POs */
  dcInbound: (dcIdx: number, k: number) => number;
  /** last-sale days for a pair (cleared once reconciled) */
  lastSale: (p: number) => number;
  pos: PurchaseOrder[];
  transfers: Transfer[];
  counts: CycleCount[];
  markdowns: Map<number, Markdown>;
  tickets: Ticket[];
  tasks: StoreTask[];
  alertStatus: Map<string, { status: string; at: string; by: string; note?: string }>;
  fixedPrices: Set<string>;
  version: number;
}

export function buildState(base: RetailBase, events: RetailEvent[]): RetailState {
  const ohDelta = new Map<number, number>();
  const dcDelta = new Map<number, number>();
  const inboundStore = new Map<number, number>();
  const inboundDc = new Map<number, number>();
  const lastSaleOverride = new Map<number, number>();
  const add = (m: Map<number, number>, key: number, v: number) => m.set(key, (m.get(key) ?? 0) + v);

  const thresholds: Thresholds = { ...DEFAULT_THRESHOLDS };
  const poStatus = new Map<string, PoStatus>();
  const poReceived = new Map<string, Map<number, number>>();
  const newPos: PurchaseOrder[] = [];
  const transfers = new Map<string, Transfer>();
  const counts = new Map<string, CycleCount>();
  const markdowns = new Map<number, Markdown>();
  const tickets = new Map(base.tickets.map((t) => [t.id, { ...t }]));
  const taskStatus = new Map<string, StoreTask["status"]>();
  const alertStatus = new Map<string, { status: string; at: string; by: string; note?: string }>();
  const fixedPrices = new Set<string>();

  const baseOh = (p: number) => base.onHand[p] + (ohDelta.get(p) ?? 0);
  const today = base.anchorDate;

  for (const e of events) {
    switch (e.type) {
      case "transfer_create":
        transfers.set(e.transferId, { id: e.transferId, skuIdx: e.skuIdx, from: e.from, toStore: e.toStore, qty: e.qty, reason: e.reason, status: "Requested", created: e.at, createdBy: e.user, alertId: e.alertId });
        break;
      case "transfer_approve": {
        const t = transfers.get(e.transferId);
        if (!t || t.status !== "Requested") break;
        t.status = "Approved · in transit";
        if (t.from.type === "store") add(ohDelta, t.from.idx * NSKU + t.skuIdx, -t.qty);
        else add(dcDelta, t.from.idx * NSKU + t.skuIdx, -t.qty);
        add(inboundStore, t.toStore * NSKU + t.skuIdx, t.qty);
        break;
      }
      case "transfer_receive": {
        const t = transfers.get(e.transferId);
        if (!t || t.status !== "Approved · in transit") break;
        t.status = "Received";
        const p = t.toStore * NSKU + t.skuIdx;
        add(inboundStore, p, -t.qty);
        add(ohDelta, p, t.qty);
        lastSaleOverride.set(p, 0);
        break;
      }
      case "transfer_cancel": {
        const t = transfers.get(e.transferId);
        if (t && t.status === "Requested") t.status = "Cancelled";
        break;
      }
      case "po_create":
        newPos.push({
          id: e.poId,
          supplierIdx: e.supplierIdx,
          destType: e.destType,
          destIdx: e.destIdx,
          created: e.at.slice(0, 10),
          promised: addDaysIso(today, e.leadDays),
          received: null,
          status: "Pending approval",
          lines: e.lines.map((l) => ({ skuIdx: l.skuIdx, ordered: l.qty, received: 0, unitCost: l.unitCost, invoicedQty: null, invoicedCost: null })),
          createdBy: e.user,
          grn: null,
          asn: null,
          flow: e.destType === "store" ? "Direct to store" : "Putaway",
        });
        break;
      case "po_approve":
        poStatus.set(e.poId, "Sent");
        break;
      case "po_receive": {
        const rec = poReceived.get(e.poId) ?? new Map<number, number>();
        for (const l of e.lines) rec.set(l.skuIdx, (rec.get(l.skuIdx) ?? 0) + l.qty);
        poReceived.set(e.poId, rec);
        break;
      }
      case "markdown":
        markdowns.set(e.storeIdx * NSKU + e.skuIdx, { storeIdx: e.storeIdx, skuIdx: e.skuIdx, lot: e.lot, pct: e.pct, at: e.at, by: e.user });
        break;
      case "count_start": {
        const p = e.storeIdx * NSKU + e.skuIdx;
        counts.set(e.countId, { id: e.countId, storeIdx: e.storeIdx, skuIdx: e.skuIdx, systemQty: baseOh(p), counted: null, status: "Counting", variance: null, created: e.at, createdBy: e.user });
        break;
      }
      case "count_complete": {
        const c = counts.get(e.countId);
        if (!c || c.status !== "Counting") break;
        const p = c.storeIdx * NSKU + c.skuIdx;
        const current = baseOh(p);
        c.counted = e.counted;
        c.variance = e.counted - current;
        c.status = "Reconciled";
        add(ohDelta, p, e.counted - current);
        lastSaleOverride.set(p, 0);
        break;
      }
      case "ticket_create":
        tickets.set(e.ticketId, { id: e.ticketId, equipmentId: e.equipmentId, storeIdx: e.storeIdx, issue: e.issue, priority: e.priority, status: "Open", technician: null, created: e.at.slice(0, 10), resolved: null });
        break;
      case "ticket_assign": {
        const t = tickets.get(e.ticketId);
        if (t) {
          t.technician = e.technician;
          if (t.status === "Open") t.status = "Assigned";
        }
        break;
      }
      case "ticket_status": {
        const t = tickets.get(e.ticketId);
        if (t) {
          t.status = e.status;
          if (e.status === "Resolved") t.resolved = e.at.slice(0, 10);
        }
        break;
      }
      case "alert_status":
        alertStatus.set(e.alertId, { status: e.status, at: e.at, by: e.user, note: e.note });
        break;
      case "task_status":
        taskStatus.set(e.taskId, e.status);
        break;
      case "price_fix":
        fixedPrices.add(e.exceptionId);
        break;
      case "thresholds":
        Object.assign(thresholds, e.values);
        break;
    }
  }

  // Purchase orders: base + created, with status overrides and receipts applied
  const pos: PurchaseOrder[] = [...base.pos, ...newPos].map((po) => {
    const status = poStatus.get(po.id) ?? po.status;
    const rec = poReceived.get(po.id);
    const lines = rec ? po.lines.map((l) => ({ ...l, received: l.received + (rec.get(l.skuIdx) ?? 0), invoicedQty: l.invoicedQty, invoicedCost: l.invoicedCost })) : po.lines;
    let finalStatus: PoStatus = status;
    if (rec) finalStatus = lines.every((l) => l.received >= l.ordered) ? "Received" : "Partially received";
    return { ...po, status: finalStatus, lines, received: rec ? today : po.received, grn: po.grn ?? (rec ? `GRN-${po.id.replace(/\D/g, "")}` : null) };
  });

  for (const po of pos) {
    const open = po.status === "Sent" || po.status === "Approved" || po.status === "Pending approval" || (po.status === "Partially received" && po.received === today);
    const rec = poReceived.get(po.id);
    for (const l of po.lines) {
      const key = po.destIdx * NSKU + l.skuIdx;
      // receipts from user events move stock in
      const r = rec?.get(l.skuIdx) ?? 0;
      if (r) {
        if (po.destType === "store") {
          add(ohDelta, key, r);
          lastSaleOverride.set(key, 0);
        } else add(dcDelta, key, r);
      }
      if (open && po.status !== "Pending approval") {
        const outstanding = Math.max(0, l.ordered - l.received);
        if (po.destType === "store") add(inboundStore, key, outstanding);
        else add(inboundDc, key, outstanding);
      }
    }
  }

  const tasks = base.tasks.map((t) => (taskStatus.has(t.id) ? { ...t, status: taskStatus.get(t.id)! } : t));

  return {
    base,
    events,
    thresholds,
    onHand: (p) => Math.max(0, base.onHand[p] + (ohDelta.get(p) ?? 0)),
    dcOnHand: (d, k) => Math.max(0, base.dcStock[d * NSKU + k] + (dcDelta.get(d * NSKU + k) ?? 0)),
    inbound: (p) => Math.max(0, inboundStore.get(p) ?? 0),
    dcInbound: (d, k) => Math.max(0, inboundDc.get(d * NSKU + k) ?? 0),
    lastSale: (p) => lastSaleOverride.get(p) ?? base.lastSaleDaysAgo[p],
    pos: pos.sort((a, b) => b.created.localeCompare(a.created)),
    transfers: Array.from(transfers.values()).reverse(),
    counts: Array.from(counts.values()).reverse(),
    markdowns,
    tickets: Array.from(tickets.values()).sort((a, b) => b.created.localeCompare(a.created)),
    tasks,
    alertStatus,
    fixedPrices,
    version: events.length,
  };
}

let seq = 0;
export function newId(prefix: string) {
  seq = (seq + 1) % 1000;
  return `${prefix}-${(Date.now() % 100000).toString().padStart(5, "0")}${String(seq).padStart(3, "0")}`;
}
