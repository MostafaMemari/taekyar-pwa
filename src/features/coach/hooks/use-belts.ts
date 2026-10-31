import useSWR from "swr";
import { fetchBelts } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useBelts() {
  return useSWR(["belt", "list"] as const, fetchBelts, swrReadOptions);
}
