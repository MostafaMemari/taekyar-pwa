import { useEffect } from "react";
import useSWR from "swr";
import {
  type AbsentStudentsQuery,
  fetchAbsentStudents,
  fetchClassAttendance,
  fetchCoachWeeklySummary,
  fetchStudentAttendance,
} from "@/features/coach/lib/attendance-api";
import { subscribeResource, swrReadOptions } from "@/lib/api/swr";

export function useClassAttendance(classSessionId: string, date: string) {
  return useSWR(
    date ? (["attendance", "class", classSessionId, date] as const) : null,
    ([, , id, day]) => fetchClassAttendance(id, day),
    swrReadOptions,
  );
}

export function useStudentAttendance(studentId: string) {
  return useSWR(["attendance", "student", studentId] as const, ([, , id]) => fetchStudentAttendance(id), swrReadOptions);
}

export function useCoachWeeklyAttendance() {
  return useSWR(["attendance", "coach", "summary"] as const, fetchCoachWeeklySummary, swrReadOptions);
}

export function useAbsentStudents(query: AbsentStudentsQuery) {
  const swr = useSWR(
    ["attendance", "coach", "absent-students", query.minAbsences, query.clubId ?? ""] as const,
    () => fetchAbsentStudents(query),
    swrReadOptions,
  );

  // The debtor badge rides the fee state, so the report refreshes with the student resource.
  useEffect(() => subscribeResource("student", () => swr.mutate()), [swr.mutate]);

  return swr;
}
