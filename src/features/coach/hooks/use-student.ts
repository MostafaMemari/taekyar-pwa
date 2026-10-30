import useSWR from "swr";
import { fetchStudent } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useStudent(id: string) {
  return useSWR(["student", id] as const, ([, studentId]) => fetchStudent(studentId), swrReadOptions);
}
