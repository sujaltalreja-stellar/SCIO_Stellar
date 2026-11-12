import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";
import { getIndustrialData as industrialLocal, getRetailData as retailLocal } from "../../demo/localData";
import type { DemoDataset } from "../../demo/data/types";
import type { RetailBase } from "../../demo/retail/model";

// The API checks the caller's session with Convex, then answers from the same
// in-code dataset the browser uses (src/demo/localData.ts).

export class NotSignedInError extends Error {
  constructor() {
    super("Your session has ended. Please sign in again.");
  }
}

let client: ConvexHttpClient | null = null;
function convex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  client ??= new ConvexHttpClient(url);
  return client;
}

async function requireSession(token: string | undefined) {
  if (!token) throw new NotSignedInError();
  const me = await convex().query(api.scioAuth.me, { token });
  if (!me) throw new NotSignedInError();
}

export async function getIndustrialData(token: string | undefined): Promise<DemoDataset> {
  await requireSession(token);
  return industrialLocal();
}

export async function getRetailData(token: string | undefined): Promise<RetailBase> {
  await requireSession(token);
  return retailLocal();
}
