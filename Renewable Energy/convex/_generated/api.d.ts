/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiInsights from "../aiInsights.js";
import type * as alarms from "../alarms.js";
import type * as assets from "../assets.js";
import type * as audit from "../audit.js";
import type * as erp from "../erp.js";
import type * as finance from "../finance.js";
import type * as inspections from "../inspections.js";
import type * as inventory from "../inventory.js";
import type * as maintenance from "../maintenance.js";
import type * as metrics from "../metrics.js";
import type * as plants from "../plants.js";
import type * as procurement from "../procurement.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as workOrders from "../workOrders.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiInsights: typeof aiInsights;
  alarms: typeof alarms;
  assets: typeof assets;
  audit: typeof audit;
  erp: typeof erp;
  finance: typeof finance;
  inspections: typeof inspections;
  inventory: typeof inventory;
  maintenance: typeof maintenance;
  metrics: typeof metrics;
  plants: typeof plants;
  procurement: typeof procurement;
  reports: typeof reports;
  seed: typeof seed;
  workOrders: typeof workOrders;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
