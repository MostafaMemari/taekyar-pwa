import useSWR from "swr";
import {
  fetchSession,
  fetchSessionStudentCount,
  fetchSessionStudentTotals,
  fetchSessions,
  SESSIONS_PAGE_SIZE,
} from "@/features/coach/lib/session-api";
import { swrReadOptions } from "@/lib/api/swr";

// Index 0 is always "session" so one filter revalidates the whole branch; index 1 is the class id or a list/counts sentinel.
const sessionKeys = {
  list: ["session", "list", SESSIONS_PAGE_SIZE] as const,
  detail: (id: string) => ["session", id] as const,
  students: (id: string) => ["session", id, "students"] as const,
  counts: (ids: string[]) => ["session", "counts", ids.join(",")] as const,
};

export function useSessions() {
  return useSWR(sessionKeys.list, fetchSessions, swrReadOptions);
}

export function useSession(id?: string) {
  return useSWR(id ? sessionKeys.detail(id) : null, ([, sessionId]) => fetchSession(sessionId), swrReadOptions);
}

export function useSessionStudentCount(id: string) {
  return useSWR(sessionKeys.students(id), ([, sessionId]) => fetchSessionStudentCount(sessionId), swrReadOptions);
}

export function useSessionStudentCounts(sessionIds: string[]) {
  return useSWR(sessionKeys.counts(sessionIds), () => fetchSessionStudentTotals(sessionIds), swrReadOptions);
}
