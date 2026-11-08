import useSWR from "swr";
import {
  CLUBS_PAGE_SIZE,
  fetchClub,
  fetchClubMembers,
  fetchClubStudentCount,
  fetchClubStudentTotals,
  fetchClubs,
  fetchStudentClubs,
} from "@/features/coach/lib/club-api";
import { swrReadOptions } from "@/lib/api/swr";

// Index 0 is always "club" so one filter revalidates the whole branch; index 1 is the club id or a list/counts sentinel.
const clubKeys = {
  list: ["club", "list", CLUBS_PAGE_SIZE] as const,
  detail: (id: string) => ["club", id] as const,
  students: (id: string) => ["club", id, "students"] as const,
  members: (id: string) => ["club", id, "members"] as const,
  byStudent: (id: string) => ["club", "by-student", id] as const,
  counts: (ids: string[]) => ["club", "counts", ids.join(",")] as const,
};

export function useClubs() {
  return useSWR(clubKeys.list, fetchClubs, swrReadOptions);
}

export function useClub(id?: string) {
  return useSWR(id ? clubKeys.detail(id) : null, ([, clubId]) => fetchClub(clubId), swrReadOptions);
}

export function useStudentClubs(studentId: string) {
  return useSWR(clubKeys.byStudent(studentId), ([, , id]) => fetchStudentClubs(id), swrReadOptions);
}

export function useClubStudentCount(id: string) {
  return useSWR(clubKeys.students(id), ([, clubId]) => fetchClubStudentCount(clubId), swrReadOptions);
}

export function useClubMembers(id: string) {
  return useSWR(clubKeys.members(id), ([, clubId]) => fetchClubMembers(clubId), swrReadOptions);
}

export function useClubStudentCounts(clubIds: string[]) {
  return useSWR(clubKeys.counts(clubIds), () => fetchClubStudentTotals(clubIds), swrReadOptions);
}
