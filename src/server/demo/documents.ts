import { getIndustrialData, getRetailData } from "./data";
import type { DemoDataset } from "../../demo/data/types";
import { parseJsonLoose, sarvamChat } from "./sarvam";
import { matchRetail } from "./retailDocuments";

// ---------------------------------------------------------------------------
// Document Intelligence: LLM field extraction from OCR text, then deterministic
// three-way matching (invoice vs purchase order vs goods receipt) and duplicate
// detection. All comparisons are done in code, never by the model.
// ---------------------------------------------------------------------------

export interface ExtractedDoc {
  documentType: string;
  supplierName: string | null;
  supplierTrn: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  poNumber: string | null;
  paymentTerms: string | null;
  dueDate: string | null;
  currency: string | null;
  lineItems: Array<{ itemCode: string | null; description: string; quantity: number; unitPrice: number; amount: number }>;
  subtotal: number | null;
  vat: number | null;
  total: number | null;
}

export interface Check {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  detail: string;
}

export interface DocumentResult {
  extracted: ExtractedDoc;
  matchedPo: null | { id: string; supplier: string; item: string; quantity: number; unitPrice: number; orderDate: string; deliveredDate: string | null };
  checks: Check[];
  decision: "auto-approve" | "needs-approval" | "reject";
  summary: string;
  amountAtRisk: number;
}

const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) && v.trim() !== "" ? n : null;
  }
  return null;
};
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const money = (n: number) => "AED " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PROMPT = `Extract the fields from this supplier document. The text was produced by OCR, so fix obvious OCR spacing errors but never invent values.
Return ONLY JSON:
{
 "document_type": "invoice" | "purchase_order" | "delivery_note" | "contract" | "other",
 "supplier_name": string|null, "supplier_trn": string|null,
 "invoice_number": string|null, "invoice_date": "YYYY-MM-DD"|null,
 "po_number": string|null, "payment_terms": string|null, "due_date": "YYYY-MM-DD"|null,
 "currency": string|null,
 "line_items": [{"item_code": string|null, "description": string, "quantity": number, "unit_price": number, "amount": number}],
 "subtotal": number|null, "vat": number|null, "total": number|null
}
Use plain numbers without thousands separators.`;

export async function processDocument(ocrText: string, sector: "industrial" | "retail" = "industrial", token?: string): Promise<DocumentResult> {
  const text = String(ocrText || "").slice(0, 12000);
  if (text.trim().length < 20) throw new Error("Document text is empty. The OCR could not read the document.");

  const { message } = await sarvamChat({
    messages: [
      { role: "system", content: "You are a precise accounts-payable document extraction engine." },
      { role: "user", content: `${PROMPT}\n\nOCR TEXT:\n"""\n${text}\n"""` },
    ],
    json: true,
    maxTokens: 1200,
    temperature: 0,
  });
  const raw = parseJsonLoose<Record<string, any>>(message.content);
  if (!raw) throw new Error("Could not extract fields from this document. Please try again.");

  const extracted: ExtractedDoc = {
    documentType: str(raw.document_type) ?? "other",
    supplierName: str(raw.supplier_name),
    supplierTrn: str(raw.supplier_trn),
    invoiceNumber: str(raw.invoice_number),
    invoiceDate: str(raw.invoice_date),
    poNumber: str(raw.po_number)?.replace(/\s+/g, "") ?? null,
    paymentTerms: str(raw.payment_terms),
    dueDate: str(raw.due_date),
    currency: str(raw.currency),
    lineItems: (Array.isArray(raw.line_items) ? raw.line_items : []).slice(0, 30).map((l: any) => ({
      itemCode: str(l?.item_code)?.replace(/\s+/g, "") ?? null,
      description: String(l?.description ?? "").slice(0, 200),
      quantity: num(l?.quantity) ?? 0,
      unitPrice: num(l?.unit_price) ?? 0,
      amount: num(l?.amount) ?? 0,
    })),
    subtotal: num(raw.subtotal),
    vat: num(raw.vat),
    total: num(raw.total),
  };

  return { extracted, ...(sector === "retail" ? matchRetail(extracted, await getRetailData(token)) : match(extracted, await getIndustrialData(token))) };
}

