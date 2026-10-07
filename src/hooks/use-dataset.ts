import { useQuery } from "@tanstack/react-query";
import { loadDataset, type DataSet } from "@/lib/data-loader";
import { measure } from "@/lib/perf";

export function useDataset() {
  return useQuery<DataSet>({
    queryKey: ["dataset"],
    queryFn: () => measure("Dashboard dataset load", "dashboard", loadDataset),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
