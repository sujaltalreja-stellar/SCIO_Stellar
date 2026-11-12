import { invoiceNumberFor } from "../../demo/retail/documents";
import type { Check, DocumentResult, ExtractedDoc } from "./documents";
import type { RetailBase } from "../../demo/retail/model";

// Retail three-way match: invoice vs purchase order vs goods receipt, line by line.
const money = (n: number) => "AED " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function matchRetail(doc: ExtractedDoc, base: RetailBase): Omit<DocumentResult, "extracted"> {
  const checks: Check[] = [];
  const findings: string[] = [];
  let amountAtRisk = 0;

  const lineSum = doc.lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const mathOk = doc.lineItems.every((l) => !l.amount || Math.abs(l.quantity * l.unitPrice - l.amount) < 0.05 * Math.max(1, l.amount)) && (doc.total === null || doc.subtotal === null || doc.vat === null || Math.abs(doc.subtotal + doc.vat - doc.total) < 1);
  checks.push({ id: "math", label: "Arithmetic & VAT", status: mathOk ? "pass" : "fail", detail: mathOk ? `Lines and VAT add up to ${money(doc.total ?? lineSum)}.` : "Line amounts or totals do not add up." });

  const po = doc.poNumber ? base.pos.find((p) => p.id.toLowerCase() === doc.poNumber!.toLowerCase()) : undefined;
  // Duplicate: invoice number already issued for a PO received more than 10 days ago (treated as paid)
  const dupPo = doc.invoiceNumber ? base.pos.find((p) => p.received && p.received < base.anchorDate && invoiceNumberFor(base, p).toLowerCase() === doc.invoiceNumber!.toLowerCase()) : undefined;
  const paidDate = dupPo?.received ?? null;
  const isDup = !!dupPo && !!paidDate && new Date(base.anchorDate).getTime() - new Date(paidDate).getTime() > 10 * 86_400_000;
  if (isDup) {
    const total = doc.total ?? lineSum * 1.05;
    checks.push({ id: "dup", label: "Duplicate check", status: "fail", detail: `Invoice ${doc.invoiceNumber} was already posted for ${dupPo!.id} after receipt on ${paidDate} and has been paid.` });
    findings.push(`This invoice number was already processed and paid for ${dupPo!.id}; paying it again would be a duplicate payment of ${money(total)}.`);
    amountAtRisk += total;
  } else checks.push({ id: "dup", label: "Duplicate check", status: "pass", detail: "No previously paid invoice with this number." });

  let matchedPo: DocumentResult["matchedPo"] = null;
  if (!po) {
    checks.push({ id: "po", label: "Purchase order", status: "fail", detail: doc.poNumber ? `PO ${doc.poNumber} was not found.` : "No PO number on the document." });
    findings.push("The invoice does not match an existing purchase order.");
  } else {
    const sup = base.suppliers[po.supplierIdx];
    const first = po.lines[0];
    matchedPo = { id: po.id, supplier: sup.name, item: `${po.lines.length} lines`, quantity: first.ordered, unitPrice: first.unitCost, orderDate: po.created, deliveredDate: po.received };
    checks.push({ id: "po", label: "Purchase order", status: "pass", detail: `Matched ${po.id} (${po.lines.length} lines) raised on ${po.created}.` });
    const supOk = !!doc.supplierName && doc.supplierName.toLowerCase().includes(sup.name.toLowerCase().split(" ")[0]);
    checks.push({ id: "supplier", label: "Supplier", status: supOk ? "pass" : "fail", detail: supOk ? `${sup.name} matches the PO.` : `Invoice supplier differs from PO supplier ${sup.name}.` });

    let qtyIssues = 0;
    let priceIssues = 0;
    let grnIssues = 0;
    for (const l of doc.lineItems) {
      const poLine = po.lines.find((x) => base.skus[x.skuIdx].id.toLowerCase() === (l.itemCode ?? "").toLowerCase()) ?? po.lines.find((x) => base.skus[x.skuIdx].name.toLowerCase().startsWith(l.description.toLowerCase().replace("…", "").slice(0, 18)));
      if (!poLine) continue;
      const sku = base.skus[poLine.skuIdx];
      if (l.quantity > poLine.ordered) {
        qtyIssues++;
        findings.push(`${sku.id}: invoice quantity is ${l.quantity}, while the purchase order specifies ${poLine.ordered}.`);
      }
      if (l.quantity > poLine.received) {
        grnIssues++;
        findings.push(`${sku.id}: only ${poLine.received} received, ${l.quantity - poLine.received} invoiced units have no goods receipt.`);
      }
      const diff = (l.unitPrice - poLine.unitCost) / poLine.unitCost;
      if (diff > 0.01) {
        priceIssues++;
        findings.push(`${sku.id}: unit price is ${(diff * 100).toFixed(0)}% higher than the agreed price.`);
      }
      if (!isDup) amountAtRisk += Math.max(0, l.quantity * l.unitPrice - Math.min(l.quantity, poLine.received) * poLine.unitCost) * 1.05;
    }
    checks.push({ id: "qty", label: "Quantity vs PO", status: qtyIssues ? "fail" : "pass", detail: qtyIssues ? `${qtyIssues} line(s) invoiced above the ordered quantity.` : "All lines within ordered quantity." });
    checks.push({ id: "grn", label: "Goods received", status: grnIssues ? "fail" : "pass", detail: grnIssues ? `${grnIssues} line(s) invoiced above the goods receipt.` : `Goods receipt posted ${po.received ?? "–"}.` });
    checks.push({ id: "price", label: "Unit price vs PO", status: priceIssues ? "fail" : "pass", detail: priceIssues ? `${priceIssues} line(s) priced above the PO.` : "All prices match the PO." });
  }

  const fails = checks.filter((c) => c.status === "fail").length;
  const decision: DocumentResult["decision"] = isDup ? "reject" : fails ? "needs-approval" : "auto-approve";
  const summary = findings.length ? findings.join(" ") + (amountAtRisk > 0 ? ` Amount at risk: ${money(amountAtRisk)}.` : "") : `The invoice matches ${po?.id ?? "the purchase order"} on supplier, quantities, prices and goods receipt. It can be approved for payment.`;
  void matchedPo; // line-level results are reported in checks (multi-line PO)
  return { matchedPo: null, checks, decision, summary, amountAtRisk: Math.round(amountAtRisk * 100) / 100 };
}
