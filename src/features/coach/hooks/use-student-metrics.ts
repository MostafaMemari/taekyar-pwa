import useSWR from "swr";
import { fetchStudentMetrics } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useStudentMetrics(studentId: string) {
  return useSWR(["student", "metrics", studentId] as const, ([, , id]) => fetchStudentMetrics(id), swrReadOptions);
}
