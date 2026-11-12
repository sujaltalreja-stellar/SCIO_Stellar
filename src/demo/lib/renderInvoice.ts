import { invoiceTotals, type InvoiceDoc } from "../data/documents";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

/** Draws a supplier tax invoice onto an A4 canvas (150 dpi). */
export function renderInvoice(doc: InvoiceDoc): HTMLCanvasElement {
  const W = 1240;
  const H = 1754;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;
  const scanned = doc.channel === "Scan";

  g.fillStyle = scanned ? "#f4f2ec" : "#ffffff";
  g.fillRect(0, 0, W, H);
  if (scanned) {
    g.translate(W / 2, H / 2);
    g.rotate(-0.006);
    g.translate(-W / 2, -H / 2);
  }

  const M = 96;
  const text = (s: string, x: number, y: number, size = 22, weight = 400, color = "#1f2937", align: CanvasTextAlign = "left") => {
    g.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
    g.fillStyle = color;
    g.textAlign = align;
    g.fillText(s, x, y);
  };
  const line = (x1: number, y1: number, x2: number, y2: number, color = "#d1d5db", w = 2) => {
    g.strokeStyle = color;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(x1, y1);
    g.lineTo(x2, y2);
    g.stroke();
  };

  // Header band
  const accent = ["#1e3a8a", "#065f46", "#7c2d12"][Number(doc.id.slice(-1)) % 3];
  g.fillStyle = accent;
  g.fillRect(0, 0, W, 14);

  // Logo mark
  g.fillStyle = accent;
  g.beginPath();
  g.arc(M + 34, 130, 34, 0, Math.PI * 2);
  g.fill();
  text(doc.supplier.name.split(" ").map((w) => w[0]).join("").slice(0, 3), M + 34, 141, 26, 700, "#ffffff", "center");

  text(doc.supplier.name, M + 90, 120, 34, 700, "#111827");
  doc.supplier.address.forEach((a, i) => text(a, M + 90, 156 + i * 30, 21, 400, "#4b5563"));
  text(`TRN: ${doc.supplier.trn}`, M + 90, 216, 21, 400, "#4b5563");

  text("TAX INVOICE", W - M, 128, 46, 700, accent, "right");

  // Meta box
  const metaY = 290;
  const meta: Array<[string, string]> = [
    ["Invoice No.", doc.number],
    ["Invoice Date", fmtDate(doc.date)],
    ["PO Number", doc.poNumber],
    ["Payment Terms", doc.paymentTerms],
    ["Due Date", fmtDate(doc.dueDate)],
  ];
  g.fillStyle = scanned ? "#ebe8df" : "#f3f4f6";
  g.fillRect(W - M - 470, metaY - 40, 470, meta.length * 42 + 30);
  meta.forEach(([k, v], i) => {
    text(k, W - M - 445, metaY + i * 42, 21, 400, "#4b5563");
    text(v, W - M - 25, metaY + i * 42, 22, 700, "#111827", "right");
  });

  // Bill to
  text("BILL TO", M, metaY, 19, 700, "#6b7280");
  text("SCIO", M, metaY + 40, 28, 700, "#111827");
  text("Accounts Payable", M, metaY + 76, 21, 400, "#374151");
  text("Dubai Distribution Centre, Al Quoz Industrial 3", M, metaY + 106, 21, 400, "#374151");
  text("Dubai, United Arab Emirates", M, metaY + 136, 21, 400, "#374151");
  text("TRN: 100392847100003", M, metaY + 166, 21, 400, "#374151");

  // Line items table
  let y = 580;
  g.fillStyle = accent;
  g.fillRect(M, y, W - 2 * M, 52);
  const cols = [M + 18, M + 70, M + 250, W - M - 430, W - M - 230, W - M - 18];
  text("#", cols[0], y + 34, 20, 700, "#fff");
  text("Item Code", cols[1], y + 34, 20, 700, "#fff");
  text("Description", cols[2], y + 34, 20, 700, "#fff");
  text("Qty", cols[3], y + 34, 20, 700, "#fff", "right");
  text("Unit Price (AED)", cols[4], y + 34, 20, 700, "#fff", "right");
  text("Amount (AED)", cols[5], y + 34, 20, 700, "#fff", "right");
  y += 52;
  doc.lines.forEach((l, i) => {
    y += 58;
    text(String(i + 1), cols[0], y, 22);
    text(l.sku, cols[1], y, 22);
    text(l.description, cols[2], y, 22);
    text(String(l.quantity), cols[3], y, 22, 400, "#111827", "right");
    text(fmt(l.unitPrice), cols[4], y, 22, 400, "#111827", "right");
    text(fmt(l.quantity * l.unitPrice), cols[5], y, 22, 400, "#111827", "right");
    line(M, y + 24, W - M, y + 24);
  });

  // Totals
  const t = invoiceTotals(doc);
  y += 90;
  const tx = W - M - 430;
  const totals: Array<[string, string, boolean]> = [
    ["Subtotal", fmt(t.subtotal), false],
    [`VAT ${Math.round(doc.vatRate * 100)}%`, fmt(t.vat), false],
    ["Total Due (AED)", fmt(t.total), true],
  ];
  totals.forEach(([k, v, bold], i) => {
    if (bold) {
      g.fillStyle = scanned ? "#ebe8df" : "#f3f4f6";
      g.fillRect(tx - 20, y + i * 46 - 34, W - M - tx + 20, 50);
    }
    text(k, tx, y + i * 46, bold ? 24 : 22, bold ? 700 : 400, "#111827");
    text(v, W - M - 18, y + i * 46, bold ? 24 : 22, bold ? 700 : 400, "#111827", "right");
  });

  // Footer
  const fy = H - 260;
  line(M, fy, W - M, fy, "#e5e7eb");
  text("Bank details", M, fy + 46, 20, 700, "#374151");
  text(`Beneficiary: ${doc.supplier.name}`, M, fy + 80, 19, 400, "#4b5563");
  text("IBAN: AE07 0331 2345 6789 0123 456   ·   SWIFT: BOMLAEAD", M, fy + 110, 19, 400, "#4b5563");
  text("Please quote the invoice number with your payment. Goods remain our property until paid in full.", M, fy + 160, 18, 400, "#6b7280");

  if (scanned) {
    // Light scan noise
    const img = g.getImageData(0, 0, W, H);
    for (let i = 0; i < img.data.length; i += 4 * 7) {
      const n = (Math.sin(i * 12.9898) * 43758.5453) % 1;
      const d = Math.round(n * 14);
      img.data[i] -= d;
      img.data[i + 1] -= d;
      img.data[i + 2] -= d;
    }
    g.putImageData(img, 0, 0);
  }
  return canvas;
}
