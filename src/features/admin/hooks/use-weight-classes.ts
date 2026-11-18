import useSWR from "swr";
import { fetchWeightClasses } from "@/features/admin/lib/admin-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useWeightClasses() {
  return useSWR(["weight-class", "list"] as const, fetchWeightClasses, swrReadOptions);
}
