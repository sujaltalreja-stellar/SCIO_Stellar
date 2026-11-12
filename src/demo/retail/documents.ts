import type { InvoiceDoc } from "../data/documents";
import type { PurchaseOrder, RetailBase } from "./model";
import { addDaysIso, h } from "./generate";

// Retail supplier invoices for the Documents inbox, built from real retail POs.

const ADDR: Record<string, string[]> = {
  UAE: ["Al Quoz Industrial Area 4", "Dubai, United Arab Emirates"],
  "Saudi Arabia": ["2nd Industrial City", "Riyadh, Saudi Arabia"],
  Jordan: ["King Abdullah II Industrial Estate", "Amman, Jordan"],
  Egypt: ["10th of Ramadan City", "Sharqia, Egypt"],
  India: ["MIDC Taloja", "Navi Mumbai, India"],
  "Türkiye": ["OSB 3. Cadde No:14", "Gaziantep, Türkiye"],
  Spain: ["Polígono Industrial Sur", "Sevilla, Spain"],
  Singapore: ["15 Tuas Avenue 2", "Singapore"],
  Kuwait: ["Shuwaikh Industrial", "Kuwait City, Kuwait"],
  Oman: ["Rusayl Industrial Estate", "Muscat, Oman"],
  Qatar: ["Street 24, Industrial Area", "Doha, Qatar"],
  Bahrain: ["Sitra Industrial Area", "Sitra, Bahrain"],
};

export function invoiceNumberFor(base: RetailBase, po: PurchaseOrder) {
  const sup = base.suppliers[po.supplierIdx];
  const prefix = sup.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return `${prefix}-INV-${po.id.slice(3)}`;
}

const trn = (seed: number) => "1003" + Array.from({ length: 11 }, (_, i) => Math.floor(h(seed, i, 909) * 10)).join("");

function toDoc(base: RetailBase, po: PurchaseOrder, id: string, channel: InvoiceDoc["channel"], receivedAt: string, mutate?: (l: InvoiceDoc["lines"][number]) => InvoiceDoc["lines"][number], number?: string): InvoiceDoc {
  const sup = base.suppliers[po.supplierIdx];
  const lines = po.lines.slice(0, 5).map((l) => {
    const sku = base.skus[l.skuIdx];
    const line = { sku: sku.id, description: sku.name.length > 34 ? sku.name.slice(0, 33) + "…" : sku.name, quantity: l.received || l.ordered, unitPrice: l.unitCost };
    return mutate ? mutate(line) : line;
  });
  const date = po.received ?? addDaysIso(base.anchorDate, -1);
  return {
    id,
    receivedAt,
    channel,
    supplier: { name: sup.name, address: ADDR[sup.country] ?? ["Industrial Area", sup.country], trn: trn(po.supplierIdx) },
    number: number ?? invoiceNumberFor(base, po),
    date,
    poNumber: po.id,
    paymentTerms: "Net 45 days",
    dueDate: addDaysIso(date, 45),
    lines,
    vatRate: 0.05,
  };
}

export function buildRetailInbox(base: RetailBase): InvoiceDoc[] {
  const received = base.pos.filter((p) => p.received && p.status === "Received" && p.lines.length >= 2);
  const recent = received.filter((p) => p.received! >= addDaysIso(base.anchorDate, -6));
  const old = received.filter((p) => p.received! < addDaysIso(base.anchorDate, -20));
  const over = recent[0] ?? received[0];
  const clean = recent.find((p) => p.id !== over.id && p.supplierIdx !== over.supplierIdx) ?? received[1];
  const dup = old[3] ?? received[2];
  let first = true;
  return [
    toDoc(base, over, "rdoc-1", "Email", `${base.anchorDate}T07:48:00Z`, (l) => {
      if (!first) return l;
      first = false;
      return { ...l, quantity: Math.round(l.quantity * 1.2), unitPrice: Math.round(l.unitPrice * 1.08 * 100) / 100 };
    }),
    toDoc(base, clean, "rdoc-2", "Supplier portal", `${base.anchorDate}T09:15:00Z`),
    toDoc(base, dup, "rdoc-3", "Scan", `${base.anchorDate}T10:02:00Z`),
  ];
}
