import { useEffect } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  type AbsentStudentsQuery,
  fetchAbsentStudents,
  fetchClassAttendance,
  fetchClassAttendanceDates,
  fetchCoachWeeklySummary,
  fetchStudentAttendance,
  fetchStudentAttendancePage,
  fetchStudentAttendanceSummary,
  type StudentAttendanceEntry,
} from "@/features/coach/lib/attendance-api";
import { subscribeResource, swrReadOptions } from "@/lib/api/swr";

export function useClassAttendance(classSessionId: string, date: string) {
  return useSWR(
    date ? (["attendance", "class", classSessionId, date] as const) : null,
    ([, , id, day]) => fetchClassAttendance(id, day),
    swrReadOptions,
  );
}

export function useClassAttendanceDates(classSessionId: string) {
  return useSWR(["attendance", "class-dates", classSessionId] as const, ([, , id]) => fetchClassAttendanceDates(id), swrReadOptions);
}

export function useStudentAttendance(studentId: string) {
  return useSWR(["attendance", "student", studentId] as const, ([, , id]) => fetchStudentAttendance(id), swrReadOptions);
}

export function useStudentAttendanceSummary(studentId: string) {
  return useSWR(["attendance", "student-summary", studentId] as const, ([, , id]) => fetchStudentAttendanceSummary(id), swrReadOptions);
}

type StudentAttendancePage = { data: StudentAttendanceEntry[]; pager?: { page: number; totalPages: number } };

// Endless history for the report screen; refreshes itself when the attendance resource is revalidated.
export function useStudentAttendanceFeed(studentId: string) {
  const feed = useSWRInfinite(
    (index, previous: StudentAttendancePage | undefined) => {
      if (previous && (previous.data.length === 0 || (previous.pager && previous.pager.page >= previous.pager.totalPages))) return null;
      return ["attendance", "student-feed", studentId, index + 1] as const;
    },
    ([, , id, page]) => fetchStudentAttendancePage(id, page),
    swrReadOptions,
  );

  const pages = feed.data ?? [];
  const lastPage = pages[pages.length - 1];
  const hasMore = Boolean(lastPage?.data.length && (!lastPage.pager || lastPage.pager.page < lastPage.pager.totalPages));

  // Filter mutates skip infinite keys, so the feed refreshes itself when the attendance resource is revalidated.
  useEffect(() => subscribeResource("attendance", () => feed.mutate()), [feed.mutate]);

  return {
    ...feed,
    hasMore,
  };
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
