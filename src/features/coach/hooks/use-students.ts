import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { fetchStudents, STUDENTS_PAGE_SIZE, type StudentFeedQuery } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

// Endless feed: each scroll near the bottom appends the next page; a new query restarts at page 1.
export function useStudentsFeed(query: StudentFeedQuery) {
  const feed = useSWRInfinite(
    (index, previous) => {
      if (previous && (previous.students.length === 0 || (previous.pager && previous.pager.page >= previous.pager.totalPages))) return null;
      return ["student", "list", { ...query, page: index + 1 }] as const;
    },
    ([, , params]) => fetchStudents({ ...params, take: STUDENTS_PAGE_SIZE }),
    swrReadOptions,
  );

  const pages = feed.data ?? [];
  const lastPage = pages[pages.length - 1];
  const hasMore = Boolean(lastPage?.students.length && (!lastPage.pager || lastPage.pager.page < lastPage.pager.totalPages));

  // Offset pagination can overlap when the underlying data shifts between page fetches; keep the first occurrence only.
  const students = [...new Map(pages.flatMap((page) => page.students).map((student) => [student.id, student])).values()];

  return {
    ...feed,
    pages,
    students,
    total: pages[0]?.pager?.total,
    hasMore,
  };
}

// shortcut: the guest picker reads only the first 100 students; wire search-based paging when a coach's list outgrows it.
export function useStudentOptions(search: string) {
  return useSWR(
    ["student", "options", search] as const,
    ([, , term]) => fetchStudents({ page: 1, take: 100, search: term || undefined }).then(({ students }) => students),
    swrReadOptions,
  );
}
