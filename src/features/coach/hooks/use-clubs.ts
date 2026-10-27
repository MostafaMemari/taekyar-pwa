import useSWR from "swr";
import { CLUBS_PAGE_SIZE, fetchClub, fetchClubStudentCount, fetchClubStudentTotals, fetchClubs } from "@/features/coach/lib/club-api";
import { ApiError } from "@/lib/api/client";

// Index 0 is always "club" so one filter revalidates the whole branch; index 1 is the club id or a list/counts sentinel.
const clubKeys = {
  list: ["club", "list", CLUBS_PAGE_SIZE] as const,
  detail: (id: string) => ["club", id] as const,
  students: (id: string) => ["club", id, "students"] as const,
  counts: (ids: string[]) => ["club", "counts", ids.join(",")] as const,
};

// A 401 or 403 will not fix itself between retries, so only network faults, throttling and server faults are retried.
function shouldRetryOnError(error: unknown) {
  if (!(error instanceof ApiError) || error.status === undefined) return true;
  return error.status >= 500 || error.status === 429;
}

const clubOptions = { revalidateOnFocus: false, shouldRetryOnError };

export function useClubs() {
  return useSWR(clubKeys.list, fetchClubs, clubOptions);
}

export function useClub(id?: string) {
  return useSWR(id ? clubKeys.detail(id) : null, ([, clubId]) => fetchClub(clubId), clubOptions);
}

export function useClubStudentCount(id: string) {
  return useSWR(clubKeys.students(id), ([, clubId]) => fetchClubStudentCount(clubId), clubOptions);
}

export function useClubStudentCounts(clubIds: string[]) {
  return useSWR(clubKeys.counts(clubIds), () => fetchClubStudentTotals(clubIds), clubOptions);
}
