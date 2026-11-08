import useSWR from "swr";
import { fetchStudents, type StudentFeedQuery } from "@/features/coach/lib/student-api";
import { swrReadOptions } from "@/lib/api/swr";

export type ExamStudentRecord = { fullName: string; membershipYear: number | null };

// The backend caps take at 100, so «همه» walks the pages until the list is exhausted.
async function fetchExamStudents(query: StudentFeedQuery, limit: number | null): Promise<ExamStudentRecord[]> {
  const records: ExamStudentRecord[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && (limit === null || records.length < limit)) {
    const { students, pager } = await fetchStudents({ ...query, page, take: 100 });
    records.push(...students.map((student) => ({ fullName: student.fullName, membershipYear: student.membershipYear ?? null })));
    totalPages = pager?.totalPages ?? 1;
    page += 1;
  }

  return limit === null ? records : records.slice(0, limit);
}

export function useExamStudents(query: StudentFeedQuery, limit: number | null, enabled: boolean) {
  return useSWR(
    enabled ? (["student", "exam-students", JSON.stringify(query), limit] as const) : null,
    ([, , serialized, examLimit]) => fetchExamStudents(JSON.parse(serialized) as StudentFeedQuery, examLimit),
    swrReadOptions,
  );
}
