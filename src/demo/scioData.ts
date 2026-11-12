import type { FunctionArgs, FunctionReference, FunctionReturnType } from "convex/server";
import { api } from "../../convex/_generated/api";
import type { DemoDataset } from "./data/types";
import type { RetailBase } from "./retail/model";
import { generateRetail, NSKU } from "./retail/generate";

// ---------------------------------------------------------------------------
// Loads the SCIO dataset from Convex and rebuilds the in-memory structures the
// analytics expect. Shared by the browser (ConvexReactClient) and the API
// server (ConvexHttpClient): both expose `query(ref, args)`.
// ---------------------------------------------------------------------------

export interface QueryClient {
  query<Q extends FunctionReference<"query">>(ref: Q, args: FunctionArgs<Q>): Promise<FunctionReturnType<Q>>;
}

export type Snapshot = NonNullable<FunctionReturnType<typeof api.scioData.snapshot>>;

export async function fetchSnapshot(c: QueryClient, token: string): Promise<Snapshot | null> {
  return await c.query(api.scioData.snapshot, { token });
}

export async function fetchIndustrial(c: QueryClient, token: string, snap: Snapshot): Promise<DemoDataset> {
  const d = await c.query(api.scioData.industrial, { token });
  return { companyName: snap.companyName, anchorDate: snap.anchorDate, ...d } as unknown as DemoDataset;
}

const SKU_CHUNK = 1000;
const PACK_CHUNK = 10;

export async function fetchRetail(c: QueryClient, token: string, snap: Snapshot, onProgress?: (done: number, total: number) => void): Promise<RetailBase> {
  const nSkus = snap.counts.rtSkus ?? NSKU;
  const nStores = snap.counts.rtStores ?? 50;
  const nDcs = snap.counts.rtDcs ?? 6;

  const jobs: Array<Promise<unknown>> = [];
  let done = 0;
  const track = <T,>(p: Promise<T>) => {
    jobs.push(p);
    return p.then((r) => {
      onProgress?.(++done, total);
      return r;
    });
  };

  const masterP = track(c.query(api.scioData.retailMaster, { token }));
  const skuPs: Array<Promise<Array<Record<string, unknown>>>> = [];
  for (let i = 0; i < nSkus; i += SKU_CHUNK) skuPs.push(track(c.query(api.scioData.retailSkus, { token, fromIdx: i, toIdx: Math.min(nSkus, i + SKU_CHUNK) })));
  const factsP = track(c.query(api.scioData.retailFacts, { token }));
  const packPs: Array<Promise<Array<{ kind: "store" | "dc"; idx: number; carried?: ArrayBuffer; onHand: ArrayBuffer; reserved?: ArrayBuffer; damaged?: ArrayBuffer; velocity?: ArrayBuffer; lastSaleDaysAgo?: ArrayBuffer; discountPct?: ArrayBuffer; returns30?: ArrayBuffer; ageDays?: ArrayBuffer; lyVelocity?: ArrayBuffer }>>> = [];
  for (let i = 0; i < nStores; i += PACK_CHUNK) packPs.push(track(c.query(api.scioData.retailStockPacks, { token, kind: "store", fromIdx: i, toIdx: Math.min(nStores, i + PACK_CHUNK) })));
  packPs.push(track(c.query(api.scioData.retailStockPacks, { token, kind: "dc", fromIdx: 0, toIdx: nDcs })));
  const total = jobs.length;
  onProgress?.(0, total);

  const [master, skuChunks, packChunks, facts] = await Promise.all([masterP, Promise.all(skuPs), Promise.all(packPs), factsP]);

  const carried = new Uint8Array(nStores * NSKU);
  const onHand = new Int32Array(nStores * NSKU);
  const reserved = new Int32Array(nStores * NSKU);
  const damaged = new Int32Array(nStores * NSKU);
  const velocity = new Float32Array(nStores * NSKU);
  const lastSaleDaysAgo = new Uint8Array(nStores * NSKU);
  const dcStock = new Int32Array(nDcs * NSKU);
  const discountPct = new Uint8Array(nStores * NSKU);
  const returns30 = new Uint16Array(nStores * NSKU);
  const ageDays = new Uint16Array(nStores * NSKU);
  const lyVelocity = new Float32Array(nStores * NSKU);
  let hasCommercial = true;

  for (const pack of packChunks.flat()) {
    const off = pack.idx * NSKU;
    if (pack.kind === "dc") {
      dcStock.set(new Int32Array(pack.onHand), off);
      continue;
    }
    if (pack.carried) carried.set(new Uint8Array(pack.carried), off);
    onHand.set(new Int32Array(pack.onHand), off);
    if (pack.reserved) reserved.set(new Int32Array(pack.reserved), off);
    if (pack.damaged) damaged.set(new Int32Array(pack.damaged), off);
    if (pack.velocity) velocity.set(new Float32Array(pack.velocity), off);
    if (pack.lastSaleDaysAgo) lastSaleDaysAgo.set(new Uint8Array(pack.lastSaleDaysAgo), off);
    if (pack.discountPct && pack.returns30 && pack.ageDays && pack.lyVelocity) {
      discountPct.set(new Uint8Array(pack.discountPct), off);
      returns30.set(new Uint16Array(pack.returns30), off);
      ageDays.set(new Uint16Array(pack.ageDays), off);
      lyVelocity.set(new Float32Array(pack.lyVelocity), off);
    } else hasCommercial = false;
  }

  const skuRows = skuChunks.flat().sort((a, b) => (a.idx as number) - (b.idx as number));
  // Older snapshots (seeded before the product-master upgrade) lack some fields:
  // rebuild only those, deterministically, from the same anchor day.
  const complete = hasCommercial && facts.storeDays.length > 0 && skuRows.every((r) => r.landedCost !== undefined);
  const generated = complete ? null : generateRetail(new Date(`${snap.anchorDate}T00:00:00Z`));
  const skus = generated ? skuRows.map((sku, idx) => ({ ...generated.skus[idx], ...Object.fromEntries(Object.entries(sku).filter(([, v]) => v !== undefined)) })) : skuRows;

  return {
    anchorDate: snap.anchorDate,
    ...master,
    skus,
    carried,
    onHand,
    reserved,
    damaged,
    velocity,
    lastSaleDaysAgo,
    dcStock,
    discountPct: generated && !hasCommercial ? generated.discountPct : discountPct,
    returns30: generated && !hasCommercial ? generated.returns30 : returns30,
    ageDays: generated && !hasCommercial ? generated.ageDays : ageDays,
    lyVelocity: generated && !hasCommercial ? generated.lyVelocity : lyVelocity,
    storeDays: facts.storeDays.length ? facts.storeDays : generated!.storeDays,
    calendar: facts.calendar.length ? facts.calendar : generated!.calendar,
    basket: facts.basket.length ? facts.basket : generated!.basket,
  } as unknown as RetailBase;
}
