/// <reference types="vite/client" />
// Browser-side PaddleOCR (PP-OCR via ONNX Runtime Web) and PDF rasterisation.
// Both libraries are loaded on demand so they never weigh down other pages.

export interface OcrLine {
  text: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
}
export interface OcrOutput {
  text: string;
  lines: OcrLine[];
  confidence: number;
  ms: number;
}

type Service = { initialize(): Promise<void>; recognize(img: HTMLCanvasElement, opts?: object): Promise<any> };
let servicePromise: Promise<Service> | null = null;

/** Loads PaddleOCR once (downloads ~6 MB of model weights on first use, then browser-cached). */
export function loadOcr(): Promise<Service> {
  if (!servicePromise) {
    servicePromise = (async () => {
      const mod = await import("ppu-paddle-ocr/web");
      const service = new mod.PaddleOcrService() as unknown as Service;
      await service.initialize();
      return service;
    })().catch((e) => {
      servicePromise = null;
      throw e;
    });
  }
  return servicePromise;
}

export async function runOcr(canvas: HTMLCanvasElement): Promise<OcrOutput> {
  const service = await loadOcr();
  const t0 = performance.now();
  const res = await service.recognize(canvas);
  const lines: OcrLine[] = (res.lines as Array<Array<{ text: string; confidence: number; box: OcrLine["box"] }>>).flatMap((row) =>
    row.map((w) => ({ text: w.text, confidence: w.confidence, box: w.box }))
  );
  return { text: String(res.text ?? ""), lines, confidence: Number(res.confidence ?? 0), ms: Math.round(performance.now() - t0) };
}

/** Renders the first page of a PDF to a canvas. */
export async function pdfToCanvas(file: File, scale = 2): Promise<HTMLCanvasElement> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
  return canvas;
}

export async function imageFileToCanvas(file: File, maxSide = 2000): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not read image"));
      i.src = url;
    });
    const s = Math.min(1, maxSide / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s);
    c.height = Math.round(img.height * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c;
  } finally {
    URL.revokeObjectURL(url);
  }
}
