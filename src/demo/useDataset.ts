import { useIndustrialData } from "./DataGate";

/** The industrial dataset, loaded from Convex by <DataGate>. */
export function useDataset() {
  return useIndustrialData();
}
