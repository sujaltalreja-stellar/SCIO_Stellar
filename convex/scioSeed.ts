import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateDataset } from "../src/demo/data/generate";
import { generatePosJournal, generateRetail, NSKU } from "../src/demo/retail/generate";
import { DEMO_ACCOUNTS } from "../src/demo/accounts";
import { randomHex, sha256Hex } from "./scioLib";

// ---------------------------------------------------------------------------
// Builds the complete SCIO demo database:
//   npx convex run scioSeed:seedAll
// Wipes every scio/ind/rt table, regenerates the synthetic dataset anchored to
// today, and writes it in batches. Accounts are re-created, so everyone signs
// in again and the action log starts empty.
// ---------------------------------------------------------------------------

const TABLES = [
  "scioAccounts",
  "scioSessions",
  "indWarehouses",
  "indSuppliers",
  "indItems",
  "indAssets",
  "indInspections",
  "indPurchaseOrders",
  "indInvoices",
  "indDowntime",
  "rtCountries",
  "rtStores",
  "rtDcs",
  "rtSkus",
  "rtSuppliers",
  "rtPurchaseOrders",
  "rtEquipment",
  "rtAudits",
  "rtPricingExceptions",
  "rtPromotions",
  "rtTasks",
  "rtTickets",
  "rtInventory",
  "rtDcStock",
  "rtStockPacks",
  "rtStoreDays",
  "rtPosTxns",
  "rtCalendar",
  "rtBasketPairs",
  "rtEvents",
] as const;
type SeedTable = (typeof TABLES)[number];

const tableValidator = v.union(
  v.literal("scioAccounts"),
  v.literal("scioSessions"),
  v.literal("indWarehouses"),
  v.literal("indSuppliers"),
  v.literal("indItems"),
  v.literal("indAssets"),
  v.literal("indInspections"),
  v.literal("indPurchaseOrders"),
  v.literal("indInvoices"),
  v.literal("indDowntime"),
  v.literal("rtCountries"),
  v.literal("rtStores"),
  v.literal("rtDcs"),
  v.literal("rtSkus"),
  v.literal("rtSuppliers"),
  v.literal("rtPurchaseOrders"),
  v.literal("rtEquipment"),
  v.literal("rtAudits"),
  v.literal("rtPricingExceptions"),
  v.literal("rtPromotions"),
  v.literal("rtTasks"),
  v.literal("rtTickets"),
  v.literal("rtInventory"),
  v.literal("rtDcStock"),
  v.literal("rtStockPacks"),
  v.literal("rtStoreDays"),
  v.literal("rtPosTxns"),
  v.literal("rtCalendar"),
  v.literal("rtBasketPairs"),
  v.literal("rtEvents"),
);

/** Delete up to `limit` documents from a table; returns how many were deleted. */
export const clearBatch = internalMutation({
  args: { table: tableValidator, limit: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query(args.table).take(args.limit);
    for (const r of rows) await ctx.db.delete(args.table, r._id);
    return rows.length;
  },
});

/** Insert a batch of documents (each validated against the table's schema). */
export const insertBatch = internalMutation({
  args: { table: tableValidator, rows: v.array(v.any()) },
  handler: async (ctx, args) => {
    for (const row of args.rows) await ctx.db.insert(args.table, row as never);
    return args.rows.length;
  },
});

export const writeMeta = internalMutation({
  args: { anchorDate: v.string(), companyName: v.string(), counts: v.record(v.string(), v.number()) },
  handler: async (ctx, args) => {
    const prev = await ctx.db
      .query("scioMeta")
      .withIndex("by_key", (q) => q.eq("key", "snapshot"))
      .unique();
    const doc = { key: "snapshot", ...args, version: (prev?.version ?? 0) + 1, seededAt: Date.now() };
    if (prev) await ctx.db.replace("scioMeta", prev._id, doc);
    else await ctx.db.insert("scioMeta", doc);
    return doc.version;
  },
});

/** Remove all `undefined` values (Convex documents cannot hold them). */
function clean<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

