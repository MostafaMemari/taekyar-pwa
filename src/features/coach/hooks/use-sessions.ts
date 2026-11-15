import { useEffect } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  fetchSession,
  fetchSessionStudentCount,
  fetchSessionStudentsPage,
  fetchSessionStudentTotals,
  fetchSessions,
  fetchStudentSessions,
  SESSIONS_PAGE_SIZE,
  type SessionStudentRow,
} from "@/features/coach/lib/session-api";
import { subscribeResource, swrReadOptions } from "@/lib/api/swr";

// Index 0 is always "session" so one filter revalidates the whole branch; index 1 is the class id or a list/counts sentinel.
const sessionKeys = {
  list: ["session", "list", SESSIONS_PAGE_SIZE] as const,
  detail: (id: string) => ["session", id] as const,
  students: (id: string) => ["session", id, "students"] as const,
  counts: (ids: string[]) => ["session", "counts", ids.join(",")] as const,
  byStudent: (id: string) => ["session", "by-student", id] as const,
};

export function useSessions() {
  return useSWR(sessionKeys.list, fetchSessions, swrReadOptions);
}

export function useStudentSessions(studentId: string) {
  return useSWR(studentId ? sessionKeys.byStudent(studentId) : null, ([, , id]) => fetchStudentSessions(id), swrReadOptions);
}

type SessionStudentsPage = { members: SessionStudentRow[]; total: number };

// Endless class roster; refreshes itself when the session resource is revalidated.
export function useSessionStudentsFeed(id: string) {
  const feed = useSWRInfinite(
    (index, previous: SessionStudentsPage | undefined) => {
      if (previous && previous.members.length === 0) return null;
      return ["session", "students", "feed", id, index + 1] as const;
    },
    ([, , , sessionId, page]) => fetchSessionStudentsPage(sessionId, page),
    swrReadOptions,
  );

  const pages = feed.data ?? [];
  const members = [...new Map(pages.flatMap((page) => page.members).map((member) => [member.studentId, member])).values()];
  const total = pages[0]?.total ?? 0;
  const hasMore = members.length < total;

  useEffect(() => subscribeResource("session", () => feed.mutate()), [feed.mutate]);

  return { ...feed, members, total, hasMore };
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
