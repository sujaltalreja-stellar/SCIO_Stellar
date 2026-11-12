import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAccount, sessionAccount } from "./scioLib";

// Read API for the SCIO demo dataset. Every query needs a session token.
// Sizes are fixed by the seed (see scioSeed.ts), so each read is bounded.

const strip = <T extends { _id: unknown; _creationTime: unknown }>({ _id, _creationTime, ...rest }: T) => rest;

/** Snapshot metadata; null when the session is not valid (e.g. after a reseed). */
export const snapshot = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!(await sessionAccount(ctx, args.token))) return null;
    const meta = await ctx.db
      .query("scioMeta")
      .withIndex("by_key", (q) => q.eq("key", "snapshot"))
      .unique();
    return meta ? { anchorDate: meta.anchorDate, companyName: meta.companyName, version: meta.version, seededAt: meta.seededAt, counts: meta.counts } : null;
  },
});

/** Industrial dataset (a few hundred records). */
export const industrial = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const [warehouses, suppliers, items, assets, inspections, purchaseOrders, invoices, downtime] = await Promise.all([
      ctx.db.query("indWarehouses").take(100),
      ctx.db.query("indSuppliers").take(500),
      ctx.db.query("indItems").take(2000),
      ctx.db.query("indAssets").take(1000),
      ctx.db.query("indInspections").take(5000),
      ctx.db.query("indPurchaseOrders").take(5000),
      ctx.db.query("indInvoices").take(5000),
      ctx.db.query("indDowntime").take(5000),
    ]);
    return {
      warehouses: warehouses.map(strip),
      suppliers: suppliers.map(strip),
      items: items.map(strip),
      assets: assets.map(strip),
      inspections: inspections.map(strip),
      purchaseOrders: purchaseOrders.map(strip),
      invoices: invoices.map(strip),
      downtime: downtime.map(strip),
    };
  },
});

/** Retail master and operational records (everything except SKUs and stock). */
export const retailMaster = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const [countries, stores, dcs, suppliers, pos, equipment, audits, pricingExceptions, promotions, tasks, tickets] = await Promise.all([
      ctx.db.query("rtCountries").withIndex("by_order").take(50),
      ctx.db.query("rtStores").withIndex("by_idx").take(500),
      ctx.db.query("rtDcs").withIndex("by_idx").take(50),
      ctx.db.query("rtSuppliers").withIndex("by_idx").take(500),
      ctx.db.query("rtPurchaseOrders").withIndex("by_order").take(4000),
      ctx.db.query("rtEquipment").withIndex("by_order").take(4000),
      ctx.db.query("rtAudits").withIndex("by_order").take(2000),
      ctx.db.query("rtPricingExceptions").withIndex("by_order").take(1000),
      ctx.db.query("rtPromotions").withIndex("by_order").take(200),
      ctx.db.query("rtTasks").withIndex("by_order").take(2000),
      ctx.db.query("rtTickets").withIndex("by_order").take(1000),
    ]);
    return {
      countries: countries.map(({ order: _o, ...c }) => strip(c)),
      stores: stores.map(strip),
      dcs: dcs.map(strip),
      suppliers: suppliers.map(strip),
      pos: pos.map(({ order: _o, ...x }) => strip(x)),
      equipment: equipment.map(({ order: _o, ...x }) => strip(x)),
      audits: audits.map(({ order: _o, ...x }) => strip(x)),
      pricingExceptions: pricingExceptions.map(({ order: _o, ...x }) => strip(x)),
      promotions: promotions.map(({ order: _o, ...x }) => strip(x)),
      tasks: tasks.map(({ order: _o, ...x }) => strip(x)),
      tickets: tickets.map(({ order: _o, ...x }) => strip(x)),
    };
  },
});

/** A slice of the SKU catalogue by index range [fromIdx, toIdx). */
export const retailSkus = query({
  args: { token: v.string(), fromIdx: v.number(), toIdx: v.number() },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const rows = await ctx.db
      .query("rtSkus")
      .withIndex("by_idx", (q) => q.gte("idx", args.fromIdx).lt("idx", args.toIdx))
      .take(Math.min(2000, Math.max(0, args.toIdx - args.fromIdx)));
    return rows.map(strip);
  },
});

/** Columnar stock packs for stores or DCs in [fromIdx, toIdx). */
export const retailStockPacks = query({
  args: { token: v.string(), kind: v.union(v.literal("store"), v.literal("dc")), fromIdx: v.number(), toIdx: v.number() },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const rows = await ctx.db
      .query("rtStockPacks")
      .withIndex("by_kind_and_idx", (q) => q.eq("kind", args.kind).gte("idx", args.fromIdx).lt("idx", args.toIdx))
      .take(Math.min(25, Math.max(0, args.toIdx - args.fromIdx)));
    return rows.map(strip);
  },
});

/** Row-level stock for one store x SKU (handy for lookups and integrations). */
export const inventoryRow = query({
  args: { token: v.string(), storeId: v.string(), skuId: v.string() },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const row = await ctx.db
      .query("rtInventory")
      .withIndex("by_storeId_and_skuId", (q) => q.eq("storeId", args.storeId).eq("skuId", args.skuId))
      .unique();
    return row ? strip(row) : null;
  },
});

/** POS sales facts (store x day), trading calendar and basket affinity. */
export const retailFacts = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const [storeDays, calendar, basket] = await Promise.all([
      ctx.db.query("rtStoreDays").withIndex("by_storeIdx_and_date").take(8000),
      ctx.db.query("rtCalendar").withIndex("by_start").take(200),
      ctx.db.query("rtBasketPairs").withIndex("by_lift").order("desc").take(100),
    ]);
    return { storeDays: storeDays.map(strip), calendar: calendar.map(strip), basket: basket.map(strip) };
  },
});

/** Today's POS tickets for one store (latest first). */
export const posJournal = query({
  args: { token: v.string(), storeIdx: v.number(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAccount(ctx, args.token);
    const rows = await ctx.db
      .query("rtPosTxns")
      .withIndex("by_storeIdx_and_at", (q) => q.eq("storeIdx", args.storeIdx))
      .order("desc")
      .take(Math.min(200, Math.max(1, args.limit ?? 120)));
    return rows.map(strip);
  },
});