/** Workspace users with salted password hashes. */
async function buildAccounts() {
  const accounts = [];
  for (const [order, a] of DEMO_ACCOUNTS.entries()) {
    const salt = randomHex(16);
    accounts.push({
      email: a.email.toLowerCase(),
      name: a.name,
      role: a.role,
      retailRole: a.retailRole,
      ...(a.scope?.country ? { scopeCountry: a.scope.country } : {}),
      ...(a.scope?.store ? { scopeStore: a.scope.store } : {}),
      salt,
      passwordHash: await sha256Hex(`${salt}:${a.password}`),
      order,
    });
  }
  // Named workspace users (password stored only as a salted hash).
  accounts.push({
    email: "sujal.talreja@stellarmind.ai",
    name: "Sujal Talreja",
    role: "Administrator",
    retailRole: "HQ",
    salt: "6b6a54e278dd423ba92c83819d718752",
    passwordHash: "536e7b1fa60256a3b82806d328a6869d07c4680dfa90e5ab2843c41f2106bae9",
    order: accounts.length,
  });
  return accounts;
}

/** Recreate only the user accounts (signs everyone out). npx convex run scioSeed:seedAccounts */
export const seedAccounts = internalAction({
  args: {},
  handler: async (ctx) => {
    for (const table of ["scioSessions", "scioAccounts"] as const) {
      while ((await ctx.runMutation(internal.scioSeed.clearBatch, { table, limit: 500 })) > 0) {
        /* keep deleting */
      }
    }
    const accounts = await buildAccounts();
    await ctx.runMutation(internal.scioSeed.insertBatch, { table: "scioAccounts", rows: accounts });
    return accounts.map((a) => a.email);
  },
});

