import useSWR from "swr";
import { fetchStudents, type StudentQuery } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export function useStudents(query: StudentQuery) {
  return useSWR(["student", "list", query] as const, ([, , params]) => fetchStudents(params), {
    ...swrReadOptions,
    keepPreviousData: true,
  });
}
