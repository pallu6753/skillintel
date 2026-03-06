import { useQuery } from "@tanstack/react-query";
import { loadDataset, type DataSet } from "@/lib/data-loader";

export function useDataset() {
  return useQuery<DataSet>({
    queryKey: ["dataset"],
    queryFn: loadDataset,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
