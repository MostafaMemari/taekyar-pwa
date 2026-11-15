import { useEffect } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import {
  CLUBS_PAGE_SIZE,
  type ClubMemberRecord,
  fetchClub,
  fetchClubMembers,
  fetchClubMembersPage,
  fetchClubStudentCount,
  fetchClubStudentTotals,
  fetchClubs,
  fetchStudentClubs,
} from "@/features/coach/lib/club-api";
import { subscribeResource, swrReadOptions } from "@/lib/api/swr";

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
  return useSWR(studentId ? clubKeys.byStudent(studentId) : null, ([, , id]) => fetchStudentClubs(id), swrReadOptions);
}

export function useClubStudentCount(id: string) {
  return useSWR(clubKeys.students(id), ([, clubId]) => fetchClubStudentCount(clubId), swrReadOptions);
}

export function useClubMembers(id: string, search?: string) {
  return useSWR(
    id ? ([...clubKeys.members(id), search ?? ""] as const) : null,
    ([, clubId, , term]) => fetchClubMembers(clubId, term || undefined),
    swrReadOptions,
  );
}

type ClubMembersPage = { members: ClubMemberRecord[]; total: number };

// Endless member feed for the club screen; a filter change restarts at page 1.
export function useClubMembersFeed(id: string, isActive: boolean | undefined) {
  const feed = useSWRInfinite(
    (index, previous: ClubMembersPage | undefined) => {
      if (previous && previous.members.length === 0) return null;
      return ["club", "members", "feed", id, isActive, index + 1] as const;
    },
    ([, , , clubId, active, page]) => fetchClubMembersPage(clubId, page, active),
    swrReadOptions,
  );

  const pages = feed.data ?? [];
  const members = [...new Map(pages.flatMap((page) => page.members).map((member) => [member.id, member])).values()];
  const total = pages[0]?.total ?? 0;
  const hasMore = members.length < total;

  // Filter mutates skip infinite keys, so the feed refreshes itself when the club resource is revalidated.
  useEffect(() => subscribeResource("club", () => feed.mutate()), [feed.mutate]);

  return { ...feed, members, total, hasMore };
}

export function useClubStudentCounts(clubIds: string[]) {
  return useSWR(clubKeys.counts(clubIds), () => fetchClubStudentTotals(clubIds), swrReadOptions);
}
