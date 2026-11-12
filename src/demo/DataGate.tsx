import React, { createContext, useContext, useEffect, useState } from "react";
import { Database } from "lucide-react";
import { getIndustrialData, getRetailData } from "./localData";
import type { DemoDataset } from "./data/types";
import type { RetailBase } from "./retail/model";
import { ScioLogo } from "./layout/ScioLogo";
import { Aurora } from "./ui";

// Builds the operations dataset in the browser (see localData.ts) before the
// app renders. Built once per page load and shared by Industrial and Retail.

const IndustrialCtx = createContext<DemoDataset | null>(null);
const RetailBaseCtx = createContext<RetailBase | null>(null);

export function DataGate({ retail = false, children }: { retail?: boolean; children: React.ReactNode }) {
  const [data, setData] = useState<{ industrial: DemoDataset; retail: RetailBase | null } | null>(null);

  useEffect(() => {
    // Yield one frame so the loading screen paints before the (≈1 s) build.
    const t = setTimeout(() => setData({ industrial: getIndustrialData(), retail: retail ? getRetailData() : null }), 30);
    return () => clearTimeout(t);
  }, [retail]);

  if (!data || (retail && !data.retail)) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center font-sans">
        <Aurora />
        <div className="scio-rise flex flex-col items-center">
          <ScioLogo size={48} />
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-600">
            <Database className="h-4 w-4 text-blue-600" />
            {retail ? "Loading 50 stores × 5,000 SKUs" : "Loading operations data"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <IndustrialCtx.Provider value={data.industrial}>
      <RetailBaseCtx.Provider value={data.retail}>{children}</RetailBaseCtx.Provider>
    </IndustrialCtx.Provider>
  );
}

export function useIndustrialData(): DemoDataset {
  const d = useContext(IndustrialCtx);
  if (!d) throw new Error("useIndustrialData must be used inside <DataGate>");
  return d;
}

export function useRetailBase(): RetailBase {
  const d = useContext(RetailBaseCtx);
  if (!d) throw new Error("useRetailBase must be used inside <DataGate retail>");
  return d;
}
