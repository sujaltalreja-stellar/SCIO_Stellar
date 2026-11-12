import { generateDataset } from "./data/generate";
import { generateRetail } from "./retail/generate";
import type { DemoDataset } from "./data/types";
import type { RetailBase } from "./retail/model";

// Operations data is generated in code from a fixed business date, so every
// user and the API server see identical figures. Convex is used only for
// accounts, sessions and the actions people take.

export const BUSINESS_DATE = "2026-11-12";

let industrial: DemoDataset | null = null;
let retail: RetailBase | null = null;

export function getIndustrialData(): DemoDataset {
  industrial ??= generateDataset(new Date(`${BUSINESS_DATE}T00:00:00Z`));
  return industrial;
}

export function getRetailData(): RetailBase {
  retail ??= generateRetail(new Date(`${BUSINESS_DATE}T00:00:00Z`));
  return retail;
}
