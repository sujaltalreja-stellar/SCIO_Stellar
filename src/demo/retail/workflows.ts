import { useApproval } from "../components/Approval";
import { useRetail } from "./RetailContext";
import { NSKU, TECHNICIANS } from "./generate";
import { newId } from "./state";
import { available, type EquipmentIssue, type ExpiryRow, type PhantomRow, type StockoutRisk, type SupplierDelay } from "./analytics";
import type { PurchaseOrder } from "./model";
import { aed, nf } from "./rui";

// ---------------------------------------------------------------------------
// End-to-end workflows. Each one asks for approval, then records audited
// events; KPIs and alerts recalculate automatically from the event log.
// ---------------------------------------------------------------------------

export function useWorkflows() {
  const { state, dispatch, can } = useRetail();
  const { request } = useApproval();
  const { base } = state;
  const storeName = (s: number) => `${base.stores[s].id} ${base.stores[s].name}`;
  const locName = (l: { type: "store" | "dc"; idx: number }) => (l.type === "store" ? storeName(l.idx) : base.dcs[l.idx].name);

  /** 1. Stockout -> inter-store / DC transfer */
  const transferForStockout = async (r: StockoutRisk) => {
    if (!r.donor) return;
    const sku = base.skus[r.skuIdx];
    const qty = r.donor.qty;
    const rec = await request({
      kind: "Stock transfer",
      title: sku.name,
      lines: [
        ["From", locName(r.donor)],
        ["To", storeName(r.storeIdx)],
        ["Quantity", `${nf(qty, 1)} ${sku.baseUom}`],
        ["Source after transfer", r.donor.type === "store" ? `${nf(r.donor.available - qty)} units (${nf((r.donor.available - qty) / Math.max(0.05, base.velocity[r.donor.idx * NSKU + r.skuIdx]))} days cover)` : `${nf(r.donor.available - qty)} units in DC`],
        ["Destination cover after receipt", `${nf((r.available + qty) / r.velocity, 1)} days`],
        ["Lost sales avoided", `${aed(r.lostSalesPerDay * Math.min(7, (r.available + qty) / r.velocity))} next 7 days`],
      ],
      note: can("transfer.approve") ? "The transfer is approved and dispatched. Receive it at the destination store to update shelf stock." : "Your role can request but not approve transfers; it will wait for a regional or inventory manager.",
      confirmLabel: can("transfer.approve") ? "Approve & dispatch" : "Request transfer",
      silent: true,
    });
    if (!rec) return;
    const transferId = newId("TRF");
    dispatch({ type: "transfer_create", transferId, skuIdx: r.skuIdx, from: { type: r.donor.type, idx: r.donor.idx }, toStore: r.storeIdx, qty, reason: "Stockout risk", alertId: r.id });
    if (can("transfer.approve")) dispatch({ type: "transfer_approve", transferId });
    return transferId;
  };

  const approveTransfer = (id: string) => dispatch({ type: "transfer_approve", transferId: id }, `Transfer ${id} approved and dispatched`);
  const receiveTransfer = (id: string) => dispatch({ type: "transfer_receive", transferId: id }, `Transfer ${id} received · shelf stock updated`);
  const cancelTransfer = (id: string) => dispatch({ type: "transfer_cancel", transferId: id }, `Transfer ${id} cancelled`);

  /** 2. Supplier delay -> alternative replenishment */
  const alternativeReplenishment = async (d: SupplierDelay) => {
    const po = state.pos.find((p) => p.id === d.poId)!;
    const sup = base.suppliers[d.supplierIdx];
    // Option A: transfer from another DC that has stock. Option B: order from alternative supplier.
    const plan = po.lines.map((l) => {
      const sku = base.skus[l.skuIdx];
      const outstanding = l.ordered - l.received;
      let dcAlt: number | null = null;
      if (po.destType === "dc") {
        for (const dc of base.dcs) {
          if (dc.idx === po.destIdx || dc.country !== base.dcs[po.destIdx].country) continue;
          if (state.dcOnHand(dc.idx, l.skuIdx) > outstanding * 1.5) dcAlt = dc.idx;
        }
      }
      return { l, sku, outstanding, dcAlt, altSupplier: sku.altSupplierIdx };
    });
    const altSup = base.suppliers[plan[0].altSupplier];
    const fromDc = plan.filter((p) => p.dcAlt !== null);
    const fromSupplier = plan.filter((p) => p.dcAlt === null);
    const rec = await request({
      kind: "Replenishment action",
      title: `Cover late ${po.id} from ${sup.name}`,
      lines: [
        ["Delay", `${d.daysLate} days past promised date`],
        ["Affected stores", d.affectedStores.length ? d.affectedStores.slice(0, 4).map((s) => base.stores[s].id).join(", ") + (d.affectedStores.length > 4 ? "…" : "") : "None low yet"],
        ["Rebalance from sister DC", fromDc.length ? `${fromDc.length} SKU(s)` : "No surplus available"],
        ["Emergency PO", fromSupplier.length ? `${fromSupplier.length} SKU(s) to ${altSup.name} (lead ${altSup.leadTimeDays} d)` : "Not needed"],
        ["Value", aed(d.value)],
      ],
      note: "The late PO stays open; the supplier is flagged for performance review.",
      confirmLabel: "Create actions",
      silent: true,
    });
    if (!rec) return;
    for (const p of fromDc) {
      const transferId = newId("TRF");
      dispatch({ type: "transfer_create", transferId, skuIdx: p.l.skuIdx, from: { type: "dc", idx: p.dcAlt! }, toStore: d.affectedStores[0] ?? base.stores.find((s) => s.dcIdx === po.destIdx)!.idx, qty: Math.ceil(p.outstanding / 4), reason: `Supplier delay ${po.id}`, alertId: d.id });
      if (can("transfer.approve")) dispatch({ type: "transfer_approve", transferId });
    }
    if (fromSupplier.length) {
      const poId = `PO-${70000 + Math.floor(Math.random() * 9999)}`;
      dispatch({
        type: "po_create",
        poId,
        supplierIdx: altSup.idx,
        destType: po.destType,
        destIdx: po.destIdx,
        lines: fromSupplier.map((p) => ({ skuIdx: p.l.skuIdx, qty: Math.ceil(p.outstanding * 0.6), unitCost: p.sku.cost })),
        reason: `Alternative supply for late ${po.id}`,
        leadDays: altSup.leadTimeDays,
        alertId: d.id,
      });
      if (can("po.approve")) dispatch({ type: "po_approve", poId });
    }
    dispatch({ type: "alert_status", alertId: d.id, status: "acknowledged", note: `Alternative replenishment created (${rec.ref})` }, "Alternative replenishment created");
  };

  /** 3. Expiry -> markdown or transfer */
  const markdownExpiry = async (x: ExpiryRow, pct = state.thresholds.markdownPct) => {
    const sku = base.skus[x.skuIdx];
    const rec = await request({
      kind: "Markdown",
      title: `${sku.name} · lot ${x.lot}`,
      lines: [
        ["Store", storeName(x.storeIdx)],
        ["Expires", `${x.expiry} (${x.daysLeft} days)`],
        ["Units in lot", nf(x.qty)],
        ["Expected to sell at full price", nf(x.expectedToSell)],
        ["Markdown", `${pct}% off · expected sell-through uplift ×${(1 + (pct / 100) * 3).toFixed(1)}`],
        ["Write-off avoided", aed(Math.min(x.atRiskValue, x.qty * sku.cost))],
      ],
      confirmLabel: `Apply ${pct}% markdown`,
      silent: true,
    });
    if (!rec) return;
    dispatch({ type: "markdown", storeIdx: x.storeIdx, skuIdx: x.skuIdx, lot: x.lot, pct, alertId: x.id });
  };

  const transferExpiry = async (x: ExpiryRow) => {
    if (x.transferTo === null) return;
    const sku = base.skus[x.skuIdx];
    const qty = Math.max(1, Math.min(x.atRiskUnits, Math.floor(x.qty * 0.6)));
    const rec = await request({
      kind: "Stock transfer",
      title: `${sku.name} · lot ${x.lot}`,
      lines: [
        ["From", storeName(x.storeIdx)],
        ["To (sells faster)", storeName(x.transferTo)],
        ["Quantity", `${nf(qty)} ${sku.baseUom}`],
        ["Expires", `${x.expiry} (${x.daysLeft} days)`],
      ],
      confirmLabel: "Approve transfer",
      silent: true,
    });
    if (!rec) return;
    const transferId = newId("TRF");
    dispatch({ type: "transfer_create", transferId, skuIdx: x.skuIdx, from: { type: "store", idx: x.storeIdx }, toStore: x.transferTo, qty, reason: "Expiry prevention", alertId: x.id });
    if (can("transfer.approve")) dispatch({ type: "transfer_approve", transferId });
    dispatch({ type: "markdown", storeIdx: x.storeIdx, skuIdx: x.skuIdx, lot: x.lot, pct: 0, alertId: x.id });
  };

  /** 4. Discrepancy -> cycle count -> reconcile */
  const startCount = (r: Pick<PhantomRow, "storeIdx" | "skuIdx" | "id">) => {
    const countId = newId("CC");
    dispatch({ type: "count_start", countId, storeIdx: r.storeIdx, skuIdx: r.skuIdx, alertId: r.id }, `Cycle count ${countId} issued to ${base.stores[r.storeIdx].id}`);
    return countId;
  };
  const completeCount = (countId: string, counted: number) => {
    const c = state.counts.find((x) => x.id === countId);
    dispatch({ type: "count_complete", countId, counted }, `Count reconciled · variance ${c ? nf(counted - state.onHand(c.storeIdx * NSKU + c.skuIdx)) : ""}`);
  };

  /** 5. Equipment issue -> ticket -> technician -> resolve */
  const createTicket = async (e: EquipmentIssue) => {
    const tech = TECHNICIANS.find((t) => (e.equipment.type === "POS Terminal" ? t.includes("POS") : e.equipment.type === "HVAC" ? t.includes("HVAC") : e.equipment.type === "Generator" ? t.includes("Generator") : t.includes("Cold") || t.includes("Refrigeration"))) ?? TECHNICIANS[0];
    const priority = e.severity === "critical" ? "P1" : "P2";
    const rec = await request({
      kind: "Maintenance ticket",
      title: `${e.equipment.type} ${e.equipment.id}`,
      lines: [
        ["Store", storeName(e.storeIdx)],
        ["Issue", e.equipment.fault!.kind],
        ["Latest reading", `${e.latest} ${e.equipment.unit}${e.equipment.setpoint !== null ? ` (setpoint ${e.equipment.setpoint})` : ""}`],
        ["Priority", priority === "P1" ? "P1 · respond within 4 hours" : "P2 · respond within 24 hours"],
        ["Suggested technician", tech],
        ...(e.stockAtRiskValue ? ([["Stock at risk", aed(e.stockAtRiskValue)]] as Array<[string, string]>) : []),
      ],
      note: e.equipment.type === "Freezer" || e.equipment.type === "Chiller" ? "Store team is asked to move product to a working unit while the technician is on the way." : undefined,
      confirmLabel: "Create & assign",
      silent: true,
    });
    if (!rec) return;
    const ticketId = newId("TKT");
    dispatch({ type: "ticket_create", ticketId, equipmentId: e.equipment.id, storeIdx: e.storeIdx, issue: e.equipment.fault!.kind, priority, alertId: e.id });
    if (can("ticket.assign")) dispatch({ type: "ticket_assign", ticketId, technician: tech });
  };
  const assignTicket = (ticketId: string, technician: string) => dispatch({ type: "ticket_assign", ticketId, technician }, `${ticketId} assigned to ${technician}`);
  const setTicketStatus = (ticketId: string, status: "In progress" | "Resolved") => dispatch({ type: "ticket_status", ticketId, status }, `${ticketId} ${status.toLowerCase()}`);

  /** Purchase orders */
  const createPo = async (input: { supplierIdx: number; destType: "dc" | "store"; destIdx: number; lines: Array<{ skuIdx: number; qty: number }>; reason: string }) => {
    const sup = base.suppliers[input.supplierIdx];
    const value = input.lines.reduce((s, l) => s + l.qty * base.skus[l.skuIdx].cost, 0);
    const rec = await request({
      kind: "Purchase order",
      title: `${sup.name} · ${input.lines.length} line(s)`,
      lines: [
        ["Deliver to", input.destType === "dc" ? base.dcs[input.destIdx].name : storeName(input.destIdx)],
        ["Lines", input.lines.map((l) => `${base.skus[l.skuIdx].id} × ${nf(l.qty)}`).slice(0, 4).join(", ") + (input.lines.length > 4 ? "…" : "")],
        ["Order value", aed(value, false)],
        ["Lead time", `${sup.leadTimeDays} days`],
        ["Reason", input.reason],
      ],
      confirmLabel: can("po.approve") ? "Create & approve PO" : "Submit for approval",
      silent: true,
    });
    if (!rec) return;
    const poId = `PO-${70000 + Math.floor(Math.random() * 9999)}`;
    dispatch({ type: "po_create", poId, supplierIdx: input.supplierIdx, destType: input.destType, destIdx: input.destIdx, lines: input.lines.map((l) => ({ ...l, unitCost: base.skus[l.skuIdx].cost })), reason: input.reason, leadDays: sup.leadTimeDays });
    if (can("po.approve")) dispatch({ type: "po_approve", poId });
    return poId;
  };
  const approvePo = (poId: string) => dispatch({ type: "po_approve", poId }, `${poId} approved and sent to supplier`);
  const receivePo = (po: PurchaseOrder, qty: Record<number, number>) =>
    dispatch({ type: "po_receive", poId: po.id, lines: Object.entries(qty).filter(([, q]) => q > 0).map(([k, q]) => ({ skuIdx: Number(k), qty: q })) }, `${po.id} received · stock updated`);

  const setAlert = (alertId: string, status: "acknowledged" | "resolved" | "dismissed", note?: string) => dispatch({ type: "alert_status", alertId, status, note }, `Alert ${status}`);

  return {
    transferForStockout,
    approveTransfer,
    receiveTransfer,
    cancelTransfer,
    alternativeReplenishment,
    markdownExpiry,
    transferExpiry,
    startCount,
    completeCount,
    createTicket,
    assignTicket,
    setTicketStatus,
    createPo,
    approvePo,
    receivePo,
    setAlert,
    available: (p: number) => available(state, p),
  };
}
