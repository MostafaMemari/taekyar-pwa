import useSWR from "swr";
import { fetchBeltExams } from "@/features/coach/lib/exam-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useBeltExams() {
  return useSWR(["belt-exam", "list"] as const, fetchBeltExams, swrReadOptions);
}
