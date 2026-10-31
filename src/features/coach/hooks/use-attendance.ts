import useSWR from "swr";
import { fetchClassAttendance, fetchCoachWeeklySummary, fetchStudentAttendance } from "@/features/coach/lib/attendance-api";
import { swrReadOptions } from "@/lib/api/swr";

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