function match(doc: ExtractedDoc, ds: DemoDataset): Omit<DocumentResult, "extracted"> {
  const checks: Check[] = [];
  const findings: string[] = [];
  let amountAtRisk = 0;

  // Arithmetic
  const lineSum = doc.lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const lineAmountsOk = doc.lineItems.every((l) => Math.abs(l.quantity * l.unitPrice - l.amount) < 0.05 * Math.max(1, l.amount) || l.amount === 0);
  const totalOk = doc.total !== null && doc.subtotal !== null && doc.vat !== null ? Math.abs(doc.subtotal + doc.vat - doc.total) < 1 : true;
  checks.push({
    id: "math",
    label: "Arithmetic & VAT",
    status: lineAmountsOk && totalOk ? "pass" : "fail",
    detail: lineAmountsOk && totalOk ? `Line totals and VAT add up to ${doc.total !== null ? money(doc.total) : money(lineSum)}.` : "Line amounts or totals do not add up.",
  });
  if (doc.subtotal !== null && doc.vat !== null && doc.subtotal > 0) {
    const rate = doc.vat / doc.subtotal;
    if (Math.abs(rate - 0.05) > 0.003) {
      checks.push({ id: "vat", label: "VAT rate", status: "warn", detail: `VAT charged at ${(rate * 100).toFixed(1)}% instead of the standard 5%.` });
      findings.push(`VAT is charged at ${(rate * 100).toFixed(1)}% instead of 5%.`);
    }
  }

  // Duplicate detection
  const sup = ds.suppliers.find((s) => doc.supplierName && s.name.toLowerCase() === doc.supplierName.toLowerCase()) ??
    ds.suppliers.find((s) => doc.supplierName && doc.supplierName.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]));
  const dup = ds.invoices.find((i) => doc.invoiceNumber && i.number.toLowerCase() === doc.invoiceNumber.toLowerCase());
  const dupByAmount = !dup && sup && doc.total !== null ? ds.invoices.find((i) => i.supplierId === sup.id && Math.abs(i.total - doc.total!) < 0.5) : undefined;
  if (dup) {
    checks.push({ id: "dup", label: "Duplicate check", status: "fail", detail: `Invoice ${dup.number} was already received on ${dup.date} (${money(dup.total)}, status: ${dup.status}).` });
    findings.push(`This invoice number was already processed on ${dup.date} and is marked ${dup.status.toLowerCase()}, so paying it again would be a duplicate payment of ${money(dup.total)}.`);
    amountAtRisk += dup.total;
  } else if (dupByAmount) {
    checks.push({ id: "dup", label: "Duplicate check", status: "warn", detail: `Same supplier and amount as invoice ${dupByAmount.number} (${dupByAmount.date}).` });
    findings.push(`The amount matches invoice ${dupByAmount.number} from the same supplier; check it is not a resubmission.`);
  } else {
    checks.push({ id: "dup", label: "Duplicate check", status: "pass", detail: "No previous invoice with this number or amount." });
  }

  // PO match
  const po = doc.poNumber ? ds.purchaseOrders.find((p) => p.id.toLowerCase() === doc.poNumber!.toLowerCase()) : undefined;
  let matchedPo: DocumentResult["matchedPo"] = null;
  if (!po) {
    checks.push({ id: "po", label: "Purchase order", status: "fail", detail: doc.poNumber ? `PO ${doc.poNumber} was not found.` : "No PO number on the document." });
    findings.push(doc.poNumber ? `PO ${doc.poNumber} does not exist in the system.` : "The document does not reference a purchase order.");
  } else {
    const poSup = ds.suppliers.find((s) => s.id === po.supplierId)!;
    const poItem = ds.items.find((i) => i.id === po.itemId)!;
    matchedPo = { id: po.id, supplier: poSup.name, item: poItem.name, quantity: po.quantity, unitPrice: po.unitPrice, orderDate: po.orderDate, deliveredDate: po.deliveredDate };
    checks.push({ id: "po", label: "Purchase order", status: "pass", detail: `Matched ${po.id} raised on ${po.orderDate}.` });

    const supOk = sup?.id === po.supplierId;
    checks.push({
      id: "supplier",
      label: "Supplier",
      status: supOk ? "pass" : "fail",
      detail: supOk ? `${poSup.name} matches the PO.` : `Invoice supplier "${doc.supplierName ?? "unknown"}" differs from PO supplier ${poSup.name}.`,
    });
    if (!supOk) findings.push(`The supplier on the invoice does not match the PO supplier (${poSup.name}).`);

    const line = doc.lineItems.find((l) => l.itemCode && l.itemCode.toLowerCase() === po.itemId.toLowerCase()) ?? doc.lineItems[0];
    if (line) {
      const qtyDiff = line.quantity - po.quantity;
      checks.push({
        id: "qty",
        label: "Quantity vs PO",
        status: qtyDiff === 0 ? "pass" : "fail",
        detail: qtyDiff === 0 ? `${line.quantity} units, as ordered.` : `Invoiced ${line.quantity} units; PO specifies ${po.quantity} (${qtyDiff > 0 ? "+" : ""}${qtyDiff}).`,
      });
      if (qtyDiff !== 0) findings.push(`The invoice quantity is ${line.quantity} units, while the purchase order specifies ${po.quantity} units.`);

      const received = po.deliveredDate ? po.quantity : 0;
      checks.push({
        id: "grn",
        label: "Goods received",
        status: !po.deliveredDate ? "fail" : line.quantity <= received ? "pass" : "fail",
        detail: !po.deliveredDate ? "No goods receipt recorded yet." : line.quantity <= received ? `${received} units received on ${po.deliveredDate}.` : `Only ${received} units were received on ${po.deliveredDate}.`,
      });
      if (po.deliveredDate && line.quantity > received) findings.push(`Only ${received} units were received, so ${line.quantity - received} invoiced units have no goods receipt.`);
      if (!po.deliveredDate) findings.push("No goods receipt has been recorded for this order yet.");

      const priceDiff = (line.unitPrice - po.unitPrice) / po.unitPrice;
      const priceOk = Math.abs(priceDiff) <= 0.01;
      checks.push({
        id: "price",
        label: "Unit price vs PO",
        status: priceOk ? "pass" : Math.abs(priceDiff) <= 0.03 ? "warn" : "fail",
        detail: priceOk ? `${money(line.unitPrice)} matches the agreed price.` : `${money(line.unitPrice)} vs agreed ${money(po.unitPrice)} (${priceDiff > 0 ? "+" : ""}${(priceDiff * 100).toFixed(1)}%).`,
      });
      if (!priceOk) findings.push(`The unit price is ${Math.abs(priceDiff * 100).toFixed(0)}% ${priceDiff > 0 ? "higher" : "lower"} than the agreed price.`);

      if (!dup) {
        const allowed = Math.min(line.quantity, po.deliveredDate ? po.quantity : 0) * po.unitPrice;
        amountAtRisk += Math.max(0, line.quantity * line.unitPrice - allowed) * 1.05;
      }
    }
  }

  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const decision: DocumentResult["decision"] = dup ? "reject" : fails ? "needs-approval" : warns ? "needs-approval" : "auto-approve";
  const summary = findings.length
    ? findings.join(" ") + (amountAtRisk > 0 ? ` Amount at risk: ${money(amountAtRisk)}.` : "")
    : `The invoice matches ${po?.id ?? "the purchase order"} on supplier, quantity, price and goods receipt. It can be approved for payment.`;

  return { matchedPo, checks, decision, summary, amountAtRisk: Math.round(amountAtRisk * 100) / 100 };
}