export const seedAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const started = Date.now();

    // 1. Wipe (small batches; if another run deletes the same rows, wait and retry)
    for (const table of TABLES) {
      const limit = table === "rtStockPacks" ? 10 : 1000;
      for (let attempt = 0; ; ) {
        try {
          if ((await ctx.runMutation(internal.scioSeed.clearBatch, { table, limit })) === 0) break;
          attempt = 0;
        } catch (e) {
          if (++attempt > 20 || !/changed while this mutation was being run|Too many/i.test(String(e))) throw e;
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
      }
    }

    // 2. Generate (deterministic for the anchor day)
    const anchor = new Date();
    const ds = generateDataset(anchor);
    const rb = generateRetail(anchor);
    const counts: Record<string, number> = {};

    // Writes are throttled by the deployment (bytes/second); back off and retry when limited.
    const insertWithRetry = async (table: SeedTable, rows: unknown[]) => {
      for (let attempt = 0; ; attempt++) {
        try {
          return await ctx.runMutation(internal.scioSeed.insertBatch, { table, rows });
        } catch (e) {
          if (attempt >= 8 || !/Too many (writes|bytes)|rate limit|overloaded/i.test(String(e))) throw e;
          await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
        }
      }
    };
    const put = async (table: SeedTable, rows: unknown[], batch: number, parallel = 2) => {
      const chunks: unknown[][] = [];
      for (let i = 0; i < rows.length; i += batch) chunks.push(rows.slice(i, i + batch));
      for (let i = 0; i < chunks.length; i += parallel) {
        await Promise.all(chunks.slice(i, i + parallel).map((c) => insertWithRetry(table, c)));
      }
      counts[table] = (counts[table] ?? 0) + rows.length;
    };
    const ordered = <T extends object>(rows: T[]) => rows.map((r, order) => ({ ...clean(r), order }));

    // 3. Accounts
    const accounts = await buildAccounts();
    await put("scioAccounts", accounts, 50);

    // 4. Industrial
    await put("indWarehouses", clean(ds.warehouses), 100);
    await put("indSuppliers", clean(ds.suppliers), 100);
    await put("indItems", clean(ds.items), 30);
    await put("indAssets", clean(ds.assets), 20);
    await put("indInspections", clean(ds.inspections), 500);
    await put("indPurchaseOrders", clean(ds.purchaseOrders), 500);
    await put("indInvoices", clean(ds.invoices), 500);
    await put("indDowntime", clean(ds.downtime), 500);

    // 5. Retail master data
    await put("rtCountries", ordered(rb.countries), 50);
    await put("rtStores", clean(rb.stores), 100);
    await put("rtDcs", clean(rb.dcs), 50);
    await put("rtSkus", clean(rb.skus), 500);
    await put("rtSuppliers", clean(rb.suppliers), 100);
    await put("rtPurchaseOrders", ordered(rb.pos), 400);
    await put("rtEquipment", ordered(rb.equipment), 300);
    await put("rtAudits", ordered(rb.audits), 500);
    await put("rtPricingExceptions", ordered(rb.pricingExceptions), 500);
    await put("rtPromotions", ordered(rb.promotions), 50);
    await put("rtTasks", ordered(rb.tasks), 500);
    await put("rtTickets", ordered(rb.tickets), 500);

    // 6. Row-level stock
    for (const s of rb.stores) {
      const rows = [];
      for (let k = 0; k < NSKU; k++) {
        const p = s.idx * NSKU + k;
        if (!rb.carried[p]) continue;
        rows.push({
          storeIdx: s.idx,
          skuIdx: k,
          storeId: s.id,
          skuId: rb.skus[k].id,
          onHand: rb.onHand[p],
          reserved: rb.reserved[p],
          damaged: rb.damaged[p],
          velocity: Math.round(rb.velocity[p] * 10000) / 10000,
          lastSaleDaysAgo: rb.lastSaleDaysAgo[p],
          discountPct: rb.discountPct[p],
          returns30: rb.returns30[p],
          ageDays: rb.ageDays[p],
          lyVelocity: Math.round(rb.lyVelocity[p] * 10000) / 10000,
        });
      }
      await put("rtInventory", rows, 1800);
    }
    for (const dc of rb.dcs) {
      const rows = [];
      for (let k = 0; k < NSKU; k++) {
        const qty = rb.dcStock[dc.idx * NSKU + k];
        if (qty) rows.push({ dcIdx: dc.idx, skuIdx: k, dcId: dc.id, skuId: rb.skus[k].id, qty });
      }
      await put("rtDcStock", rows, 2500);
    }

    // 7. Columnar packs (same numbers as the rows above)
    const packs = [];
    for (const s of rb.stores) {
      const a = s.idx * NSKU;
      const b = a + NSKU;
      packs.push({
        kind: "store" as const,
        idx: s.idx,
        carried: rb.carried.slice(a, b).buffer,
        onHand: rb.onHand.slice(a, b).buffer,
        reserved: rb.reserved.slice(a, b).buffer,
        damaged: rb.damaged.slice(a, b).buffer,
        velocity: rb.velocity.slice(a, b).buffer,
        lastSaleDaysAgo: rb.lastSaleDaysAgo.slice(a, b).buffer,
        discountPct: rb.discountPct.slice(a, b).buffer,
        returns30: rb.returns30.slice(a, b).buffer,
        ageDays: rb.ageDays.slice(a, b).buffer,
        lyVelocity: rb.lyVelocity.slice(a, b).buffer,
      });
    }
    for (const dc of rb.dcs) packs.push({ kind: "dc" as const, idx: dc.idx, onHand: rb.dcStock.slice(dc.idx * NSKU, dc.idx * NSKU + NSKU).buffer });
    await put("rtStockPacks", packs, 4, 2);

    // 8. Sales facts, POS journal, calendar and basket affinity
    await put("rtStoreDays", rb.storeDays, 1500);
    await put("rtPosTxns", generatePosJournal(rb), 600);
    await put("rtCalendar", clean(rb.calendar), 50);
    await put("rtBasketPairs", rb.basket, 100);

    const version: number = await ctx.runMutation(internal.scioSeed.writeMeta, { anchorDate: rb.anchorDate, companyName: ds.companyName, counts });
    return { anchorDate: rb.anchorDate, version, seconds: Math.round((Date.now() - started) / 1000), counts };
  },
});
