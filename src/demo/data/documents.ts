import { createRng } from "./rng";
import type { DemoDataset } from "./types";

// ---------------------------------------------------------------------------
// Incoming supplier documents for the Documents inbox. Built from real POs and
// invoice history in the dataset, then rendered to an image so they go through
// the full OCR -> extraction -> matching pipeline.
// ---------------------------------------------------------------------------

export interface InvoiceDoc {
  id: string;
  receivedAt: string;
  channel: "Email" | "Supplier portal" | "Scan";
  supplier: { name: string; address: string[]; trn: string };
  number: string;
  date: string;
  poNumber: string;
  paymentTerms: string;
  dueDate: string;
  lines: Array<{ sku: string; description: string; quantity: number; unitPrice: number }>;
  vatRate: number;
}

const ADDRESSES: Record<string, string[]> = {
  UAE: ["Plot 14, Jebel Ali Free Zone", "Dubai, United Arab Emirates"],
  "Saudi Arabia": ["2nd Industrial City, Street 72", "Riyadh 14332, Saudi Arabia"],
  Sweden: ["Industrigatan 18", "415 05 Göteborg, Sweden"],
  Qatar: ["Street 31, Industrial Area", "Doha, Qatar"],
  Germany: ["Gewerbestraße 9", "47805 Krefeld, Germany"],
  Oman: ["Rusayl Industrial Estate", "Muscat, Oman"],
  India: ["MIDC Bhosari, Plot J-112", "Pune 411026, India"],
  Singapore: ["21 Tuas Avenue 7", "Singapore 639278"],
  Turkey: ["OSB 4. Cadde No:22", "Bursa, Türkiye"],
  Japan: ["2-4-11 Shinyokohama", "Yokohama, Japan"],
  Kuwait: ["Shuwaikh Industrial Area, Block 2", "Kuwait City, Kuwait"],
  Italy: ["Via dell'Industria 41", "20871 Vimercate (MB), Italy"],
  Bahrain: ["Bahrain International Investment Park", "Hidd, Bahrain"],
  Egypt: ["10th of Ramadan City, Zone A3", "Sharqia, Egypt"],
};

const addDays = (iso: string, d: number) => new Date(new Date(iso + "T00:00:00Z").getTime() + d * 86_400_000).toISOString().slice(0, 10);

export function buildInbox(ds: DemoDataset): InvoiceDoc[] {
  const rng = createRng(4242);
  const invoiced = new Set(ds.invoices.map((i) => i.poId));
  const recent = ds.purchaseOrders.filter((p) => p.deliveredDate && !invoiced.has(p.id));
  const sup = (id: string) => ds.suppliers.find((s) => s.id === id)!;
  const item = (id: string) => ds.items.find((i) => i.id === id)!;
  const trn = () => "1003" + Array.from({ length: 11 }, () => rng.int(0, 9)).join("");
  const supplierBlock = (id: string) => {
    const s = sup(id);
    return { name: s.name, address: ADDRESSES[s.country] ?? ["Industrial Area", s.country], trn: trn() };
  };

  // 1) Over-billed: quantity +20% and unit price +8% vs the PO.
  const overPo = recent.find((p) => p.quantity >= 20 && sup(p.supplierId).country !== "UAE") ?? recent[0];
  // 2) Clean: a delivered PO with no invoice mismatch.
  const cleanPo = recent.find((p) => p.id !== overPo.id && p.supplierId !== overPo.supplierId && p.quantity >= 5) ?? recent[1];
  // 3) Duplicate: an invoice already approved/paid, re-sent by the supplier.
  const dupInv = ds.invoices.filter((i) => i.poId !== overPo.id && i.poId !== cleanPo.id).slice(-12)[3] ?? ds.invoices[ds.invoices.length - 1];
  const dupPo = ds.purchaseOrders.find((p) => p.id === dupInv.poId)!;

  const nextNumber = (supplierId: string) => {
    const nums = ds.invoices.filter((i) => i.supplierId === supplierId).map((i) => i.number);
    const last = nums[nums.length - 1] ?? "INV-1000";
    const m = last.match(/^(.*-)(\d+)$/);
    return m ? `${m[1]}${Number(m[2]) + rng.int(2, 6)}` : `INV-${rng.int(2000, 9000)}`;
  };

  const docs: InvoiceDoc[] = [
    {
      id: "doc-1",
      receivedAt: `${ds.anchorDate}T08:14:00Z`,
      channel: "Email",
      supplier: supplierBlock(overPo.supplierId),
      number: nextNumber(overPo.supplierId),
      date: addDays(ds.anchorDate, -1),
      poNumber: overPo.id,
      paymentTerms: "Net 30 days",
      dueDate: addDays(ds.anchorDate, 29),
      lines: [
        {
          sku: overPo.itemId,
          description: item(overPo.itemId).name,
          quantity: Math.round(overPo.quantity * 1.2),
          unitPrice: Math.round(overPo.unitPrice * 1.08 * 100) / 100,
        },
      ],
      vatRate: 0.05,
    },
    {
      id: "doc-2",
      receivedAt: `${ds.anchorDate}T09:02:00Z`,
      channel: "Supplier portal",
      supplier: supplierBlock(cleanPo.supplierId),
      number: nextNumber(cleanPo.supplierId),
      date: addDays(ds.anchorDate, -2),
      poNumber: cleanPo.id,
      paymentTerms: "Net 45 days",
      dueDate: addDays(ds.anchorDate, 43),
      lines: [{ sku: cleanPo.itemId, description: item(cleanPo.itemId).name, quantity: cleanPo.quantity, unitPrice: cleanPo.unitPrice }],
      vatRate: 0.05,
    },
    {
      id: "doc-3",
      receivedAt: `${ds.anchorDate}T10:37:00Z`,
      channel: "Scan",
      supplier: supplierBlock(dupInv.supplierId),
      number: dupInv.number,
      date: dupInv.date,
      poNumber: dupInv.poId,
      paymentTerms: "Net 30 days",
      dueDate: addDays(dupInv.date, 30),
      lines: [{ sku: dupPo.itemId, description: item(dupPo.itemId).name, quantity: dupInv.quantity, unitPrice: dupInv.unitPrice }],
      vatRate: 0.05,
    },
  ];
  return docs;
}

export function invoiceTotals(doc: InvoiceDoc) {
  const subtotal = doc.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const vat = Math.round(subtotal * doc.vatRate * 100) / 100;
  return { subtotal: Math.round(subtotal * 100) / 100, vat, total: Math.round((subtotal + vat) * 100) / 100 };
}
