import { getIndustrialData } from "./data";
import { assetHealth, VIBRATION_ZONES } from "../../demo/data/assetHealth";
import { forecastAll } from "../../demo/data/forecast";
import { sarvamChat } from "./sarvam";

// Plain-language explanations generated from computed facts (never raw guessing).

const SYSTEM = `You are SCIO, an industrial operations assistant. Explain the computed facts you are given to a maintenance or operations manager.
Write 3-4 short sentences: what is happening, why it matters, and the recommended action with priority. Use **bold** for key numbers.
Use only the facts provided. Do not invent numbers. No headings, no bullet points.`;

export async function explainAsset(assetId: string, token?: string) {
  const ds = await getIndustrialData(token);
  const asset = ds.assets.find((a) => a.id === assetId);
  if (!asset) throw new Error("Unknown asset");
  const h = assetHealth(ds, asset);
  const parts = ds.items.filter((i) => asset.partIds.includes(i.id)).map((p) => ({ part: p.name, stock: p.stock, minimum: p.minStock }));
  const facts = {
    asset: asset.name,
    type: asset.type,
    site: asset.site,
    criticality: asset.criticality,
    runningHours: asset.runningHours,
    healthScore: h.healthScore,
    status: h.status,
    vibration: {
      last7DayAvgMmS: +h.vibration.recentMean.toFixed(2),
      baselineMmS: +h.vibration.baselineMean.toFixed(2),
      trendMmSPerDay: +h.vibration.slopePerDay.toFixed(3),
      alarmLimitMmS: VIBRATION_ZONES.alarm,
      projectedDaysToAlarm: h.daysToAlarm,
    },
    pressure: h.pressure ? { last7DayAvgBar: +h.pressure.recentMean.toFixed(2), baselineBar: +h.pressure.baselineMean.toFixed(2) } : null,
    maintenanceDaysOverdue: h.daysOverdue,
    lastService: asset.lastServiceDate,
    failedInspections12m: h.inspectionFails,
    spareParts: parts,
    riskDrivers: h.drivers,
  };
  const { message } = await sarvamChat({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: `Facts (JSON):\n${JSON.stringify(facts)}` },
    ],
    maxTokens: 400,
    temperature: 0.2,
  });
  return { explanation: (message.content ?? "").trim() };
}

export async function explainItem(itemId: string, token?: string) {
  const ds = await getIndustrialData(token);
  const f = forecastAll(ds).find((x) => x.item.id === itemId);
  if (!f) throw new Error("Unknown item");
  const sup = ds.suppliers.find((s) => s.id === f.item.supplierId);
  const facts = {
    item: f.item.name,
    sku: f.item.id,
    warehouse: ds.warehouses.find((w) => w.id === f.item.warehouseId)?.name,
    currentStock: f.item.stock,
    minimumStock: f.item.minStock,
    avgDailyUseLast30Days: +f.avgDaily30.toFixed(2),
    forecastDailyUseNext30Days: +f.forecastDaily30.toFixed(2),
    demandTrendPct: +(f.trendPct * 100).toFixed(1),
    forecastAccuracyBacktestPct: +(f.accuracy * 100).toFixed(0),
    unitsOnOrder: f.onOrder,
    daysUntilBelowMinimum: f.daysToCritical,
    daysUntilStockout: f.daysToStockout,
    supplier: sup?.name,
    leadTimeDays: f.item.leadTimeDays,
    recommendedOrderQty: f.recommendedQty,
    recommendedOrderValueAED: Math.round(f.recommendedCost),
    orderBy: f.orderBy,
    basis: "Holt-Winters forecast on 12 months of daily consumption with weekly seasonality",
  };
  const { message } = await sarvamChat({
    messages: [
      { role: "system", content: SYSTEM.replace("maintenance or operations manager", "procurement or warehouse manager") },
      { role: "user", content: `Facts (JSON):\n${JSON.stringify(facts)}` },
    ],
    maxTokens: 400,
    temperature: 0.2,
  });
  return { explanation: (message.content ?? "").trim() };
}
