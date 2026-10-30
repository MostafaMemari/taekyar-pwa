import useSWR from "swr";
import { fetchStudentStats } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useStudentStats() {
  return useSWR(["student", "stats"], fetchStudentStats, swrReadOptions);
}
