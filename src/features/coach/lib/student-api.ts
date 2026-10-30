import { authRequest, authRequestWithMeta } from "@/features/auth/api";
import type { Gender } from "@/features/coach/lib/coach-data";
import type { PagerMeta } from "@/lib/api/client";

export type StudentBeltRecord = {
  id: string;
  name: string;
  level: number;
};

export type StudentRecord = {
  id: string;
  userId: string | null;
  fullName: string;
  gender: Gender;
  nationalCode: string;
  birthDate: string | null;
  sportsInsuranceDate: string | null;
  currentBelt: { beltDate: string; belt: StudentBeltRecord } | null;
};

export type StudentQuery = {
  page: number;
  take: number;
  search?: string;
  belt?: string[];
  ageCategory?: string[];
  insurance?: string[];
  sortBy?: string;
  sortDirection?: string;
};

export type StudentInsuranceSummary = { valid: number; expiring: number; expired: number; none: number };

export type StudentStats = { total: number; byInsurance: StudentInsuranceSummary; expiringDays: number };

export type AgeCategoryRecord = {
  id: string;
  name: string;
  birthYearStart: number | null;
  birthYearEnd: number | null;
};

export const STUDENTS_PAGE_SIZE = 20;

function toQueryString(query: StudentQuery) {
  const params = new URLSearchParams({ page: String(query.page), take: String(query.take) });

  if (query.search) params.set("search", query.search);
  for (const belt of query.belt ?? []) params.append("belt", belt);
  for (const ageCategory of query.ageCategory ?? []) params.append("ageCategory", ageCategory);
  for (const insurance of query.insurance ?? []) params.append("insurance", insurance);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDirection) params.set("sortDirection", query.sortDirection);

  return params.toString();
}

export function fetchStudents(query: StudentQuery): Promise<{ students: StudentRecord[]; pager?: PagerMeta }> {
  return authRequestWithMeta<StudentRecord[]>(`student?${toQueryString(query)}`).then(({ data, pager }) => ({ students: data, pager }));
}

export function fetchStudentStats(): Promise<StudentStats> {
  return authRequest<StudentStats>("student/stats");
}

export function fetchAgeCategories(): Promise<AgeCategoryRecord[]> {
  return authRequestWithMeta<AgeCategoryRecord[]>("age-category?page=1&take=100").then(({ data }) => data);
}
