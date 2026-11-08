import useSWR from "swr";
import { fetchStudents, type StudentFeedQuery } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

// The backend caps take at 100, so «همه» walks the pages until the list is exhausted.
async function fetchExamNames(query: StudentFeedQuery, limit: number | null): Promise<string[]> {
  const names: string[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && (limit === null || names.length < limit)) {
    const { students, pager } = await fetchStudents({ ...query, page, take: 100 });
    names.push(...students.map((student) => student.fullName));
    totalPages = pager?.totalPages ?? 1;
    page += 1;
  }

  return limit === null ? names : names.slice(0, limit);
}

export function useExamNames(query: StudentFeedQuery, limit: number | null, enabled: boolean) {
  return useSWR(
    enabled ? (["student", "exam-names", JSON.stringify(query), limit] as const) : null,
    ([, , serialized, examLimit]) => fetchExamNames(JSON.parse(serialized) as StudentFeedQuery, examLimit),
    swrReadOptions,
  );
}
